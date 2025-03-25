import React, { useState, useEffect } from 'react';
import RulesModal from './RulesModal';

const GameHeader = ({ roomCode, direction, players, currentPlayerIndex, myIndex, playerNames, autoPlayStatus, gameMode }) => {
  
  // State for autoplay notifications
  const [showAutoPlayNotification, setShowAutoPlayNotification] = useState(false);
  
  // State for rules modal
  const [showRulesModal, setShowRulesModal] = useState(false);
  
  // Detect if we're on mobile using screen width
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // We don't need to listen for 'P' key press in the header component
  // as the Game component already has this functionality
  // and passes the autoPlayStatus as prop
  
  // Update mobile detection on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return (
    <>
      {/* Auto-play notification */}
      {showAutoPlayNotification && (
        <div style={{
          position: 'absolute',
          top: '5%',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: autoPlayStatus ? 'rgba(42, 157, 143, 0.9)' : 'rgba(231, 111, 81, 0.9)',
          color: 'white',
          padding: '10px 15px',
          borderRadius: '10px',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
          zIndex: 1000,
          animation: 'fadeInOut 2s forwards',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>🤖</span>
          <span style={{ fontWeight: 'bold' }}>
            {autoPlayStatus ? 'Auto-play activated!' : 'Auto-play deactivated!'}
          </span>
        </div>
      )}
      
      {/* Rules Modal */}
      <RulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        gameMode={gameMode}
      />
      
      <div style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        padding: isMobile ? '12px 15px' : '15px 20px',
        background: 'linear-gradient(135deg, #1a2a3a, #2a4a6a)',
        boxShadow: '0 4px 15px rgba(0,0,0,0.4)',
        borderTopLeftRadius: '15px',
        borderTopRightRadius: '15px',
        color: 'white',
        zIndex: 10,
        border: '1px solid rgba(100, 150, 255, 0.2)',
        borderBottom: 'none'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '8px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span style={{
              fontWeight: 'bold',
              fontSize: isMobile ? '16px' : '18px',
              textShadow: '1px 1px 2px rgba(0,0,0,0.4)',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '4px 10px',
              borderRadius: '8px'
            }}>
              Room: {roomCode}
            </span>
            
            {/* Rules Button */}
            <button
              onClick={() => setShowRulesModal(true)}
              style={{
                backgroundColor: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: '8px',
                padding: '4px 10px',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                fontSize: isMobile ? '12px' : '14px',
                transition: 'all 0.2s ease'
              }}
            >
              <span style={{ fontSize: isMobile ? '14px' : '16px' }}>📖</span>
              <span>Rules</span>
            </button>
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            {/* Game Mode Display */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: gameMode === 'chaos' ? 'rgba(231, 111, 81, 0.3)' : 'rgba(42, 157, 143, 0.3)',
              padding: isMobile ? '3px 10px' : '5px 12px',
              borderRadius: '8px',
              fontSize: isMobile ? '12px' : '14px',
              border: `1px solid ${gameMode === 'chaos' ? 'rgba(231, 111, 81, 0.5)' : 'rgba(42, 157, 143, 0.5)'}`
            }}>
              <span style={{ marginRight: '5px' }}>Mode:</span>
              <span style={{
                fontWeight: 'bold',
                color: gameMode === 'chaos' ? '#e76f51' : '#2a9d8f'
              }}>
                {gameMode === 'chaos' ? 'CHAOS' : 'CLASSIC'}
              </span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(255,255,255,0.2)',
              padding: isMobile ? '3px 10px' : '5px 12px',
              borderRadius: '8px',
              fontSize: isMobile ? '12px' : '14px',
              border: '1px solid rgba(255,255,255,0.3)'
            }}>
              <span style={{ marginRight: '5px' }}>Direction:</span>
              <span style={{
                fontWeight: 'bold',
                fontSize: isMobile ? '16px' : '18px',
                animation: 'pulse 1.5s infinite',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: isMobile ? '18px' : '22px',
                height: isMobile ? '18px' : '22px'
              }}>
                {direction === 'clockwise' ? '→' : '←'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Center area - can be used for other information if needed */}
        
        <div style={{
          display: 'flex',
          gap: isMobile ? '8px' : '12px',
          flexWrap: 'wrap',
          justifyContent: 'flex-end',
          alignItems: 'center'
        }}>
          {players.map((p) => (
            <div 
              key={p.id} 
              style={{
                padding: isMobile ? '8px 12px' : '10px 15px',
                background: p.isCurrentPlayer
                  ? 'linear-gradient(135deg, #e76f51, #f4a261)'
                  : 'linear-gradient(135deg, #2a4a6a, #1a2a3a)',
                borderRadius: '10px',
                color: 'white',
                fontWeight: p.isCurrentPlayer ? 'bold' : 'normal',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '10px',
                boxShadow: p.isCurrentPlayer
                  ? '0 4px 12px rgba(231, 111, 81, 0.5)'
                  : '0 3px 8px rgba(0, 0, 0, 0.3)',
                transform: p.isCurrentPlayer ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.3s ease',
                border: p.isCurrentPlayer
                  ? '1px solid rgba(231, 111, 81, 0.8)'
                  : '1px solid rgba(100, 150, 255, 0.3)'
              }}>
              {/* Player avatar/icon */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: p.isCurrentPlayer ? '#e76f51' : '#2a9d8f',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold',
                color: 'white',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
              }}>
                {p.name.charAt(0).toUpperCase()}
              </div>
              
              {/* Player info */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px'
              }}>
                {/* Player name */}
                <div style={{
                  fontSize: isMobile ? '12px' : '14px',
                  fontWeight: 'bold',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: isMobile ? '70px' : '100px'
                }}>
                  {p.name}
                </div>
                
                {/* Cards and score */}
                <div style={{
                  display: 'flex',
                  gap: '6px',
                  alignItems: 'center'
                }}>
                  {/* Cards count */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    padding: '2px 6px',
                    borderRadius: '12px',
                    fontSize: isMobile ? '10px' : '12px'
                  }}>
                    <span style={{ fontSize: isMobile ? '10px' : '12px' }}>🃏</span>
                    <span>{p.cards}</span>
                  </div>
                  
                  {/* Score */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    backgroundColor: 'rgba(42, 157, 143, 0.3)',
                    padding: '2px 6px',
                    borderRadius: '12px',
                    fontSize: isMobile ? '10px' : '12px',
                    color: '#e9c46a'
                  }}>
                    <span style={{ fontSize: isMobile ? '10px' : '12px' }}>🏆</span>
                    <span>{p.wins === 1151 ? 1 : (p.wins || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        padding: isMobile ? '6px 10px' : '8px 15px',
        background: currentPlayerIndex === myIndex 
          ? 'linear-gradient(to right, #2a9d8f, #5fc4b5)' 
          : 'linear-gradient(to right, #e76f51, #f4a261)',
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        position: 'relative',
        zIndex: 5,
        textShadow: '1px 1px 2px rgba(0,0,0,0.3)',
        fontSize: isMobile ? '14px' : '16px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: isMobile ? '5px' : '10px'
      }}>
        {currentPlayerIndex === myIndex ? (
          <>
            <span style={{ fontSize: isMobile ? '16px' : '20px' }}>🎮</span>
            <span>It's your turn!</span>
          </>
        ) : (
          <>
            <span style={{ 
              display: 'inline-block',
              width: isMobile ? '10px' : '12px',
              height: isMobile ? '10px' : '12px',
              backgroundColor: '#f8cb42',
              borderRadius: '50%',
              marginRight: '5px',
              animation: 'indicator-pulse 1.2s infinite'
            }}></span>
            <span>Waiting for <b>{playerNames[currentPlayerIndex] || 'other player'}</b> to play...</span>
          </>
        )}
      </div>
    </>
  );
};

export default GameHeader;