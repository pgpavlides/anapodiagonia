import React from 'react';
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
    boardPlayers
  } = useGameContext();
  
  const roomCode = getRoomCode();
  const isHost = useIsHost();
  
  // Handle card click
  const handleCardClick = (card, index) => {
    if (!isMyTurn()) return;
    
    const canPlay = canPlayCardNow(card, gameState, getPlayerIndex());
    
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
    startNewGame(players, setGameState);
  };
  
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