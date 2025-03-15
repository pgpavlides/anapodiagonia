import React, { useState, useEffect } from 'react';
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
  // Detect if we're on mobile using screen width
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // State to track card viewing mode on mobile
  const [compactView, setCompactView] = useState(false);
  
  // Update mobile detection on window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // No automatic compact view change when card count changes
  
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
      // Both black Jacks (to continue chain) and red Jacks (to negate) can be played
      return cards.filter(card => 
        (card.value === 'jack')
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
  
  // Function to toggle compact view mode
  const toggleCompactView = () => {
    setCompactView(!compactView);
  };
  
  // This function gets the optimal number of cards to show per row
  const getCardsPerRow = () => {
    const screenWidth = window.innerWidth;
    const cardWidth = isMobile ? 65 : 90; // Match the Card component width
    const cardGap = 2;
    const padding = 20;
    const availableWidth = screenWidth - padding;
    
    // Calculate how many cards can fit in a row with minimal overlap
    let cardsPerRow = Math.floor(availableWidth / (cardWidth - 35)); // Allow overlap
    
    // Ensure we show at least 4 cards per row on mobile
    return Math.max(cardsPerRow, 4);
  };
  
  // Create rows of cards for the compact view
  const cardRows = () => {
    if (!compactView) return [cards];
    
    const cardsPerRow = getCardsPerRow();
    const rows = [];
    
    for (let i = 0; i < cards.length; i += cardsPerRow) {
      rows.push(cards.slice(i, i + cardsPerRow));
    }
    
    return rows;
  };
  
  return (
    <div className="player-hand" style={{ 
      width: '100%', 
      overflow: 'hidden', 
      paddingBottom: '5px', 
      boxSizing: 'border-box' 
    }}>
      {/* View mode toggle button on mobile with many cards */}
      {isMobile && cards.length > 8 && (
        <div style={{ textAlign: 'center', marginBottom: '5px' }}>
          <button 
            onClick={toggleCompactView}
            style={{
              backgroundColor: '#2a9d8f',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              padding: '4px 10px',
              margin: '0 auto 3px auto',
              fontSize: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <span>{compactView ? 'Normal view' : 'Multi-row view'}</span>
          </button>
        </div>
      )}
      
      {/* Main card display container */}
      <div style={{ 
        position: 'relative',
        height: 'auto',
        minHeight: compactView ? (isMobile ? '180px' : '200px') : (isMobile ? '120px' : '180px'),
        margin: '0 auto',
        backgroundColor: isCurrentPlayer ? 'rgba(255, 248, 224, 0.1)' : 'transparent',
        borderRadius: '10px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {compactView ? (
          // Multi-row compact view for many cards
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            padding: '4px',
            height: '100%',
            overflowY: 'auto'
          }}>
            {cardRows().map((row, rowIndex) => (
              <div key={`row-${rowIndex}`} style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'nowrap',
                gap: '0',
                marginBottom: '2px'
              }}>
                {row.map((card, index) => {
                  const cardIndex = rowIndex * getCardsPerRow() + index;
                  const isPlayable = playableCards.some(c => c.id === card.id);
                  return (
                    <div 
                      key={card.id}
                      style={{
                        transform: isPlayable ? 'translateY(-6px)' : 'none',
                        transition: 'transform 0.3s ease',
                        margin: '0',
                        marginRight: index < row.length - 1 ? '-40px' : '0', // More overlap on row
                        zIndex: 10 + index, // Keep consistent z-index based on position
                        position: 'relative'
                      }}
                  onMouseEnter={(e) => {
                    if (isCurrentPlayer) {
                      e.currentTarget.style.transform = `translateY(-15px)`;
                      // Don't change z-index to keep cards in proper order
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isCurrentPlayer) {
                      e.currentTarget.style.transform = isPlayable ? 'translateY(-8px)' : 'none';
                      // Don't reset z-index
                    }
                  }}
                    >
                      {/* Green dot indicator removed */}
                      <Card
                        card={card}
                        onClick={() => onCardClick(card, cardIndex)}
                        playable={isPlayable}
                        inHand={true}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          // Standard view - better for fewer cards
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '4px',
            gap: isMobile ? '0px' : '2px'
          }}>
            {cards.map((card, index) => {
              const isPlayable = playableCards.some(c => c.id === card.id);
              return (
                <div 
                  key={card.id}
                  style={{
                    transform: isPlayable ? 'translateY(-8px)' : 'none',
                    transition: 'transform 0.3s ease',
                    margin: '0',
                    marginRight: isMobile ? '-35px' : '-20px', // More overlap for mobile
                    zIndex: 10 + index, // Keep consistent z-index based on position
                    position: 'relative'
                  }}
                >
                  {/* Green dot indicator removed */}
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
        )}
      </div>
      
      {/* Card count info */}
      <div style={{
        textAlign: 'center',
        fontSize: '12px',
        color: '#666',
        marginTop: '5px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '10px'
      }}>
        <span>{cards.length === 1 ? 'You have 1 card' : `You have ${cards.length} cards`}</span>
        {isCurrentPlayer && (
          <span style={{
            color: playableCards.length > 0 ? '#2a9d8f' : '#e76f51',
            fontWeight: 'bold'
          }}>
            {playableCards.length === 0 ? 
              '(No playable cards)' : 
              `(${playableCards.length} playable)`
            }
          </span>
        )}
      </div>
    </div>
  );
};

export default PlayerHand;