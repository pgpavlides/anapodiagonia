    // Check if this was the player's last GURA card (regardless of who started it)
    if (gameState.gamePhase === GAME_PHASES.GURA && effect.type === 'gura') {
      
      // Check if the player has any more cards of this value
      const hasMoreGuraCards = playerHand.some(c => c.value === card.value);
      
      if (!hasMoreGuraCards) {
        // Automatically end the GURA round
        newGamePhase = GAME_PHASES.PLAYING;
        newChainType = null;
        newGameState.guraCardValue = null;
        
        newLogs.push({
          message: `${player.getProfile().name} played their last GURA card, ending the round!`,
          timestamp: Date.now()
        });
        
        // Reset GURA starter
        newGameState.guraStarterIndex = null;
      }
    }import React, { useState, useEffect } from 'react';
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
  const player = myPlayer();
  const roomCode = getRoomCode();
  const isHost = useIsHost();
  const players = usePlayersList(true);
  
  const [gameState, setGameState] = useMultiplayerState('gameState', null);
  
  const [selectedCard, setSelectedCard] = useState(null);
  const [myHand, setMyHand] = useState([]);
  const [hasDrawnThisTurn, setHasDrawnThisTurn] = useState(false);
  const [drewFromEffect, setDrewFromEffect] = useState(false);
  
  useEffect(() => {
    if (isHost && !gameState) {
      const initialState = initializeGameState(players.length);
      setGameState(initialState, true);
    }
  }, [isHost, players.length, gameState, setGameState]);
  
  useEffect(() => {
    if (gameState && player) {
      const playerIndex = players.findIndex(p => p.id === player.id);
      if (playerIndex >= 0 && gameState.hands && gameState.hands[playerIndex]) {
        setMyHand(gameState.hands[playerIndex]);
      }
      
      if (gameState.currentPlayerIndex === playerIndex) {
        if (!hasDrawnThisTurn) {
          setHasDrawnThisTurn(false);
          setDrewFromEffect(false);
        }
      }
    }
  }, [gameState, player, players, hasDrawnThisTurn]);
  
  const handleCardClick = (card, index) => {
    if (gameState.currentPlayerIndex !== players.findIndex(p => p.id === player.id)) {
      return;
    }
    
    const topCard = gameState.discardPile[gameState.discardPile.length - 1];
    let canPlay = false;
    
    if (gameState.gamePhase === GAME_PHASES.SUIT_SELECTION) {
      return;
    } else if (gameState.gamePhase === GAME_PHASES.GURA) {
      canPlay = card.value === gameState.guraCardValue;
    } else if (gameState.drawCount > 0) {
      if (gameState.chainType === 'draw_chain' && card.value === '7') {
        canPlay = true;
      } else if (gameState.chainType === 'draw_ten' && card.value === 'jack' && 
                (card.suit === 'clubs' || card.suit === 'spades')) {
        canPlay = true;
      } else if (gameState.chainType === 'draw_ten' && card.value === 'jack' && 
                (card.suit === 'hearts' || card.suit === 'diamonds')) {
        // Allow red Jack to negate black Jack at any point
        canPlay = true;
      } else if (gameState.chainType === 'draw_ten_response' && card.value === 'jack' && 
                (card.suit === 'hearts' || card.suit === 'diamonds')) {
        canPlay = true;
      } else {
        canPlay = false;
      }
    } else {
      canPlay = canPlayCard(topCard, card, gameState.wildSuit);
    }
    
    if (canPlay) {
      playCard(card, index);
    }
  };
  
  const playCard = (card, index) => {
    if (!gameState) return;
    
    const newGameState = { ...gameState };
    const playerIndex = players.findIndex(p => p.id === player.id);
    
    const newHands = [...newGameState.hands];
    const playerHand = [...newHands[playerIndex]];
    playerHand.splice(index, 1);
    newHands[playerIndex] = playerHand;
    
    const newDiscardPile = [...newGameState.discardPile, card];
    
    const newLogs = [...newGameState.logs, {
      message: `${player.getProfile().name} played ${card.suit} ${card.value}`,
      timestamp: Date.now()
    }];
    
    const effect = getCardEffect(card);
    let newCurrentPlayerIndex = playerIndex;
    let newDirection = newGameState.direction;
    let newGamePhase = newGameState.gamePhase;
    let newWildSuit = newGameState.wildSuit;
    let newDrawCount = newGameState.drawCount;
    let newChainType = newGameState.chainType;
    let newLastPlayerIndex = newGameState.lastPlayerIndex;
    let startedGura = false;
    
    if (newGameState.potentialWinner && card.value === '7') {
      newGameState.potentialWinner = null;
      
      newLogs.push({
        message: `${player.getProfile().name} countered the final 7 with their own 7!`,
        timestamp: Date.now()
      });
    }
    
    switch (effect.type) {
      case 'wild':
        newGamePhase = GAME_PHASES.SUIT_SELECTION;
        newLastPlayerIndex = playerIndex;
        break;
        
      case 'draw_two':
        const prevPlayer = getNextPlayerIndex(
          playerIndex, 
          players.length, 
          newDirection === 'clockwise' ? 'counter_clockwise' : 'clockwise'
        );
        
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
        
        if (players.length === 2) {
          // In 2-player games, the other player draws cards and gets their turn
          newCurrentPlayerIndex = prevPlayer;
          
          newLogs.push({
            message: `${players[prevPlayer].getProfile().name} continues their turn`,
            timestamp: Date.now()
          });
        } else {
          // In games with more players, the player who played the 2 gets to play again
          newCurrentPlayerIndex = playerIndex;
        }
        
        break;
        
      case 'reverse':
        newDirection = newDirection === 'clockwise' ? 'counter_clockwise' : 'clockwise';
        
        if (players.length === 2) {
          newCurrentPlayerIndex = playerIndex;
        } else {
          newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
        }
        
        newLogs.push({
          message: `${player.getProfile().name} reversed the direction of play`,
          timestamp: Date.now()
        });
        break;
        
      case 'draw_chain':
        if (newChainType === 'draw_chain') {
          newDrawCount += 2;
          newLogs.push({
            message: `${player.getProfile().name} added to the chain! Next player draws ${newDrawCount} cards or plays a 7`,
            timestamp: Date.now()
          });
        } else {
          newChainType = 'draw_chain';
          newDrawCount = 2;
          newLogs.push({
            message: `${player.getProfile().name} started a chain! Next player draws 2 cards or plays a 7`,
            timestamp: Date.now()
          });
        }
        
        newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
        break;
        
      case 'play_again':
        newCurrentPlayerIndex = playerIndex;
        
        newLogs.push({
          message: `${player.getProfile().name} plays again!`,
          timestamp: Date.now()
        });
        break;
        
      case 'skip':
        if (players.length === 2) {
          newCurrentPlayerIndex = playerIndex;
        } else {
          newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection, true);
        }
        
        newLogs.push({
          message: `${players[getNextPlayerIndex(playerIndex, players.length, newDirection)].getProfile().name}'s turn is skipped`,
          timestamp: Date.now()
        });
        break;
        
      case 'draw_ten':
        if (newChainType === 'draw_ten') {
          newDrawCount += 10;
          newLogs.push({
            message: `${player.getProfile().name} added to the chain! Next player draws ${newDrawCount} cards or plays a black Jack`,
            timestamp: Date.now()
          });
        } else {
          newChainType = 'draw_ten';
          newDrawCount = 10;
          newLogs.push({
            message: `${player.getProfile().name} started a chain! Next player draws 10 cards or plays a black Jack`,
            timestamp: Date.now()
          });
        }
        
        newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
        break;
        
      case 'negate':
        if (newChainType === 'draw_ten' || newChainType === 'draw_ten_response') {
          newLogs.push({
            message: `${player.getProfile().name} negated the black Jack with a red Jack!`,
            timestamp: Date.now()
          });
          
          // Reset the chain
          newChainType = null;
          newDrawCount = 0;
        }
        
        // Red Jack plays end the turn even if used to negate a black Jack
        newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
        break;
        
      case 'gura':
        // During an existing GURA round, just treat Kings/Queens as normal cards
        if (gameState.gamePhase === GAME_PHASES.GURA) {
          newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
          break;
        }
        
        const hasSameValueCards = playerHand.some(c => c.value === card.value);
        
        if (hasSameValueCards) {
          newGameState.guraCardValue = card.value;
          
          newGameState.pendingGuraDecision = true;
          startedGura = true;
          
          newGameState.guraStarterIndex = playerIndex;
          
          newLogs.push({
            message: `${player.getProfile().name} played a ${card.value}. They can start a GURA round!`,
            timestamp: Date.now()
          });
          
          newCurrentPlayerIndex = playerIndex;
        } else {
          newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
        }
        break;
        
      default:
        newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
        break;
    }
    
    if (playerHand.length === 0) {
      // Special case for 2-player games: If the last card was 3, 8, or 9, they must draw a card
      if (players.length === 2 && (card.value === '3' || card.value === '8' || card.value === '9')) {
        // Force the player to draw a card instead of winning
        newLogs.push({
          message: `${player.getProfile().name} played their last card, but must draw another since it was a ${card.value}!`,
          timestamp: Date.now()
        });
        
        // Draw a card for the player
        if (newGameState.deck.length > 0) {
          const drawnCard = newGameState.deck.pop();
          playerHand.push(drawnCard);
          newHands[playerIndex] = playerHand; // Update the hand
          
          newLogs.push({
            message: `${player.getProfile().name} draws a card and continues their turn`,
            timestamp: Date.now()
          });
        }
        
        // The player continues their turn
        newCurrentPlayerIndex = playerIndex;
        setHasDrawnThisTurn(true); // Mark as having drawn a card
      }
      // Special case: If the last card played was a 7 and we're in a draw chain
      else if (card.value === '7' && (newChainType === 'draw_chain' || effect.type === 'draw_chain')) {
        newLogs.push({
          message: `${player.getProfile().name} played their last card, but the next player must respond to the 7!`,
          timestamp: Date.now()
        });
        
        newGameState.potentialWinner = player.id;
      } else {
        newGamePhase = GAME_PHASES.GAME_OVER;
        newLogs.push({
          message: `${player.getProfile().name} has won the game!`,
          timestamp: Date.now()
        });
      }
    }

    if (newGameState.potentialWinner) {
      const nextPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
      const nextPlayerHand = newHands[nextPlayerIndex];
      const nextPlayerHas7 = nextPlayerHand.some(c => c.value === '7');
      
      if (!nextPlayerHas7) {
        newGamePhase = GAME_PHASES.GAME_OVER;
        newGameState.winner = newGameState.potentialWinner;
        
        const winnerPlayer = players.find(p => p.id === newGameState.potentialWinner);
        newLogs.push({
          message: `${winnerPlayer ? winnerPlayer.getProfile().name : 'Player'} wins the game!`,
          timestamp: Date.now()
        });
      }
    }
    
    if (newCurrentPlayerIndex === playerIndex && effect.type !== 'normal') {
      setHasDrawnThisTurn(false);
    }
    
    if (newCurrentPlayerIndex !== playerIndex) {
      setHasDrawnThisTurn(false);
    }
    
    setGameState({
      ...newGameState,
      hands: newHands,
      discardPile: newDiscardPile,
      currentPlayerIndex: newCurrentPlayerIndex,
      direction: newDirection,
      gamePhase: startedGura ? (newGameState.pendingGuraDecision ? newGamePhase : GAME_PHASES.GURA) : newGamePhase,
      wildSuit: newWildSuit,
      drawCount: newDrawCount,
      chainType: startedGura ? (newGameState.pendingGuraDecision ? newChainType : 'gura') : newChainType,
      lastPlayerIndex: newLastPlayerIndex,
      logs: newLogs,
      winner: newGamePhase === GAME_PHASES.GAME_OVER ? player.id : null
    }, true);
  };
  
  const handleDeckClick = () => {
    if (!gameState) return;
    
    const playerIndex = players.findIndex(p => p.id === player.id);
    
    if (gameState.currentPlayerIndex !== playerIndex) {
      return;
    }
    
    if (gameState.pendingGuraDecision) {
      confirmGura(false);
      return;
    }
    
    const newGameState = { ...gameState };
    const newHands = [...newGameState.hands];
    const playerHand = [...newHands[playerIndex]];
    
    if (gameState.drawCount > 0) {
      for (let i = 0; i < gameState.drawCount; i++) {
        if (newGameState.deck.length > 0) {
          const drawnCard = newGameState.deck.pop();
          playerHand.push(drawnCard);
        }
      }
      
      newGameState.chainType = null;
      newGameState.drawCount = 0;
      
      newGameState.logs.push({
        message: `${player.getProfile().name} drew ${gameState.drawCount} cards`,
        timestamp: Date.now()
      });
      
      newGameState.logs.push({
        message: `${player.getProfile().name} continues their turn`,
        timestamp: Date.now()
      });
      
    } else {
      if (newGameState.deck.length > 0) {
        const drawnCard = newGameState.deck.pop();
        playerHand.push(drawnCard);
      }
      
      newGameState.logs.push({
        message: `${player.getProfile().name} drew a card`,
        timestamp: Date.now()
      });

      setHasDrawnThisTurn(true);
    }
    
    newHands[playerIndex] = playerHand;
    
    setDrewFromEffect(true);
    
    if (gameState.gamePhase === GAME_PHASES.GURA) {
      const hasGuraCard = playerHand.some(card => card.value === newGameState.guraCardValue);
      
      if (hasGuraCard) {
        newGameState.logs.push({
          message: `${player.getProfile().name} drew a card and must play their ${newGameState.guraCardValue}`,
          timestamp: Date.now()
        });
        
        newGameState.currentPlayerIndex = playerIndex;
      } else {
        const nextPlayerIndex = getNextPlayerIndex(
          playerIndex, 
          players.length, 
          newGameState.direction
        );
        
        newGameState.logs.push({
          message: `${player.getProfile().name} drew a card but doesn't have a ${newGameState.guraCardValue}`,
          timestamp: Date.now()
        });
        
        newGameState.currentPlayerIndex = nextPlayerIndex;
      }
    }
    
    setGameState({
      ...newGameState,
      hands: newHands
    }, true);
  };
  
  const handleSuitSelect = (suit) => {
    if (!gameState || gameState.gamePhase !== GAME_PHASES.SUIT_SELECTION) {
      return;
    }
    
    const playerIndex = players.findIndex(p => p.id === player.id);
    
    if (playerIndex !== gameState.lastPlayerIndex) {
      return;
    }
    
    const newGameState = { ...gameState };
    
    newGameState.wildSuit = suit;
    
    newGameState.gamePhase = GAME_PHASES.PLAYING;
    
    newGameState.logs.push({
      message: `${player.getProfile().name} selected ${suit} as the active suit`,
      timestamp: Date.now()
    });
    
    newGameState.currentPlayerIndex = getNextPlayerIndex(
      playerIndex,
      players.length, 
      newGameState.direction
    );
    
    setGameState(newGameState, true);
  };
  
  const handlePassTurn = () => {
    if (!gameState) return;
    
    const playerIndex = players.findIndex(p => p.id === player.id);
    
    if (gameState.currentPlayerIndex !== playerIndex) {
      return;
    }
    
    if (!hasDrawnThisTurn) {
      return;
    }
    
    if (gameState.gamePhase === GAME_PHASES.GURA) {
      const playerHand = gameState.hands[playerIndex];
      const hasGuraCard = playerHand.some(card => card.value === gameState.guraCardValue);
      
      if (hasGuraCard) {
        const newGameState = { ...gameState };
        newGameState.logs.push({
          message: `${player.getProfile().name} must play their ${gameState.guraCardValue} card`,
          timestamp: Date.now()
        });
        
        setGameState(newGameState, true);
        return;
      }
    }
    
    if (gameState.pendingGuraDecision) {
      confirmGura(false);
      return;
    }
    
    const newGameState = { ...gameState };
    
    newGameState.logs.push({
      message: `${player.getProfile().name} passed their turn`,
      timestamp: Date.now()
    });
    
    newGameState.currentPlayerIndex = getNextPlayerIndex(
      playerIndex, 
      players.length, 
      newGameState.direction
    );
    
    setHasDrawnThisTurn(false);
    
    setGameState(newGameState, true);
  };
  
  const confirmGura = (startGura) => {
    if (!gameState || !gameState.pendingGuraDecision) {
      return;
    }
    
    const playerIndex = players.findIndex(p => p.id === player.id);
    const newGameState = { ...gameState };
    
    newGameState.pendingGuraDecision = false;
    
    if (startGura) {
      newGameState.gamePhase = GAME_PHASES.GURA;
      newGameState.chainType = 'gura';
      
      newGameState.logs.push({
        message: `${player.getProfile().name} started a GURA round with a ${newGameState.guraCardValue}!`,
        timestamp: Date.now()
      });
      
      newGameState.currentPlayerIndex = getNextPlayerIndex(
        playerIndex,
        players.length, 
        newGameState.direction
      );
    } else {
      newGameState.gamePhase = GAME_PHASES.PLAYING;
      newGameState.guraStarterIndex = null;
      newGameState.guraCardValue = null;
      
      newGameState.logs.push({
        message: `${player.getProfile().name} decided not to start a GURA round`,
        timestamp: Date.now()
      });
      
      newGameState.currentPlayerIndex = getNextPlayerIndex(
        playerIndex,
        players.length, 
        newGameState.direction
      );
    }
    
    setGameState(newGameState, true);
  };

  const handleEndGura = () => {
    if (!gameState || gameState.gamePhase !== GAME_PHASES.GURA) {
      return;
    }
    
    const playerIndex = players.findIndex(p => p.id === player.id);
    
    if (gameState.guraStarterIndex !== playerIndex) {
      return;
    }
    
    const newGameState = { ...gameState };
    
    const playerHand = newGameState.hands[playerIndex];
    const guraCards = playerHand.filter(card => card.value === newGameState.guraCardValue);
    
    if (guraCards.length > 0) {
      newGameState.logs.push({
        message: `${player.getProfile().name} must play their last GURA card before ending the round`,
        timestamp: Date.now()
      });
      
      setGameState(newGameState, true);
      return;
    }
    
    newGameState.gamePhase = GAME_PHASES.PLAYING;
    newGameState.chainType = null;
    newGameState.guraCardValue = null;
    
    newGameState.logs.push({
      message: `${player.getProfile().name} ended the GURA round`,
      timestamp: Date.now()
    });
    
    newGameState.currentPlayerIndex = getNextPlayerIndex(
      playerIndex,
      players.length, 
      newGameState.direction
    );
    
    newGameState.guraStarterIndex = null;
    
    setGameState(newGameState, true);
  };
  
  const startNewGame = () => {
    if (!isHost) return;
    
    const initialState = initializeGameState(players.length);
    
    setGameState(initialState, true);
  };
  
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
  
  const boardPlayers = players.map((p, index) => ({
    id: p.id,
    name: p.getProfile().name,
    cards: gameState.hands[index] ? gameState.hands[index].length : 0,
    isCurrentPlayer: index === gameState.currentPlayerIndex
  }));
  
  if (gameState.gamePhase === GAME_PHASES.GAME_OVER) {
    const winnerPlayer = players.find(p => p.id === gameState.winner);
    
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#2a9d8f', // Changed to a brighter teal background
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 100
      }}>
        <div style={{
          backgroundColor: '#e76f51', // Orange background for the message box
          padding: '60px 80px',
          borderRadius: '20px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
          width: '90%',
          maxWidth: '600px',
          border: '5px solid #f4a261'
        }}>
          <h2 style={{ 
            fontSize: '72px', 
            color: '#ffffff',
            margin: '0 0 30px 0',
            textShadow: '3px 3px 6px rgba(0, 0, 0, 0.5)',
            fontWeight: 'bold',
            letterSpacing: '2px'
          }}>GAME OVER!</h2>
          <h3 style={{ 
            fontSize: '48px', 
            color: '#ffffff',
            margin: '0 0 30px 0',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
            fontWeight: 'bold'
          }}>{winnerPlayer ? winnerPlayer.getProfile().name : 'Someone'} has won!</h3>
          
          {isHost && (
            <button 
              onClick={startNewGame}
              style={{
                padding: '20px 40px',
                fontSize: '28px',
                backgroundColor: '#264653',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                marginTop: '30px',
                boxShadow: '0 6px 12px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.2s ease',
                fontWeight: 'bold'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1a2f38'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#264653'}
            >
              Start New Game
            </button>
          )}
        </div>
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
          pendingGuraDecision={gameState.pendingGuraDecision}
          onConfirmGura={confirmGura}
          guraCardValue={gameState.guraCardValue}
        />
      
        <div style={{ marginTop: 'auto', overflow: 'hidden' }}>
          {gameState.currentPlayerIndex === players.findIndex(p => p.id === player.id) && (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              padding: '5px 10px',
              marginBottom: '5px' 
            }}>
              {drewFromEffect && !hasDrawnThisTurn && (
                <div style={{
                  color: '#e76f51',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}>
                  You must still draw for your turn
                </div>
              )}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                {gameState.gamePhase === GAME_PHASES.GURA && 
                 gameState.guraStarterIndex === players.findIndex(p => p.id === player.id) && (
                  <button 
                    onClick={handleEndGura}
                    style={{
                      backgroundColor: '#e76f51',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '8px 15px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="End the GURA round and start a new one if you have more cards"
                  >
                    <span style={{ fontSize: '16px', marginRight: '5px' }}>🃏</span>
                    End GURA
                  </button>
                )}
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
                title={hasDrawnThisTurn ? 'Pass your turn to the next player' : drewFromEffect ? 'You drew cards from an effect but must still draw for your turn' : 'You must draw a card before passing'}
              >
                Pass Turn
              </button>
              </div>
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