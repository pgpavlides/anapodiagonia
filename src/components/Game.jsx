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
import GameOver from './game/GameOver';
import GameHeader from './game/GameHeader';
import GameActions from './game/GameActions';

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
    
    if (gameState.gamePhase === GAME_PHASES.GURA && effect.type === 'gura') {
      const hasMoreGuraCards = playerHand.some(c => c.value === card.value);
      const isGuraStarter = gameState.guraStarterIndex === playerIndex;
      
      // Only the GURA starter can end the round, and only when they have no more GURA cards
      if (!hasMoreGuraCards && isGuraStarter) {
        newGamePhase = GAME_PHASES.PLAYING;
        newChainType = null;
        newGameState.guraCardValue = null;
        
        newLogs.push({
          message: `${player.getProfile().name} played their last GURA card, ending the round!`,
          timestamp: Date.now()
        });
        
        newGameState.guraStarterIndex = null;
      }
      // If it's not the starter but they ran out of GURA cards, just note it but don't end GURA
      else if (!hasMoreGuraCards && !isGuraStarter) {
        newLogs.push({
          message: `${player.getProfile().name} played their last GURA card, but the round continues!`,
          timestamp: Date.now()
        });
      }
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
          newCurrentPlayerIndex = prevPlayer;
          
          newLogs.push({
            message: `${players[prevPlayer].getProfile().name} continues their turn`,
            timestamp: Date.now()
          });
        } else {
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
          
          newChainType = null;
          newDrawCount = 0;
        }
        
        newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
        break;
        
      case 'gura':
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
      if (players.length === 2 && (card.value === '3' || card.value === '8' || card.value === '9')) {
        newLogs.push({
          message: `${player.getProfile().name} played their last card, but must draw another since it was a ${card.value}!`,
          timestamp: Date.now()
        });
        
        if (newGameState.deck.length > 0) {
          const drawnCard = newGameState.deck.pop();
          playerHand.push(drawnCard);
          newHands[playerIndex] = playerHand;
          
          newLogs.push({
            message: `${player.getProfile().name} draws a card and continues their turn`,
            timestamp: Date.now()
          });
        }
        
        newCurrentPlayerIndex = playerIndex;
        setHasDrawnThisTurn(true);
      }
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
    
    // Prevent drawing more than once in a normal turn
    if (hasDrawnThisTurn && gameState.drawCount === 0) {
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
      // Drawing for an effect (mandatory)
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
      // Normal draw for turn (once per turn)
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
    
    // Only the GURA starter can manually end the round
    if (gameState.guraStarterIndex !== playerIndex) {
      return;
    }
    
    const newGameState = { ...gameState };
    
    const playerHand = newGameState.hands[playerIndex];
    const guraCards = playerHand.filter(card => card.value === newGameState.guraCardValue);
    
    // If the starter still has GURA cards, they must play them all first
    if (guraCards.length > 0) {
      newGameState.logs.push({
        message: `${player.getProfile().name} must play all their ${newGameState.guraCardValue} cards before ending the round`,
        timestamp: Date.now()
      });
      
      setGameState(newGameState, true);
      return;
    }
    
    // All conditions satisfied - end the GURA round
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
    return (
      <GameOver 
        winnerPlayer={players.find(p => p.id === gameState.winner)}
        isHost={isHost}
        onNewGame={startNewGame}
      />
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
      <GameHeader 
        roomCode={roomCode}
        direction={gameState.direction}
        players={boardPlayers}
        currentPlayerIndex={gameState.currentPlayerIndex}
        myIndex={players.findIndex(p => p.id === player.id)}
        playerNames={players.map(p => p.getProfile().name)}
      />
      
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
          <GameActions 
            isCurrentPlayer={gameState.currentPlayerIndex === players.findIndex(p => p.id === player.id)}
            drewFromEffect={drewFromEffect}
            hasDrawnThisTurn={hasDrawnThisTurn}
            isGuraStarter={gameState.gamePhase === GAME_PHASES.GURA && 
                          gameState.guraStarterIndex === players.findIndex(p => p.id === player.id)}
            onEndGura={handleEndGura}
            onPassTurn={handlePassTurn}
          />
          
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