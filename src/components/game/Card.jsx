import React from 'react';
import { getCardImagePath, getCardEffect } from '../../game/utils';

const Card = ({ card, onClick, playable = false, inHand = false }) => {
  // Only try to get effect and image path if card exists
  const cardImagePath = card ? getCardImagePath(card) : '';
  const cardEffect = getCardEffect(card); // Already handles null cards
  
  // Check if we're on mobile
  const isMobile = window.innerWidth < 768;
  
  // Card sizes for different scenarios
  const cardSize = inHand ? (
    isMobile ? {
      width: '60px',   // Slightly smaller on mobile for tighter packing
      height: '90px'
    } : {
      width: '90px',
      height: '135px'
    }
  ) : (
    // Cards on board - bigger (same size on mobile and desktop)
    {
      width: '130px',
      height: '195px'
    }
  );
  
  // Handle click on the card
  const handleClick = () => {
    if (onClick && (playable || !inHand)) {
      onClick(card);
    }
  };
  
  if (!card) {
    // Card back 
    return (
      <div 
        className="card card-back"
        style={{
          width: cardSize.width,
          height: cardSize.height,
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
          margin: '0px',
          cursor: onClick ? 'pointer' : 'not-allowed',
          transition: 'transform 0.2s, box-shadow 0.2s',
          position: 'relative'
        }}
        onClick={onClick}
        onMouseOver={(e) => {
          if (onClick) {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)';
          }
        }}
        onMouseOut={(e) => {
          if (onClick) {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
          }
        }}
      >
        <img 
          src="/card_black_back.webp" 
          alt="Card Back"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            borderRadius: '8px'
          }}
        />
        
        {/* Card stack effect for draw pile */}
        {onClick && (
          <>
            <div style={{
              position: 'absolute',
              top: -3,
              left: -3,
              width: cardSize.width,
              height: cardSize.height,
              borderRadius: '8px',
              zIndex: -1,
              overflow: 'hidden'
            }}>
              <img 
                src="/card_black_back.webp" 
                alt="Card Back"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            </div>
            <div style={{
              position: 'absolute',
              top: -6,
              left: -6,
              width: cardSize.width,
              height: cardSize.height,
              borderRadius: '8px',
              zIndex: -2,
              overflow: 'hidden'
            }}>
              <img 
                src="/card_black_back.webp" 
                alt="Card Back"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '8px'
                }}
              />
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`card ${playable ? 'playable' : ''} ${inHand ? 'in-hand' : ''}`}
      style={{
        width: cardSize.width,
        height: cardSize.height,
        position: 'relative',
        borderRadius: '8px',
        boxShadow: playable ? '0 0 10px rgba(42, 157, 143, 0.7)' : '0 2px 4px rgba(0, 0, 0, 0.2)',
        margin: '0px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: playable || !inHand ? 'pointer' : 'default',
        backgroundColor: 'transparent',
        border: playable ? '2px solid #2a9d8f' : 'none'
      }}
      onClick={handleClick}
      title={cardEffect.description}
    >
      <img
        src={cardImagePath}
        alt={`${card.suit} ${card.value}`}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: '6px'
        }}
      />
    </div>
  );
};

export default Card;