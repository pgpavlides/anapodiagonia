import React from 'react';
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
  guraCardValue
}) => {
  const topCard = discardPile[discardPile.length - 1];
  
  return (
    <div className="game-board" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
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
              You played a {guraCardValue}. Start a GURA round?
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
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
                Don't Start
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
          gap: '50px',
          marginBottom: '10px'
        }}>
          {/* Draw pile */}
          <div style={{ textAlign: 'center' }}>
            <Card 
              onClick={onDeckClick} 
              card={null}
            />
            <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>{deckCount} cards left</p>
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
                top: '5px',
                right: '5px',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '3px'
              }}>
                <img 
                  src={getSuitImagePath(wildSuit)} 
                  alt={wildSuit} 
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
              </div>
            )}
            
            <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>Discard Pile</p>
          </div>
        </div>
        
        {/* Game status text */}
        {chainType && (
          <div style={{ 
            padding: '10px 20px',
            backgroundColor: chainType === 'gura' ? '#e76f51' : '#f8f9fa',
            borderRadius: '5px',
            marginTop: '10px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            fontSize: chainType === 'gura' ? '16px' : '14px',
            fontWeight: 'bold',
            color: chainType === 'gura' ? 'white' : '#333',
            animation: chainType === 'gura' ? 'pulse 1.5s infinite' : 'none',
            border: chainType === 'gura' ? '2px solid #e76f51' : 'none'
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
                GURA ROUND! Play a {topCard?.value === 'king' ? 'King' : 'Queen'} or draw a card.
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
