import React, { useState, useEffect } from 'react';
import Card from './Card';
import { getCardImagePath, getSuitImagePath } from '../../game/utils';
import { SUITS, GAME_PHASES } from '../../game/types';

const GameBoard = ({
  discardPile,
  deckCount,
  onDeckClick,
  currentPlayerIndex,
  direction,
  onSuitSelect,
  gamePhase,
  wildSuit,
  drawCount,
  chainType,
  players,
  isCurrentPlayer,
  lastPlayerIndex,
  playerIndex,
  pendingGuraDecision,
  onConfirmGura,
  guraCardValue,
  hasManyGuraCards
}) => {
  const topCard = discardPile[discardPile.length - 1];
  
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
  
  return (
    <div className="game-board" style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden',
      borderRadius: '10px'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center', width: '100%' }}>
        {/* Draw count if active */}
        {drawCount > 0 && (
          <div style={{ 
            marginBottom: '15px', 
            padding: '10px 20px', 
            backgroundColor: '#e76f51', 
            color: 'white',
            borderRadius: '8px',
            fontWeight: 'bold',
            animation: 'pulse 1.5s infinite',
            fontSize: '16px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            border: '2px solid #e76f51'
          }}>
            <p style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '18px', marginRight: '8px' }}>⚠️</span>
              Draw {drawCount} cards!
            </p>
          </div>
        )}
        
        {/* Message for other players during suit selection */}
        {gamePhase === GAME_PHASES.SUIT_SELECTION && lastPlayerIndex !== playerIndex && (
          <div style={{
            marginBottom: '15px',
            padding: '12px 15px',
            backgroundColor: '#2a9d8f',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
            color: 'white',
            fontWeight: 'bold',
            border: '2px solid #2a9d8f',
            animation: 'pulse 1.5s infinite'
          }}>
            <p style={{ margin: 0, fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '18px', marginRight: '8px' }}>⏳</span>
              Waiting for {lastPlayerIndex !== null && players[lastPlayerIndex] ? players[lastPlayerIndex].name : 'another player'} to select a suit...
            </p>
          </div>
        )}
        
        {/* GURA decision UI */}
        {pendingGuraDecision && isCurrentPlayer && (
          <div style={{
            marginBottom: '15px',
            padding: '15px',
            backgroundColor: '#e76f51',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
            color: 'white',
            fontWeight: 'bold',
            border: '2px solid #e76f51',
            animation: 'pulse 1.5s infinite'
          }}>
            <p style={{ margin: '0 0 15px 0', fontSize: '18px' }}>
              {hasManyGuraCards ? 
                `You played a ${guraCardValue} and have multiple in hand. Choose:` : 
                `You played a ${guraCardValue}. Start a GURA round?`
              }
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button 
                onClick={() => onConfirmGura(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2a9d8f',
                  border: 'none',
                  borderRadius: '5px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                Start GURA
              </button>
              <button 
                onClick={() => onConfirmGura(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#264653',
                  border: 'none',
                  borderRadius: '5px',
                  color: 'white',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '16px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                {hasManyGuraCards ? 'Continue Playing' : 'Don\'t Start'}
              </button>
            </div>
          </div>
        )}
        
        {/* Wild suit selection - only show to the player who played the Ace */}
        {gamePhase === GAME_PHASES.SUIT_SELECTION && lastPlayerIndex === playerIndex && (
          <div style={{ 
            marginBottom: '15px',
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            padding: '15px',
            backgroundColor: '#2a9d8f',
            borderRadius: '10px',
            boxShadow: '0 3px 6px rgba(0,0,0,0.2)',
            color: 'white',
            border: '2px solid #2a9d8f',
            animation: 'pulse 1.5s infinite'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '18px' }}>SELECT A SUIT:</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
              {Object.values(SUITS).map(suit => (
                <div 
                  key={suit} 
                  onClick={() => onSuitSelect(suit)}
                  style={{
                    cursor: 'pointer',
                    width: '60px',
                    height: '60px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '5px',
                    backgroundColor: 'white',
                    border: '3px solid #f4a261',
                    borderRadius: '10px',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'scale(1.1)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.3)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                  }}
                >
                  <img 
                    src={getSuitImagePath(suit)} 
                    alt={suit} 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Card piles */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          gap: isMobile ? '30px' : '50px', /* Adjust gap based on screen size */
          marginBottom: '20px',
          flexWrap: 'wrap', /* Allow wrapping on very small screens */
          padding: isMobile ? '5px' : '10px'
        }}>
          {/* Draw pile */}
          <div style={{ 
            textAlign: 'center',
            position: 'relative'
          }}>
            {isCurrentPlayer && (
              <div style={{
                position: 'absolute',
                top: '-10px',
                left: '-10px',
                right: '-10px',
                bottom: '-10px',
                borderRadius: '15px',
                animation: 'pulse-green 1.5s infinite',
                zIndex: 0,
                pointerEvents: 'none'
              }} />
            )}
            <div style={{ position: 'relative', zIndex: 1 }}>
              <Card 
                onClick={onDeckClick} 
                card={null}
              />
            </div>
            <p style={{ 
              margin: '5px 0 0 0', 
              fontSize: isMobile ? '14px' : '16px', 
              fontWeight: 'bold', 
              color: deckCount === 0 ? '#e76f51' : '#264653',
              backgroundColor: 'rgba(255,255,255,0.9)',
              padding: isMobile ? '3px 10px' : '4px 12px',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              {deckCount} cards left{deckCount === 0 ? ' (empty)' : ''}
            </p>
          </div>
          
          {/* Discard pile */}
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <Card 
              card={topCard} 
            />
            
            {/* Wild suit indicator */}
            {wildSuit && topCard.value === '1' && (
              <div style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '5px',
                border: '2px solid #e76f51',
                boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
              }}>
                <img 
                  src={getSuitImagePath(wildSuit)} 
                  alt={wildSuit} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            )}
            
            <p style={{ 
              margin: '5px 0 0 0', 
              fontSize: isMobile ? '14px' : '16px', 
              fontWeight: 'bold', 
              color: '#264653',
              backgroundColor: 'rgba(255,255,255,0.9)',
              padding: isMobile ? '3px 10px' : '4px 12px',
              borderRadius: '6px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}>
              Discard Pile ({discardPile.length})
            </p>
          </div>
        </div>
        
        {/* Game status text */}
        {chainType && (
          <div style={{ 
          padding: '10px 20px',
          backgroundColor: chainType === 'gura' ? '#e34a4a' : '#f8f9fa',
          borderRadius: '5px',
          marginTop: '10px',
          boxShadow: chainType === 'gura' ? '0 3px 10px rgba(227, 74, 74, 0.5)' : '0 2px 5px rgba(0,0,0,0.2)',
          fontSize: chainType === 'gura' ? '18px' : '14px',
          fontWeight: 'bold',
          color: chainType === 'gura' ? 'white' : '#333',
          animation: chainType === 'gura' ? 'pulse 1.5s infinite' : 'none',
          border: chainType === 'gura' ? '2px solid #c53030' : 'none'
          }}>
            {chainType === 'draw_chain' && (
              <p style={{ margin: 0 }}>Chain of 7s active! Play a 7 or draw cards.</p>
            )}
            {chainType === 'draw_ten' && (
              <p style={{ margin: 0 }}>Chain of black Jacks active! Play a black Jack to continue, a red Jack to negate, or draw cards.</p>
            )}
            {chainType === 'draw_ten_response' && (
              <p style={{ margin: 0 }}>You can play a red Jack to negate or draw cards.</p>
            )}
            {chainType === 'gura' && (
              <p style={{ margin: 0 }}>
                <span style={{ fontSize: '18px', marginRight: '5px' }}>🃏</span>
                GURA ROUND!
                <span style={{ fontSize: '18px', marginLeft: '5px' }}>🃏</span>
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
