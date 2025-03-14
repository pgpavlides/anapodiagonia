import React from 'react';

const GameOver = ({ winnerPlayer, isHost, onNewGame }) => {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '50px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#2a9d8f',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100
    }}>
      <div style={{
        backgroundColor: '#e76f51',
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
            onClick={onNewGame}
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
};

export default GameOver;