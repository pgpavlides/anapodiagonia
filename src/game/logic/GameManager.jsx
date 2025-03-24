import React from 'react';
import { useIsHost, getRoomCode } from 'playroomkit';
import { initializeGameState } from '../utils';
import { GAME_PHASES } from '../types';

// Start a new game
export const startNewGame = (players, setGameState) => {
  const initialState = initializeGameState(players.length);
  setGameState(initialState, true);
  // We don't reset player wins anymore as they accumulate over the session
};

// Get animation styles for the win notification
export const getAnimationStyles = () => {
  return `
    @keyframes slideDown {
      from { transform: translateY(-100%); }
      to { transform: translateY(0); }
    }
  `;
};

// Find a player from the player list by ID
export const findPlayerById = (players, playerId) => {
  return players.find(p => p.id === playerId);
};

// Get the winner player
export const getWinner = (gameState, players) => {
  if (!gameState || gameState.gamePhase !== GAME_PHASES.GAME_OVER || !gameState.winner) {
    return null;
  }
  
  const winnerPlayer = findPlayerById(players, gameState.winner);
  if (!winnerPlayer) return null;
  
  return {
    id: winnerPlayer.id,
    name: winnerPlayer.getProfile().name
  };
};

// Check if the game is over
export const isGameOver = (gameState) => {
  return gameState && gameState.gamePhase === GAME_PHASES.GAME_OVER;
};

// Get loading state component
export const getLoadingState = (isHost, onStartNewGame) => {
  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Loading game...</h2>
      {isHost && (
        <button 
          onClick={onStartNewGame}
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
};