import React from 'react';
import Card from './Card';
import { canPlayCard } from '../../game/utils';

const PlayerHand = ({ 
  cards, 
  onCardClick, 
  currentCard, 
  isCurrentPlayer, 
  wildSuit,
  isChainActive,
  chainType 
}) => {
  // Determine which cards can be played
  const getPlayableCards = () => {
    if (!isCurrentPlayer) return [];
    
    // If we're in a chain of 7s
    if (isChainActive && chainType === 'draw_chain') {
      // Only 7s can be played in this chain
      return cards.filter(card => card.value === '7');
    }
    
    // If we're in a chain of black Jacks
    if (isChainActive && chainType === 'draw_ten') {
      // Only black Jacks can be played in this chain
      return cards.filter(card => 
        (card.value === 'jack' && (card.suit === 'clubs' || card.suit === 'spades'))
      );
    }
    
    // If we're in a chain of black Jacks and responding with a red Jack
    if (isChainActive && chainType === 'draw_ten_response') {
      // Only red Jacks can be played to negate
      return cards.filter(card => 
        (card.value === 'jack' && (card.suit === 'hearts' || card.suit === 'diamonds'))
      );
    }
    
    // If we're in a GURA round
    if (isChainActive && chainType === 'gura') {
      // Only kings or queens can be played in GURA
      const initiatorValue = currentCard.value;
      return cards.filter(card => card.value === initiatorValue);
    }
    
    // Normal play - cards that match suit or value
    return cards.filter(card => canPlayCard(currentCard, card, wildSuit));
  };
  
  const playableCards = getPlayableCards();
  
  return (
    <div className="player-hand" style={{ width: '100%', overflow: 'hidden' }}>
      <div
        style={{
          display: 'flex', 
          flexWrap: 'nowrap',
          justifyContent: 'center',
          padding: '5px',
          backgroundColor: isCurrentPlayer ? 'rgba(255, 248, 224, 0.3)' : 'transparent',
          borderRadius: '10px',
          gap: '0px',
          minHeight: '150px',
          overflowX: 'auto',
          overflowY: 'hidden',
          width: '100%',
          scrollbarWidth: 'none', /* Firefox */
          msOverflowStyle: 'none' /* IE and Edge */
        }}
      >
        {cards.map((card, index) => {
          const isPlayable = playableCards.some(c => c.id === card.id);
          return (
            <div 
              key={card.id}
              style={{
                transform: isPlayable ? 'translateY(-10px)' : 'none',
                transition: 'transform 0.2s ease',
                marginRight: '-30px' // Overlap cards for a more compact look
              }}
            >
              <Card
                card={card}
                onClick={() => onCardClick(card, index)}
                playable={isPlayable}
                inHand={true}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlayerHand;
