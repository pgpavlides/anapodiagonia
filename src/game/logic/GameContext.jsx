import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useMultiplayerState, myPlayer, usePlayersList } from 'playroomkit';
import { initializeGameState } from '../utils';

// Create the context
const GameContext = createContext();

// Custom hook for using the game context
export const useGameContext = () => useContext(GameContext);

// Provider component
export const GameProvider = ({ children }) => {
  const player = myPlayer();
  const players = usePlayersList(true);
  
  const [gameState, setGameState] = useMultiplayerState('gameState', null);
  const [playerWins, setPlayerWins] = useMultiplayerState('playerWins', {});
  const [myHand, setMyHand] = useState([]);
  const [hasDrawnThisTurn, setHasDrawnThisTurn] = useState(false);
  const [drewFromEffect, setDrewFromEffect] = useState(false);
  
  // Detect if we're on mobile using screen width
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Update mobile detection on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Update wins when game state changes
  useEffect(() => {
    if (gameState && gameState.winner && gameState.gamePhase === 'game_over') {
      // Check if this is a new win (not already counted)
      const winnerId = gameState.winner;
      const currentWins = playerWins[winnerId] || 0;
      
      // Update the wins for the player (accumulate over the session)
      setPlayerWins({
        ...playerWins,
        [winnerId]: currentWins + 1
      });
      
      // Log the win
      const winnerPlayer = players.find(p => p.id === winnerId);
      if (winnerPlayer) {
        console.log(`${winnerPlayer.getProfile().name} won! Total wins: ${currentWins + 1}`);
      }
    }
  }, [gameState?.gamePhase, gameState?.winner, players, playerWins, setPlayerWins]);
  
  // Update my hand when game state changes
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
  
  // Get current player index
  const getPlayerIndex = () => {
    return players.findIndex(p => p.id === player.id);
  };
  
  // Check if it's the player's turn
  const isMyTurn = () => {
    return gameState && gameState.currentPlayerIndex === getPlayerIndex();
  };
  
  // Calculate player scores based on total wins
  const playerScores = useMemo(() => {
    const scores = {};
    players.forEach(p => {
      // Total number of wins per player
      scores[p.id] = playerWins[p.id] || 0;
    });
    
    return scores;
  }, [players, playerWins]);

  // Create a data object for board players
  const boardPlayers = players.map((p, index) => ({
    id: p.id,
    name: p.getProfile().name,
    cards: gameState?.hands?.[index] ? gameState.hands[index].length : 0,
    score: playerScores[p.id] || 0,
    wins: playerWins[p.id] || 0,
    isCurrentPlayer: index === gameState?.currentPlayerIndex
  }));
  
  // Package up all values to expose through context
  const value = {
    player,
    players,
    gameState,
    setGameState,
    myHand,
    setMyHand,
    hasDrawnThisTurn,
    setHasDrawnThisTurn,
    drewFromEffect,
    setDrewFromEffect,
    isMobile,
    getPlayerIndex,
    isMyTurn,
    boardPlayers,
    playerScores,
    playerWins
  };
  
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;