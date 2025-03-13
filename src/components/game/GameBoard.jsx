import React from 'react';
import Card from './Card';
import { getCardImagePath, getSuitImagePath } from '../../game/utils';
import { SUITS } from '../../game/types';

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
  playerIndex
}) => {
  const topCard = discardPile[discardPile.length - 1];
  
  return (
    <div className="game-board" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, justifyContent: 'center', width: '100%' }}>
        {/* Draw count if active */}
        {drawCount > 0 && (
          <div style={{ 
            marginBottom: '15px', 
            padding: '8px 15px', 
            backgroundColor: '#e76f51', 
            color: 'white',
            borderRadius: '8px',
            fontWeight: 'bold',
            animation: 'pulse 1.5s infinite'
          }}>
            <p style={{ margin: 0 }}>Draw {drawCount} cards!</p>
          </div>
        )}
        
        {/* Message for other players during suit selection */}
        {gamePhase === 'suit_selection' && lastPlayerIndex !== playerIndex && (
          <div style={{
            marginBottom: '15px',
            padding: '10px 15px',
            backgroundColor: '#f1faee',
            borderRadius: '10px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <p style={{ margin: 0, fontWeight: 'bold' }}>
              Waiting for {lastPlayerIndex !== null && players[lastPlayerIndex] ? players[lastPlayerIndex].name : 'another player'} to select a suit...
            </p>
          </div>
        )}
        
        {/* Wild suit selection - only show to the player who played the Ace */}
        {gamePhase === 'suit_selection' && lastPlayerIndex === playerIndex && (
          <div style={{ 
            marginBottom: '15px',
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            padding: '10px 15px',
            backgroundColor: '#f1faee',
            borderRadius: '10px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Select a suit:</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              {Object.values(SUITS).map(suit => (
                <div 
                  key={suit} 
                  onClick={() => onSuitSelect(suit)}
                  style={{
                    cursor: 'pointer',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    padding: '5px',
                    border: '2px solid #ddd',
                    borderRadius: '5px',
                    transition: 'transform 0.2s, border-color 0.2s',
                    hover: {
                      transform: 'scale(1.05)',
                      borderColor: '#4c9aff'
                    }
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
            padding: '5px 15px',
            backgroundColor: '#f8f9fa',
            borderRadius: '5px',
            marginTop: '5px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            fontSize: '14px'
          }}>
            {chainType === 'draw_chain' && (
              <p style={{ margin: 0 }}>Chain of 7s active! Play a 7 or draw cards.</p>
            )}
            {chainType === 'draw_ten' && (
              <p style={{ margin: 0 }}>Chain of black Jacks active! Play a black Jack or draw cards.</p>
            )}
            {chainType === 'draw_ten_response' && (
              <p style={{ margin: 0 }}>You can play a red Jack to negate or draw cards.</p>
            )}
            {chainType === 'gura' && (
              <p style={{ margin: 0 }}>GURA round! Play a {topCard?.value === 'king' ? 'King' : 'Queen'} or draw a card.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameBoard;
