import React, { useState, useEffect } from 'react';

const GameActions = ({ 
  isCurrentPlayer, 
  drewFromEffect, 
  hasDrawnThisTurn, 
  isGuraStarter, 
  onEndGura, 
  onPassTurn 
}) => {
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

  if (!isCurrentPlayer) {
    return null;
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: isMobile ? 'center' : 'space-between', 
      alignItems: 'center',
      padding: '5px 10px',
      marginBottom: '5px' 
    }}>
      {!isMobile && isCurrentPlayer && (
        <div style={{
          color: hasDrawnThisTurn ? '#444' : '#e76f51',
          fontWeight: hasDrawnThisTurn ? 'normal' : 'bold',
          fontSize: '14px'
        }}>
          {hasDrawnThisTurn ? 'Your turn' : 'You must draw a card before passing'}
        </div>
      )}
      <div style={{ 
        marginLeft: isMobile ? '0' : 'auto', 
        display: 'flex', 
        gap: '10px',
        justifyContent: isMobile ? 'center' : 'flex-end',
        width: isMobile ? '100%' : 'auto'
      }}>
        {isGuraStarter && (
          <button 
            onClick={onEndGura}
            style={{
              backgroundColor: '#e76f51',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: isMobile ? '10px 25px' : '8px 15px',
              fontSize: isMobile ? '16px' : '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              display: 'flex',
              alignItems: 'center',
              minWidth: isMobile ? '180px' : 'auto',
              justifyContent: 'center'
            }}
            title="Only the player who started the GURA round can end it"
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
            padding: isMobile ? '10px 25px' : '8px 15px',
            fontSize: isMobile ? '16px' : '14px',
            fontWeight: 'bold',
            cursor: hasDrawnThisTurn ? 'pointer' : 'not-allowed',
            boxShadow: hasDrawnThisTurn ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
            minWidth: isMobile ? '180px' : 'auto'
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