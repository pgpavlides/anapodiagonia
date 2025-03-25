import React from 'react';
import { GAME_MODES } from '../../game/types';

const RulesModal = ({ isOpen, onClose, gameMode }) => {
  if (!isOpen) return null;
  
  const cardRules = [
    { 
      value: '1', 
      name: 'Ace',
      classic: 'Can be played on any card and change the suit',
      chaos: 'Can be played on any card and change the suit'
    },
    { 
      value: '2', 
      name: 'Two',
      classic: 'Makes the previous player draw 2 cards',
      chaos: 'Makes the previous player draw 2 cards'
    },
    { 
      value: '3', 
      name: 'Three',
      classic: 'Changes the direction of play',
      chaos: 'Changes the direction of play'
    },
    { 
      value: '4', 
      name: 'Four',
      classic: 'No special effect',
      chaos: 'Swap hands with an opponent'
    },
    { 
      value: '5', 
      name: 'Five',
      classic: 'No special effect',
      chaos: 'Take one card from an opponent'
    },
    { 
      value: '6', 
      name: 'Six',
      classic: 'No special effect',
      chaos: 'Swap a random card with an opponent'
    },
    { 
      value: '7', 
      name: 'Seven',
      classic: 'Next player draws 2 cards or plays another 7 to chain',
      chaos: 'Next player draws 2 cards or plays another 7 to chain'
    },
    { 
      value: '8', 
      name: 'Eight',
      classic: 'Player can play again',
      chaos: 'Player can play again'
    },
    { 
      value: '9', 
      name: 'Nine',
      classic: 'Skip the next player\'s turn',
      chaos: 'Skip the next player\'s turn'
    },
    { 
      value: '10', 
      name: 'Ten',
      classic: 'No special effect',
      chaos: 'Reveal an opponent\'s hand to everyone'
    },
    { 
      value: 'jack', 
      name: 'Jack',
      classic: 'Next player must play a Jack or draw 5 cards',
      chaos: 'Next player must play a Jack or draw 5 cards'
    },
    { 
      value: 'queen', 
      name: 'Queen',
      classic: 'Next player must play a Queen, King, or draw 5 cards',
      chaos: 'Next player must play a Queen, King, or draw 5 cards'
    },
    { 
      value: 'king', 
      name: 'King',
      classic: 'Next player must play a King, Queen, or draw 5 cards',
      chaos: 'Next player must play a King, Queen, or draw 5 cards'
    }
  ];

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={styles.modalHeader}>
          <h2 style={styles.modalTitle}>Game Rules</h2>
          <button 
            onClick={onClose}
            style={styles.closeButton}
          >
            ✕
          </button>
        </div>
        
        <div style={styles.modeSelector}>
          <div style={styles.modeInfo}>
            <h3 style={styles.modeTitle}>Current Mode: {gameMode === GAME_MODES.CHAOS ? 'Chaos' : 'Classic'}</h3>
            <p style={styles.modeDescription}>
              {gameMode === GAME_MODES.CHAOS 
                ? 'Chaos mode includes all Classic rules plus special effects for cards 4, 5, 6, and 10.'
                : 'Classic mode has special effects for cards 1, 2, 3, 7, 8, 9, Jack, Queen, and King.'}
            </p>
          </div>
        </div>
        
        <div style={styles.rulesContainer}>
          <h3 style={styles.sectionTitle}>Card Effects</h3>
          
          <div style={styles.cardGrid}>
            {cardRules.map(card => (
              <div key={card.value} style={styles.cardRule}>
                <div style={styles.cardImages}>
                  {['hearts', 'diamonds', 'clubs', 'spades'].map(suit => (
                    <img 
                      key={suit}
                      src={`/playing_cards/${suit}_${card.value}.svg`}
                      alt={`${card.name} of ${suit}`}
                      style={styles.cardImage}
                    />
                  ))}
                </div>
                <div style={styles.cardInfo}>
                  <h4 style={styles.cardName}>{card.name}</h4>
                  <div style={styles.effectsContainer}>
                    <div style={styles.effectBox}>
                      <h5 style={styles.effectTitle}>Classic Mode</h5>
                      <p style={styles.effectText}>{card.classic}</p>
                    </div>
                    <div style={{
                      ...styles.effectBox,
                      backgroundColor: gameMode === GAME_MODES.CHAOS ? 'rgba(231, 111, 81, 0.2)' : 'rgba(42, 157, 143, 0.1)',
                      borderColor: gameMode === GAME_MODES.CHAOS ? 'rgba(231, 111, 81, 0.5)' : 'rgba(42, 157, 143, 0.3)'
                    }}>
                      <h5 style={{
                        ...styles.effectTitle,
                        color: gameMode === GAME_MODES.CHAOS ? '#e76f51' : '#2a9d8f'
                      }}>Chaos Mode</h5>
                      <p style={styles.effectText}>{card.chaos}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div style={styles.generalRules}>
            <h3 style={styles.sectionTitle}>General Rules</h3>
            <ul style={styles.rulesList}>
              <li>Players can only play cards that match the suit or value of the top card on the discard pile.</li>
              <li>If a player cannot play a card, they must draw one from the deck.</li>
              <li>The first player to get rid of all their cards wins the round.</li>
              <li>Aces can be played on any card and allow the player to choose the next suit.</li>
              <li>Special card effects apply regardless of the suit (except in Classic mode for cards 4, 5, 6, and 10).</li>
            </ul>
          </div>
        </div>
        
        <button 
          onClick={onClose}
          style={styles.closeModalButton}
        >
          Close Rules
        </button>
      </div>
    </div>
  );
};

const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(5px)',
    overflowY: 'auto',
    padding: '20px'
  },
  modalContent: {
    backgroundColor: 'rgba(10, 20, 40, 0.95)',
    borderRadius: '15px',
    padding: '25px',
    width: '90%',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(100, 150, 255, 0.3)',
    position: 'relative',
    animation: 'fadeIn 0.3s ease'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '15px'
  },
  modalTitle: {
    color: 'white',
    margin: 0,
    fontSize: '28px',
    fontWeight: 'bold'
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '5px 10px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.2s ease'
  },
  modeSelector: {
    marginBottom: '20px',
    padding: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  modeInfo: {
    textAlign: 'center'
  },
  modeTitle: {
    color: 'white',
    margin: '0 0 10px 0',
    fontSize: '20px'
  },
  modeDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    margin: 0,
    fontSize: '16px'
  },
  rulesContainer: {
    marginBottom: '20px'
  },
  sectionTitle: {
    color: 'white',
    fontSize: '22px',
    marginBottom: '15px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    paddingBottom: '10px'
  },
  cardGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  cardRule: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    padding: '15px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      transform: 'translateY(-5px)'
    }
  },
  cardImages: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '10px',
    gap: '5px'
  },
  cardImage: {
    width: '40px',
    height: '60px',
    objectFit: 'contain',
    borderRadius: '5px',
    backgroundColor: 'white',
    padding: '2px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.2)'
  },
  cardInfo: {
    textAlign: 'center'
  },
  cardName: {
    color: 'white',
    margin: '0 0 10px 0',
    fontSize: '18px'
  },
  effectsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  effectBox: {
    backgroundColor: 'rgba(42, 157, 143, 0.1)',
    borderRadius: '8px',
    padding: '10px',
    border: '1px solid rgba(42, 157, 143, 0.3)'
  },
  effectTitle: {
    color: '#2a9d8f',
    margin: '0 0 5px 0',
    fontSize: '14px',
    fontWeight: 'bold'
  },
  effectText: {
    color: 'white',
    margin: 0,
    fontSize: '14px'
  },
  generalRules: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '10px',
    padding: '20px',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  rulesList: {
    color: 'white',
    paddingLeft: '20px',
    margin: 0,
    '& li': {
      marginBottom: '10px'
    }
  },
  closeModalButton: {
    backgroundColor: 'rgba(30, 60, 100, 0.8)',
    color: 'white',
    border: '2px solid rgba(100, 150, 255, 0.7)',
    borderRadius: '10px',
    padding: '12px 25px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    width: '100%',
    transition: 'all 0.2s ease',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
  }
};

export default RulesModal;