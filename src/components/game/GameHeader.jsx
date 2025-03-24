import React, { useState, useEffect } from 'react';
import { useGameContext } from '../../game/logic';

// Robot icon SVG for the autoplay button
const RobotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2" />
    <circle cx="12" cy="5" r="2" />
    <path d="M12 7v4" />
    <line x1="8" y1="16" x2="8" y2="16" />
    <line x1="16" y1="16" x2="16" y2="16" />
  </svg>
);

const GameHeader = ({ roomCode, direction, players, currentPlayerIndex, myIndex, playerNames }) => {
  const { playerWins, player } = useGameContext();
  const myWins = playerWins[player?.id] || 0;
  
  // State for autoplay functionality
  const [autoPlayEnabled, setAutoPlayEnabled] = useState(false);
  const [showAutoPlayNotification, setShowAutoPlayNotification] = useState(false);
  
  // Detect if we're on mobile using screen width
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Toggle autoplay function
  const toggleAutoPlay = () => {
    // Trigger the same behavior as pressing 'P'
    const event = new KeyboardEvent('keydown', {
      key: 'p',
      bubbles: true
    });
    document.dispatchEvent(event);
    
    // Toggle local state for UI
    setAutoPlayEnabled(prev => {
      const newStatus = !prev;
      // Show notification
      setShowAutoPlayNotification(true);
      setTimeout(() => setShowAutoPlayNotification(false), 2000);
      return newStatus;
    });
  };
  
  // Listen for 'P' key press to sync the autoplay button state
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'p' || e.key === 'P') {
        // Toggle button state
        setAutoPlayEnabled(prev => !prev);
        // Show notification
        setShowAutoPlayNotification(true);
        setTimeout(() => setShowAutoPlayNotification(false), 2000);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
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
          backgroundColor: autoPlayEnabled ? 'rgba(42, 157, 143, 0.9)' : 'rgba(231, 111, 81, 0.9)',
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
            {autoPlayEnabled ? 'Auto-play activated!' : 'Auto-play deactivated!'}
          </span>
        </div>
      )}
      
      <div style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: isMobile ? 'flex-start' : 'center',
        padding: isMobile ? '8px 10px' : '10px 15px',
        background: 'linear-gradient(to right, #264653, #2a6f97)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        color: 'white',
        zIndex: 10
      }}>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '5px'
        }}>
          <span style={{ 
            fontWeight: 'bold', 
            fontSize: isMobile ? '14px' : '16px',
            textShadow: '1px 1px 2px rgba(0,0,0,0.4)'
          }}>
            Room: {roomCode}
          </span>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: isMobile ? '2px 8px' : '4px 10px',
            borderRadius: '16px',
            fontSize: isMobile ? '12px' : '14px'
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
        
        {/* Autoplay button */}
        <button
          onClick={toggleAutoPlay}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '5px',
            background: autoPlayEnabled ? 'linear-gradient(to right, #2a9d8f, #5fc4b5)' : 'rgba(255,255,255,0.2)',
            color: 'white',
            border: 'none',
            borderRadius: '16px',
            padding: isMobile ? '3px 10px' : '5px 12px',
            fontSize: isMobile ? '12px' : '14px',
            cursor: 'pointer',
            boxShadow: autoPlayEnabled ? '0 2px 5px rgba(42, 157, 143, 0.5)' : 'none',
            position: 'absolute',
            right: isMobile ? '10px' : '20px',
            top: isMobile ? '45px' : '50px',
            zIndex: 20
          }}
        >
          <RobotIcon />
          <span>{autoPlayEnabled ? 'Auto: ON' : 'Auto: OFF'}</span>
        </button>
        </div>
        
        {/* Score display in the middle */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 15
        }}>
          <div style={{
            background: 'linear-gradient(45deg, #2a9d8f, #264653)',
            padding: isMobile ? '6px 12px' : '8px 16px',
            borderRadius: '15px',
            boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{
              color: 'white',
              fontSize: isMobile ? '10px' : '12px',
              fontWeight: 'bold',
              marginBottom: '-2px',
              textTransform: 'uppercase',
              textShadow: '0px 1px 1px rgba(0,0,0,0.4)'
            }}>WINS</span>
            <span style={{
              color: '#e9c46a',
              fontSize: isMobile ? '24px' : '32px',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>{myWins}</span>
          </div>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: isMobile ? '4px' : '10px',
          flexWrap: isMobile ? 'wrap' : 'nowrap',
          justifyContent: 'flex-end',
          maxWidth: isMobile ? '60%' : 'auto'
        }}>
          {players.map((p) => (
            <div 
              key={p.id} 
              style={{ 
                padding: isMobile ? '4px 8px' : '5px 10px', 
                background: p.isCurrentPlayer 
                  ? 'linear-gradient(to bottom, #f4a261, #e76f51)' 
                  : 'linear-gradient(to bottom, #e9c46a, #f4a261)',
                borderRadius: '8px',
                color: '#264653',
                fontWeight: p.isCurrentPlayer ? 'bold' : 'normal',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: isMobile ? '60px' : '85px',
                maxWidth: isMobile ? '65px' : '100px',
                boxShadow: p.isCurrentPlayer 
                  ? '0 3px 10px rgba(231, 111, 81, 0.5)' 
                  : '0 2px 5px rgba(233, 196, 106, 0.3)',
                transform: p.isCurrentPlayer ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.3s ease'
              }}>
              <span style={{ 
                fontSize: isMobile ? '12px' : '14px',
                fontWeight: p.isCurrentPlayer ? 'bold' : 'normal',
                textShadow: p.isCurrentPlayer ? '0 1px 1px rgba(0,0,0,0.2)' : 'none',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: isMobile ? '55px' : '75px'
              }}>
                {p.name}
              </span>
              <div style={{ 
                display: 'flex',
                gap: '4px',
                marginTop: '2px'
              }}>
                <span style={{ 
                  fontSize: isMobile ? '10px' : '12px',
                  fontWeight: p.isCurrentPlayer ? 'bold' : 'normal',
                  backgroundColor: p.isCurrentPlayer ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.2)',
                  padding: isMobile ? '1px 4px' : '2px 6px',
                  borderRadius: '10px'
                }}>
                  {p.cards} cards
                </span>
                <span style={{ 
                  fontSize: isMobile ? '10px' : '12px',
                  fontWeight: 'bold',
                  backgroundColor: 'rgba(42, 157, 143, 0.8)',
                  padding: isMobile ? '1px 4px' : '2px 6px',
                  borderRadius: '10px',
                  color: 'white'
                }}>
                  {p.wins || 0} Wins
                </span>
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