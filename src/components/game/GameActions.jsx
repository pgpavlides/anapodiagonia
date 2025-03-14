import React from 'react';

const GameActions = ({ 
  isCurrentPlayer, 
  drewFromEffect, 
  hasDrawnThisTurn, 
  isGuraStarter, 
  onEndGura, 
  onPassTurn 
}) => {
  if (!isCurrentPlayer) {
    return null;
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '5px 10px',
      marginBottom: '5px' 
    }}>
      {!hasDrawnThisTurn && (
        <div style={{
          color: '#e76f51',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          You must draw a card for your turn
        </div>
      )}
      <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
        {isGuraStarter && (
          <button 
            onClick={onEndGura}
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
          onClick={onPassTurn}
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
    </div>
  );
};

export default GameActions;