import React from 'react';
import { getCardImagePath, getCardEffect } from '../../game/utils';

const Card = ({ card, onClick, playable = false, inHand = false }) => {
  // Only try to get effect and image path if card exists
  const cardImagePath = card ? getCardImagePath(card) : '';
  const cardEffect = getCardEffect(card); // Already handles null cards
  
  // Handle click on the card
  const handleClick = () => {
    if (onClick && (playable || !inHand)) {
      onClick(card);
    }
  };
  
  if (!card) {
    // Card back or empty slot
    return (
      <div 
        className="card card-back"
        style={{
          width: '100px',
          height: '150px',
          backgroundColor: '#264653',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
          margin: '2px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          fontWeight: 'bold',
          cursor: onClick ? 'pointer' : 'default'
        }}
        onClick={onClick}
      >
        {onClick ? 'Draw' : ''}
      </div>
    );
  }

  return (
    <div
      className={`card ${playable ? 'playable' : ''} ${inHand ? 'in-hand' : ''}`}
      style={{
        width: '100px',
        height: '150px',
        position: 'relative',
        borderRadius: '8px',
        boxShadow: playable ? '0 0 8px #4c9aff' : '0 1px 3px rgba(0, 0, 0, 0.2)',
        margin: '2px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: playable || !inHand ? 'pointer' : 'default',
        backgroundColor: 'white'
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
          borderRadius: '8px'
        }}
      />
    </div>
  );
};

export default Card;
