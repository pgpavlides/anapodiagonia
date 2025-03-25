import React from 'react';
import { GAME_MODES } from '../../game/types';

const GameSettings = ({ gameMode, setGameMode }) => {
  return (
    <div style={styles.settingsPanel}>
      <h3 style={styles.settingsTitle}>Game Mode</h3>
      <div style={styles.gameModeOptions}>
        <div 
          onClick={() => setGameMode(GAME_MODES.CLASSIC)}
          style={{
            ...styles.gameModeOption,
            backgroundColor: gameMode === GAME_MODES.CLASSIC ? '#2a9d8f' : 'rgba(18, 75, 43, 0.8)',
            border: gameMode === GAME_MODES.CLASSIC ? '3px solid #4cfc50' : '3px solid rgba(75, 211, 75, 0.3)'
          }}
        >
          <h4 style={styles.gameModeTitle}>Classic</h4>
          <p style={styles.gameModeDescription}>
            Standard rules with special effects for cards 1, 2, 3, 7, 8, 9, Jack, Queen, and King.
          </p>
        </div>
        
        <div 
          onClick={() => setGameMode(GAME_MODES.CHAOS)}
          style={{
            ...styles.gameModeOption,
            backgroundColor: gameMode === GAME_MODES.CHAOS ? '#2a9d8f' : 'rgba(18, 75, 43, 0.8)',
            border: gameMode === GAME_MODES.CHAOS ? '3px solid #4cfc50' : '3px solid rgba(75, 211, 75, 0.3)'
          }}
        >
          <h4 style={styles.gameModeTitle}>Chaos</h4>
          <p style={styles.gameModeDescription}>
            Classic rules plus additional effects for cards 4, 5, 6, and 10:
            <br />• 4: Swap hands with an opponent
            <br />• 5: Take a card from an opponent
            <br />• 6: Swap a random card with an opponent
            <br />• 10: See an opponent's hand
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  settingsPanel: {
    width: '100%',
    backgroundColor: 'rgba(0, 30, 15, 0.8)',
    borderRadius: '15px',
    padding: '20px',
    marginTop: '20px',
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(75, 211, 75, 0.3)',
    animation: 'fadeInOut 0.3s ease'
  },
  settingsTitle: {
    color: '#4cfc50',
    fontSize: '22px',
    margin: '0 0 15px 0',
    textAlign: 'center',
    fontWeight: 'bold',
    letterSpacing: '2px'
  },
  gameModeOptions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    width: '100%'
  },
  gameModeOption: {
    padding: '15px',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)'
  },
  gameModeTitle: {
    color: 'white',
    fontSize: '20px',
    margin: '0 0 10px 0',
    fontWeight: 'bold'
  },
  gameModeDescription: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: '14px',
    margin: 0,
    lineHeight: '1.5'
  }
};

export default GameSettings;