import React, { useState, useEffect } from 'react';
import { 
  myPlayer, 
  usePlayersList, 
  useIsHost, 
  useMultiplayerState, 
  getRoomCode 
} from 'playroomkit';
import { initializeGameState, getNextPlayerIndex, canPlayCard, getCardEffect } from '../game/utils';
import { GAME_PHASES } from '../game/types';
import PlayerHand from './game/PlayerHand';
import GameBoard from './game/GameBoard';
import GameLogs from './game/GameLogs';

const Game = () => {
  // PlayroomKit hooks
  const player = myPlayer();
  const roomCode = getRoomCode();
  const isHost = useIsHost();
  const players = usePlayersList(true);
  
  // Game state using PlayroomKit's useMultiplayerState
  const [gameState, setGameState] = useMultiplayerState('gameState', null);
  
  // Local states
  const [selectedCard, setSelectedCard] = useState(null);
  const [myHand, setMyHand] = useState([]);
  const [hasDrawnThisTurn, setHasDrawnThisTurn] = useState(false);
  
  // Initialize game when host joins
  useEffect(() => {
    if (isHost && !gameState) {
      // Initialize the game
      const initialState = initializeGameState(players.length);
      setGameState(initialState, true); // Use reliable sync for game state
    }
  }, [isHost, players.length, gameState, setGameState]);
  
  // Update local hand when game state changes
  useEffect(() => {
    if (gameState && player) {
      const playerIndex = players.findIndex(p => p.id === player.id);
      if (playerIndex >= 0 && gameState.hands && gameState.hands[playerIndex]) {
        setMyHand(gameState.hands[playerIndex]);
      }
      
      // Reset hasDrawnThisTurn when it becomes the player's turn
      if (gameState.currentPlayerIndex === playerIndex) {
        // Only reset if it's a new turn (not after playing a card that lets you play again)
        if (!hasDrawnThisTurn) {
          setHasDrawnThisTurn(false);
        }
      }
    }
  }, [gameState, player, players, hasDrawnThisTurn]);
  
  // Handle card selection from player hand
  const handleCardClick = (card, index) => {
    // Check if it's the player's turn
    if (gameState.currentPlayerIndex !== players.findIndex(p => p.id === player.id)) {
      return;
    }
    
    // Check if the card can be played
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    let canPlay = false;
    
    // Handling different game phases
    if (gameState.gamePhase === GAME_PHASES.SUIT_SELECTION) {
      return; // Wait for suit selection
    } else if (gameState.gamePhase === GAME_PHASES.GURA) {
      // In GURA, can only play cards of the same value as the initiator
      canPlay = card.value === topCard.value;
    } else if (gameState.drawCount > 0) {
      // Handling draw chains (7s or black Jacks)
      if (gameState.chainType === 'draw_chain' && card.value === '7') {
        canPlay = true;
      } else if (gameState.chainType === 'draw_ten' && card.value === 'jack' && 
                (card.suit === 'clubs' || card.suit === 'spades')) {
        canPlay = true;
      } else if (gameState.chainType === 'draw_ten_response' && card.value === 'jack' && 
                (card.suit === 'hearts' || card.suit === 'diamonds')) {
        canPlay = true;
      } else {
        canPlay = false;
      }
    } else {
      // Normal play - check if card matches suit or value
      canPlay = canPlayCard(topCard, card, gameState.wildSuit);
    }
    
    if (canPlay) {
      // Play the card
      playCard(card, index);
    }
  };
  
  // Handle playing a card
  const playCard = (card, index) => {
    if (!gameState) return;
    
    const newGameState = { ...gameState };
    const playerIndex = players.findIndex(p => p.id === player.id);
    
    // Remove the card from player's hand
    const newHands = [...newGameState.hands];
    const playerHand = [...newHands[playerIndex]];
    playerHand.splice(index, 1);
    newHands[playerIndex] = playerHand;
    
    // Add card to discard pile
    const newDiscardPile = [...newGameState.discardPile, card];
    
    // Add log
    const newLogs = [...newGameState.logs, {
      message: `${player.getProfile().name} played ${card.suit} ${card.value}`,
      timestamp: Date.now()
    }];
    
    // Process card effect
    const effect = getCardEffect(card);
    let newCurrentPlayerIndex = playerIndex;
    let newDirection = newGameState.direction;
    let newGamePhase = newGameState.gamePhase;
    let newWildSuit = newGameState.wildSuit;
    let newDrawCount = newGameState.drawCount;
    let newChainType = newGameState.chainType;
    let newLastPlayerIndex = newGameState.lastPlayerIndex;
    
    switch (effect.type) {
      case 'wild':
        // Ace - wild card
        newGamePhase = GAME_PHASES.SUIT_SELECTION;
        // Store the player index who played the Ace
        newLastPlayerIndex = playerIndex;
        break;
        
      case 'draw_two':
        // 2 - draw 2 cards
        const prevPlayer = getNextPlayerIndex(
          playerIndex, 
          players.length, 
          newDirection === 'clockwise' ? 'counter_clockwise' : 'clockwise'
        );
        
        // Add cards to previous player's hand
        for (let i = 0; i < 2; i++) {
          if (newGameState.deck.length > 0) {
            const drawnCard = newGameState.deck.pop();
            newHands[prevPlayer].push(drawnCard);
          }
        }
        
        newLogs.push({
          message: `${players[prevPlayer].getProfile().name} draws 2 cards`,
          timestamp: Date.now()
        });
        
        // In any case, the player who threw the 2 gets to play again
        newCurrentPlayerIndex = playerIndex;
        
        break;
        
      case 'reverse':
        // 3 - reverse direction
        newDirection = newDirection === 'clockwise' ? 'counter_clockwise' : 'clockwise';
        
        // In 2-player games, 3 acts like an 8 (play again)
        if (players.length === 2) {
          // Player plays again
          newCurrentPlayerIndex = playerIndex;
        } else {
          // Move to the next player in the new direction
          newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
        }
        
        newLogs.push({
          message: `${player.getProfile().name} reversed the direction of play`,
          timestamp: Date.now()
        });
        break;
        
      case 'draw_chain':
        // 7 - start or continue a draw chain
        if (newChainType === 'draw_chain') {
          // Continue the chain
          newDrawCount += 2;
          newLogs.push({
            message: `${player.getProfile().name} added to the chain! Next player draws ${newDrawCount} cards or plays a 7`,
            timestamp: Date.now()
          });
        } else {
          // Start a new chain
          newChainType = 'draw_chain';
          newDrawCount = 2;
          newLogs.push({
            message: `${player.getProfile().name} started a chain! Next player draws 2 cards or plays a 7`,
            timestamp: Date.now()
          });
        }
        
        // Move to the next player
        newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
        break;
        
      case 'play_again':
        // 8 - play again
        newCurrentPlayerIndex = playerIndex; // Stay with the current player
        
        newLogs.push({
          message: `${player.getProfile().name} plays again!`,
          timestamp: Date.now()
        });
        break;
        
      case 'skip':
        // 9 - skip next player
        // In 2-player games, 9 acts like an 8 (play again)
        if (players.length === 2) {
          // Player plays again
          newCurrentPlayerIndex = playerIndex;
        } else {
          // Skip the next player
          newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection, true);
        }
        
        newLogs.push({
          message: `${players[getNextPlayerIndex(playerIndex, players.length, newDirection)].getProfile().name}'s turn is skipped`,
          timestamp: Date.now()
        });
        break;
        
      case 'draw_ten':
        // Black Jack - start or continue a draw 10 chain
        if (newChainType === 'draw_ten') {
          // Continue the chain
          newDrawCount += 10;
          newLogs.push({
            message: `${player.getProfile().name} added to the chain! Next player draws ${newDrawCount} cards or plays a black Jack`,
            timestamp: Date.now()
          });
        } else {
          // Start a new chain
          newChainType = 'draw_ten';
          newDrawCount = 10;
          newLogs.push({
            message: `${player.getProfile().name} started a chain! Next player draws 10 cards or plays a black Jack`,
            timestamp: Date.now()
          });
        }
        
        // Move to the next player
        newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
        break;
        
      case 'negate':
        // Red Jack - negate a black Jack's effect
        if (newChainType === 'draw_ten' || newChainType === 'draw_ten_response') {
          newLogs.push({
            message: `${player.getProfile().name} negated the black Jack with a red Jack!`,
            timestamp: Date.now()
          });
          
          // Reset the chain
          newChainType = null;
          newDrawCount = 0;
        }
        
        // Move to the next player
        newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
        break;
        
      case 'gura':
        // King or Queen - start a GURA round if player has more in hand
        const hasSameValueCards = playerHand.some(c => c.value === card.value);
        
        if (hasSameValueCards) {
          // Start GURA round
          newGamePhase = GAME_PHASES.GURA;
          newChainType = 'gura';
          
          newLogs.push({
            message: `${player.getProfile().name} started a GURA round with a ${card.value}!`,
            timestamp: Date.now()
          });
        }
        
        // Move to the next player
        newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
        break;
        
      default:
        // Normal card - just move to the next player
        newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
        break;
    }
    
    // Check if player has won
    if (playerHand.length === 0) {
      newGamePhase = GAME_PHASES.GAME_OVER;
      newLogs.push({
        message: `${player.getProfile().name} has won the game!`,
        timestamp: Date.now()
      });
    }
    
    // For cards that let you play again (8, or 3 in 2-player), reset hasDrawnThisTurn if staying with same player
    if (newCurrentPlayerIndex === playerIndex && effect.type !== 'normal') {
      setHasDrawnThisTurn(false); // Reset so player needs to draw again
    }
    
    // If the player's turn is changing, reset hasDrawnThisTurn
    if (newCurrentPlayerIndex !== playerIndex) {
      setHasDrawnThisTurn(false);
    }
    
    // Update game state
    setGameState({
      ...newGameState,
      hands: newHands,
      discardPile: newDiscardPile,
      currentPlayerIndex: newCurrentPlayerIndex,
      direction: newDirection,
      gamePhase: newGamePhase,
      wildSuit: newWildSuit,
      drawCount: newDrawCount,
      chainType: newChainType,
      lastPlayerIndex: newLastPlayerIndex,
      logs: newLogs,
      winner: playerHand.length === 0 ? player.id : null
    }, true); // Use reliable sync for important game state changes
  };
  
  // Handle drawing a card from the deck
  const handleDeckClick = () => {
    if (!gameState) return;
    
    // Check if it's the player's turn
    const playerIndex = players.findIndex(p => p.id === player.id);
    
    if (gameState.currentPlayerIndex !== playerIndex) {
      return;
    }
    
    const newGameState = { ...gameState };
    const newHands = [...newGameState.hands];
    const playerHand = [...newHands[playerIndex]];
    
    // If there's a draw chain active, draw multiple cards
    if (gameState.drawCount > 0) {
      for (let i = 0; i < gameState.drawCount; i++) {
        if (newGameState.deck.length > 0) {
          const drawnCard = newGameState.deck.pop();
          playerHand.push(drawnCard);
        }
      }
      
      // Reset the chain
      newGameState.chainType = null;
      newGameState.drawCount = 0;
      
      // Log
      newGameState.logs.push({
        message: `${player.getProfile().name} drew ${gameState.drawCount} cards`,
        timestamp: Date.now()
      });
      
      // Player continues their turn after drawing cards from any effect
      newGameState.logs.push({
        message: `${player.getProfile().name} continues their turn`,
        timestamp: Date.now()
      });
      
      // Don't change the current player - they continue their turn
    } else {
      // Regular draw - just one card
      if (newGameState.deck.length > 0) {
        const drawnCard = newGameState.deck.pop();
        playerHand.push(drawnCard);
      }
      
      // Log
      newGameState.logs.push({
        message: `${player.getProfile().name} drew a card`,
        timestamp: Date.now()
      });

      // Drawing a card doesn't end the player's turn automatically
    }
    
    // Update player's hand
    newHands[playerIndex] = playerHand;
    
    // Mark that the player has drawn a card this turn
    setHasDrawnThisTurn(true);
    
    // If we're in GURA phase, handle special logic
    if (gameState.gamePhase === GAME_PHASES.GURA) {
      // Move to the next player
      const nextPlayerIndex = getNextPlayerIndex(
        playerIndex, 
        players.length, 
        newGameState.direction
      );
      
      // If we've gone full circle back to the player who started GURA,
      // end the GURA phase
      if (nextPlayerIndex === gameState.currentPlayerIndex) {
        newGameState.gamePhase = GAME_PHASES.PLAYING;
        newGameState.chainType = null;
        
        newGameState.logs.push({
          message: `GURA round ended`,
          timestamp: Date.now()
        });
      } else {
        newGameState.currentPlayerIndex = nextPlayerIndex;
      }
    }
    // Otherwise, drawing doesn't end turn - player needs to pass explicitly
    
    // Update game state
    setGameState({
      ...newGameState,
      hands: newHands
    }, true); // Use reliable sync for game state
  };
  
  // Handle suit selection for wild cards (Aces)
  const handleSuitSelect = (suit) => {
    if (!gameState || gameState.gamePhase !== GAME_PHASES.SUIT_SELECTION) {
      return;
    }
    
    const playerIndex = players.findIndex(p => p.id === player.id);
    
    // Only the player who played the Ace can select the suit
    if (playerIndex !== gameState.lastPlayerIndex) {
      return;
    }
    
    const newGameState = { ...gameState };
    
    // Set the wild suit
    newGameState.wildSuit = suit;
    
    // Return to regular play
    newGameState.gamePhase = GAME_PHASES.PLAYING;
    
    // Add log
    newGameState.logs.push({
      message: `${player.getProfile().name} selected ${suit} as the active suit`,
      timestamp: Date.now()
    });
    
    // Move to the next player
    newGameState.currentPlayerIndex = getNextPlayerIndex(
      playerIndex,
      players.length, 
      newGameState.direction
    );
    
    // Update game state
    setGameState(newGameState, true); // Use reliable sync for game state
  };
  
  // Handle pass turn button
  const handlePassTurn = () => {
    if (!gameState) return;
    
    // Check if it's the player's turn
    const playerIndex = players.findIndex(p => p.id === player.id);
    
    if (gameState.currentPlayerIndex !== playerIndex) {
      return;
    }
    
    // Check if the player has drawn a card this turn
    if (!hasDrawnThisTurn) {
      // Cannot pass turn without drawing
      return;
    }
    
    const newGameState = { ...gameState };
    
    // Log
    newGameState.logs.push({
      message: `${player.getProfile().name} passed their turn`,
      timestamp: Date.now()
    });
    
    // Move to the next player
    newGameState.currentPlayerIndex = getNextPlayerIndex(
      playerIndex, 
      players.length, 
      newGameState.direction
    );
    
    // Reset hasDrawnThisTurn for the next turn
    setHasDrawnThisTurn(false);
    
    // Update game state
    setGameState(newGameState, true); // Use reliable sync for game state
  };
  
  // Start a new game
  const startNewGame = () => {
    if (!isHost) return;
    
    // Initialize new game
    const initialState = initializeGameState(players.length);
    
    // Update game state
    setGameState(initialState, true); // Use reliable sync for game state
  };
  
  // If game state hasn't been initialized yet
  if (!gameState) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading game...</h2>
        {isHost && (
          <button 
            onClick={startNewGame}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#f4a261',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Start New Game
          </button>
        )}
      </div>
    );
  }
  
  // Map players to a format the GameBoard can use
  const boardPlayers = players.map((p, index) => ({
    id: p.id,
    name: p.getProfile().name,
    cards: gameState.hands[index] ? gameState.hands[index].length : 0,
    isCurrentPlayer: index === gameState.currentPlayerIndex
  }));
  
  // Show game over screen if there's a winner
  if (gameState.gamePhase === GAME_PHASES.GAME_OVER) {
    const winnerPlayer = players.find(p => p.id === gameState.winner);
    
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Game Over!</h2>
        <h3>{winnerPlayer ? winnerPlayer.getProfile().name : 'Someone'} has won!</h3>
        
        {isHost && (
          <button 
            onClick={startNewGame}
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#f4a261',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Start New Game
          </button>
        )}
      </div>
    );
  }
  
  return (
    <div className="game-container" style={{ 
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#fff',
      overflow: 'hidden'
    }}>
      {/* Navbar with player information */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: '#264653',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', marginRight: '15px' }}>Room: {roomCode}</span>
          <span>Direction: {gameState.direction === 'clockwise' ? '→' : '←'}</span>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          {boardPlayers.map((p) => (
            <div 
              key={p.id} 
              style={{ 
                padding: '5px 10px', 
                backgroundColor: p.isCurrentPlayer ? '#f4a261' : '#e9c46a',
                borderRadius: '5px',
                color: '#264653',
                fontWeight: p.isCurrentPlayer ? 'bold' : 'normal',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '80px'
              }}
            >
              <span style={{ fontSize: '14px' }}>{p.name}</span>
              <span style={{ fontSize: '12px' }}>{p.cards} cards</span>
            </div>
          ))}
        </div>
      </div>

      {/* Turn indicator */}
      <div style={{
        padding: '5px 15px',
        backgroundColor: gameState.currentPlayerIndex === players.findIndex(p => p.id === player.id) 
          ? '#f4a261' 
          : '#e9c46a',
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#264653',
        borderBottom: '1px solid #eaeaea'
      }}>
        {gameState.currentPlayerIndex === players.findIndex(p => p.id === player.id) 
          ? "It's your turn!" 
          : `Waiting for ${players[gameState.currentPlayerIndex]?.getProfile().name || 'other player'} to play...`}
      </div>
      
      {/* Game board */}
      <div style={{ padding: '10px', flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <GameBoard 
          discardPile={gameState.discardPile}
          deckCount={gameState.deck.length}
          onDeckClick={handleDeckClick}
          currentPlayerIndex={gameState.currentPlayerIndex}
          direction={gameState.direction}
          onSuitSelect={handleSuitSelect}
          gamePhase={gameState.gamePhase}
          wildSuit={gameState.wildSuit}
          drawCount={gameState.drawCount}
          chainType={gameState.chainType}
          players={boardPlayers}
          isCurrentPlayer={gameState.currentPlayerIndex === players.findIndex(p => p.id === player.id)}
          lastPlayerIndex={gameState.lastPlayerIndex}
          playerIndex={players.findIndex(p => p.id === player.id)}
        />
      
        {/* Player's hand */}
        <div style={{ marginTop: 'auto', overflow: 'hidden' }}>
          {gameState.currentPlayerIndex === players.findIndex(p => p.id === player.id) && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'flex-end', 
              padding: '5px 10px',
              marginBottom: '5px' 
            }}>
              <button 
                onClick={handlePassTurn}
                disabled={!hasDrawnThisTurn}
                style={{
                  backgroundColor: hasDrawnThisTurn ? '#e9c46a' : '#cccccc',
                  color: hasDrawnThisTurn ? '#264653' : '#666666',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '8px 15px',
                  fontWeight: 'bold',
                  cursor: hasDrawnThisTurn ? 'pointer' : 'not-allowed',
                  boxShadow: hasDrawnThisTurn ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                }}
                title={hasDrawnThisTurn ? 'Pass your turn to the next player' : 'You must draw a card before passing'}
              >
                Pass Turn
              </button>
            </div>
          )}
          <PlayerHand 
            cards={myHand}
            onCardClick={handleCardClick}
            currentCard={gameState.discardPile[gameState.discardPile.length - 1]}
            isCurrentPlayer={gameState.currentPlayerIndex === players.findIndex(p => p.id === player.id)}
            wildSuit={gameState.wildSuit}
            isChainActive={gameState.drawCount > 0 || gameState.gamePhase === GAME_PHASES.GURA}
            chainType={gameState.chainType}
          />
        </div>
      </div>
    </div>
  );
};

export default Game;
