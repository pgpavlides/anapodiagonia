import React from 'react';
import { useIsHost } from 'playroomkit';

const WinNotification = ({ winner, onStartNewGame }) => {
  const isHost = useIsHost();
  const winnerName = winner?.name || 'Player';
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      backgroundColor: 'rgba(42, 157, 143, 0.95)',
      color: 'white',
      padding: '10px 15px',
      borderBottom: '2px solid #f4a261',
      textAlign: 'center',
      zIndex: 1000,
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
      animation: 'slideDown 0.5s ease-out forwards',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <div style={{ flex: 1 }}></div>
      <div style={{ flex: 2, textAlign: 'center' }}>
        <h2 style={{ margin: '0', fontSize: '20px' }}>
          🎉 {winnerName} wins! 🎉
        </h2>
      </div>
      {isHost && (
        <div style={{ flex: 1, textAlign: 'right' }}>
          <button
            onClick={onStartNewGame}
            style={{
              padding: '8px 15px',
              backgroundColor: '#f4a261',
              border: 'none',
              borderRadius: '5px',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              color: '#264653',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.1s, box-shadow 0.1s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
            }}
          >
            Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default WinNotification;