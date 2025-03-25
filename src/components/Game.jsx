import React, { useEffect, useState } from 'react';
import { useIsHost, getRoomCode } from 'playroomkit';
import { GAME_PHASES } from '../game/types';

// Import custom context
import { useGameContext } from '../game/logic';

// Import game logic
import {
  playCard,
  canPlayCardNow,
  drawCard,
  selectSuit,
  selectPlayer,
  passTurn,
  confirmGura,
  endGura
} from '../game/logic';

// Import game manager functions
import {
  startNewGame,
  getAnimationStyles,
  getWinner,
  isGameOver,
  getLoadingState
} from '../game/logic';

// Import components
import PlayerHand from './game/PlayerHand';
import GameBoard from './game/GameBoard';
import GameHeader from './game/GameHeader';
import GameActions from './game/GameActions';
import WinNotification from './game/WinNotification';
import WinConfetti from './game/WinConfetti';

const Game = () => {
  // Get values from context
  const {
    player,
    players,
    gameState,
    setGameState,
    myHand,
    hasDrawnThisTurn,
    setHasDrawnThisTurn,
    drewFromEffect,
    setDrewFromEffect,
    isMobile,
    getPlayerIndex,
    isMyTurn,
    boardPlayers,
    playerWins,
    setPlayerWins
  } = useGameContext();
  
  // State for auto-play
  const [autoPlayStatus, setAutoPlayStatus] = useState(false);
  
  const roomCode = getRoomCode();
  const isHost = useIsHost();
  
  // Initialize game with correct game mode if not already set
  useEffect(() => {
    if (isHost && gameState && !gameState.gameMode) {
      const savedGameMode = localStorage.getItem('anapodiagonia_gameMode') || 'classic';
      setGameState({
        ...gameState,
        gameMode: savedGameMode
      }, true);
    }
  }, [gameState, isHost, setGameState]);
  
  // Handle card click
  const handleCardClick = (card, index) => {
    if (!isMyTurn()) return;
    
    const canPlay = canPlayCardNow(card, gameState);
    
    if (canPlay) {
      playCard(card, index, gameState, player, players, setGameState, setHasDrawnThisTurn);
    }
  };
  
  // Handle deck click
  const handleDeckClick = () => {
    if (!isMyTurn()) return;
    
    // Prevent drawing more than once in a normal turn
    if (hasDrawnThisTurn && gameState.drawCount === 0) {
      return;
    }
    
    drawCard(gameState, player, players, setGameState, setHasDrawnThisTurn, setDrewFromEffect);
  };
  
  // Handle suit selection
  const handleSuitSelect = (suit) => {
    selectSuit(suit, gameState, player, players, setGameState);
  };
  
  // Handle player selection for Chaos mode effects
  const handlePlayerSelect = (targetPlayerIndex) => {
    if (gameState.gamePhase === GAME_PHASES.PLAYER_SELECTION) {
      selectPlayer(targetPlayerIndex, gameState, player, players, setGameState);
    }
  };
  
  // Handle pass turn
  const handlePassTurn = () => {
    if (!hasDrawnThisTurn) return; // Don't allow passing without drawing
    
    const gameStateWithStatus = {
      ...gameState,
      playerHasDrawn: hasDrawnThisTurn,
      playerMustRespond: !!gameState.drawCount || gameState.gamePhase === GAME_PHASES.GURA
    };
    
    passTurn(gameStateWithStatus, player, players, setGameState, setHasDrawnThisTurn);
  };
  
  // Handle GURA confirmation
  const handleConfirmGura = (startGura) => {
    confirmGura(startGura, gameState, player, players, setGameState);
  };
  
  // Handle end GURA
  const handleEndGura = () => {
    endGura(gameState, player, players, setGameState);
  };
  
  // Start a new game
  const handleStartNewGame = () => {
    if (!isHost) return;
    // Get the game mode from localStorage or use the current game mode
    const gameMode = localStorage.getItem('anapodiagonia_gameMode') || gameState?.gameMode || 'classic';
    startNewGame(players, setGameState, gameMode);
  };
  
  // Set up console for autoplay commands
  useEffect(() => {
    let consoleVisible = false;
    let consoleInput = null;
    let consoleContainer = null;
    
    // Show the console when pressing '\'
    const keydownHandler = (e) => {
      if (e.key === '\\') {
        e.preventDefault();
        
        if (!consoleVisible) {
          // Create console UI
          consoleContainer = document.createElement('div');
          consoleContainer.style.position = 'fixed';
          consoleContainer.style.bottom = '0';
          consoleContainer.style.left = '0';
          consoleContainer.style.width = '100%';
          consoleContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
          consoleContainer.style.color = '#fff';
          consoleContainer.style.padding = '10px';
          consoleContainer.style.zIndex = '9999';
          consoleContainer.style.fontFamily = 'monospace';
          
          const inputForm = document.createElement('form');
          consoleInput = document.createElement('input');
          consoleInput.style.width = '100%';
          consoleInput.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
          consoleInput.style.color = '#fff';
          consoleInput.style.border = '1px solid #666';
          consoleInput.style.padding = '5px';
          consoleInput.style.outline = 'none';
          consoleInput.style.fontFamily = 'monospace';
          consoleInput.placeholder = 'Type "arise" to start autoplay, "stop" to stop...';
          
          // Handle input submission
          inputForm.onsubmit = (e) => {
            e.preventDefault();
            const command = consoleInput.value.trim().toLowerCase();
            
            // Handle commands
            if (command === 'arise') {
              // Start autoplay
              setAutoPlayStatus(true);
              console.log('🤖 Autoplay activated!');
            } 
            else if (command === 'stop') {
              // Stop autoplay
              setAutoPlayStatus(false);
              console.log('🤖 Autoplay deactivated.');
            }
            
            // Clear the input
            consoleInput.value = '';
          };
          
          inputForm.appendChild(consoleInput);
          consoleContainer.appendChild(inputForm);
          document.body.appendChild(consoleContainer);
          consoleInput.focus();
          
          consoleVisible = true;
        } else {
          // Remove console UI
          if (consoleContainer) {
            document.body.removeChild(consoleContainer);
            consoleContainer = null;
            consoleInput = null;
            consoleVisible = false;
          }
        }
      }
    };
    
    // Add event listener for keydown
    window.addEventListener('keydown', keydownHandler);
    
    return () => {
      // Clean up
      window.removeEventListener('keydown', keydownHandler);
      if (consoleContainer) {
        document.body.removeChild(consoleContainer);
      }
    };
  }, []);
  
  // Auto-play execution
  useEffect(() => {
    let autoPlayInterval;
    
    const executeAutoPlay = () => {
      // Only execute if auto-play is active
      if (!autoPlayStatus) return;
      
      // Check if it's our turn
      if (!isMyTurn()) return;
      
      console.log('Auto-play executing action...');
      
      // Handle GURA decision if needed
      if (gameState.pendingGuraDecision) {
        console.log('Auto-play: Confirming GURA');
        handleConfirmGura(true);
        return;
      }
      
      // Handle suit selection if needed
      if (gameState.gamePhase === GAME_PHASES.SUIT_SELECTION && 
          gameState.lastPlayerIndex === getPlayerIndex()) {
        // Choose a random suit
        const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
        const randomSuit = suits[Math.floor(Math.random() * suits.length)];
        console.log(`Auto-play: Selecting suit ${randomSuit}`);
        handleSuitSelect(randomSuit);
        return;
      }
      
      // Try to play a card first
      const playableCards = myHand.filter(card => 
        canPlayCardNow(card, gameState, getPlayerIndex())
      );
      
      if (playableCards.length > 0) {
        // Play a random playable card
        const randomIndex = Math.floor(Math.random() * playableCards.length);
        const cardToPlay = playableCards[randomIndex];
        const handIndex = myHand.findIndex(c => c.id === cardToPlay.id);
        
        if (handIndex !== -1) {
          console.log(`Auto-play: Playing card ${cardToPlay.suit} ${cardToPlay.value}`);
          handleCardClick(cardToPlay, handIndex);
          return;
        }
      }
      
      // End GURA if we are the starter and don't have cards to play
      if (gameState.gamePhase === GAME_PHASES.GURA && 
          gameState.guraStarterIndex === getPlayerIndex()) {
        console.log('Auto-play: Ending GURA round');
        handleEndGura();
        return;
      }
      
      // If no cards can be played, draw a card
      if (!hasDrawnThisTurn || gameState.drawCount > 0) {
        console.log('Auto-play: Drawing card');
        handleDeckClick();
        
        // Give a short delay and then check if we need to pass
        setTimeout(() => {
          if (isMyTurn() && hasDrawnThisTurn) {
            console.log('Auto-play: Passing turn after draw');
            handlePassTurn();
          }
        }, 500);
        return;
      }
      
      // If we've already drawn and can't play, pass turn
      if (hasDrawnThisTurn) {
        console.log('Auto-play: Passing turn');
        handlePassTurn();
      }
    };

    // Setup a watcher for auto-play status
    if (autoPlayStatus) {
      autoPlayInterval = setInterval(() => {
        executeAutoPlay();
      }, 1000);
    }
    
    return () => {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
      }
    };
  }, [
    autoPlayStatus,
    myHand,
    gameState,
    isMyTurn,
    getPlayerIndex,
    hasDrawnThisTurn,
    handleCardClick,
    handleDeckClick,
    handlePassTurn,
    handleConfirmGura,
    handleSuitSelect,
    handlePlayerSelect,
    handleEndGura
  ]);
  
  // If game state is not loaded yet
  if (!gameState) {
    return getLoadingState(isHost, handleStartNewGame);
  }
  
  const playerIndex = getPlayerIndex();
  const winner = getWinner(gameState, players);
  
  // Animation styles for win notification and other effects
  const animationStyles = `
    @keyframes slideDown {
      from { transform: translateY(-100%); }
      to { transform: translateY(0); }
    }
    
    @keyframes pulse-green {
      0% { box-shadow: 0 0 0 0 rgba(42, 157, 143, 0.7); }
      70% { box-shadow: 0 0 0 25px rgba(42, 157, 143, 0); }
      100% { box-shadow: 0 0 0 0 rgba(42, 157, 143, 0); }
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
    
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(-20px); }
      10% { opacity: 1; transform: translateY(0); }
      90% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-20px); }
    }
  `;
  
  return (
    <div className="game-container" style={{ 
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: 'transparent',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <style>{animationStyles}</style>
      
      {/* Win notification and confetti */}
      {isGameOver(gameState) && (
        <>
          <WinNotification 
            winner={winner} 
            onStartNewGame={handleStartNewGame} 
          />
          <WinConfetti />
        </>
      )}
      
      {/* Game header */}
      <GameHeader
        roomCode={roomCode}
        direction={gameState.direction}
        players={boardPlayers}
        currentPlayerIndex={gameState.currentPlayerIndex}
        myIndex={playerIndex}
        playerNames={players.map(p => p.getProfile().name)}
        autoPlayStatus={autoPlayStatus}
        gameMode={gameState.gameMode || 'classic'}
      />
      
      {/* Game board */}
      <div style={{ 
        padding: isMobile ? '2px' : '5px', 
        flexGrow: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden' 
      }}>
        <GameBoard
          discardPile={gameState.discardPile}
          deckCount={gameState.deck.length}
          onDeckClick={handleDeckClick}
          currentPlayerIndex={gameState.currentPlayerIndex}
          direction={gameState.direction}
          onSuitSelect={handleSuitSelect}
          onPlayerSelect={handlePlayerSelect}
          gamePhase={gameState.gamePhase}
          wildSuit={gameState.wildSuit}
          drawCount={gameState.drawCount}
          chainType={gameState.chainType}
          players={boardPlayers}
          isCurrentPlayer={gameState.currentPlayerIndex === playerIndex}
          lastPlayerIndex={gameState.lastPlayerIndex}
          playerIndex={playerIndex}
          pendingGuraDecision={gameState.pendingGuraDecision}
          onConfirmGura={handleConfirmGura}
          guraCardValue={gameState.guraCardValue}
          hasManyGuraCards={gameState.hasManyGuraCards}
          pendingEffect={gameState.pendingEffect}
          gameState={gameState}
        />
      
        {/* Player hand and actions */}
        <div style={{ marginTop: 'auto', overflow: 'hidden' }}>
          <GameActions 
            isCurrentPlayer={gameState.currentPlayerIndex === playerIndex}
            drewFromEffect={drewFromEffect}
            hasDrawnThisTurn={hasDrawnThisTurn}
            isGuraStarter={gameState.gamePhase === GAME_PHASES.GURA && 
                          gameState.guraStarterIndex === playerIndex}
            onEndGura={handleEndGura}
            onPassTurn={handlePassTurn}
          />
          
          <PlayerHand 
            cards={myHand}
            onCardClick={handleCardClick}
            currentCard={gameState.discardPile[gameState.discardPile.length - 1]}
            isCurrentPlayer={gameState.currentPlayerIndex === playerIndex}
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