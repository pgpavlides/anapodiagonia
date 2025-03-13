import { SUITS, VALUES } from './types';

// Create a full deck of cards (2 standard decks = 106 cards)
export const createDeck = () => {
  const deck = [];
  
  // Create 2 standard decks
  for (let deckNum = 0; deckNum < 2; deckNum++) {
    // Create cards for each suit
    Object.values(SUITS).forEach(suit => {
      // Create cards for each value
      Object.values(VALUES).forEach(value => {
        deck.push({
          suit,
          value,
          id: `${suit}_${value}_${deckNum}` // Unique ID for each card
        });
      });
    });
  }
  
  return deck;
};

// Shuffle the deck using Fisher-Yates algorithm
export const shuffleDeck = (deck) => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Deal initial cards to players
export const dealCards = (deck, numPlayers, cardsPerPlayer = 7) => {
  const hands = Array(numPlayers).fill().map(() => []);
  const newDeck = [...deck];
  
  // Deal cards to each player
  for (let i = 0; i < cardsPerPlayer; i++) {
    for (let player = 0; player < numPlayers; player++) {
      if (newDeck.length > 0) {
        const card = newDeck.pop();
        hands[player].push(card);
      }
    }
  }
  
  // Draw the first card for the discard pile
  const discardPile = [];
  if (newDeck.length > 0) {
    const firstCard = newDeck.pop();
    discardPile.push(firstCard);
  }
  
  return {
    deck: newDeck,
    hands,
    discardPile
  };
};

// Check if a card can be played on top of the current card
export const canPlayCard = (currentCard, playedCard, wildSuit = null) => {
  // Handle null cards
  if (!currentCard || !playedCard) return false;
  
  // If it's a wild card (Ace), it can be played on any card
  if (playedCard.value === VALUES.ACE) {
    return true;
  }
  
  // If current top card is wild and a suit was selected
  if (currentCard.value === VALUES.ACE && wildSuit) {
    return playedCard.suit === wildSuit || playedCard.value === VALUES.ACE;
  }
  
  // Standard matching rules: same suit (shape) or same value
  // As per the rule clarification, shapes (suits) can be played on top of each other
  // regardless of the card value
  return (
    playedCard.suit === currentCard.suit || 
    playedCard.value === currentCard.value
  );
};

// Get the next player index
export const getNextPlayerIndex = (currentIndex, totalPlayers, direction, skip = false) => {
  if (skip) {
    // Skip the next player
    if (direction === 'clockwise') {
      return (currentIndex + 2) % totalPlayers;
    } else {
      return (currentIndex - 2 + totalPlayers) % totalPlayers;
    }
  } else {
    // Normal next player
    if (direction === 'clockwise') {
      return (currentIndex + 1) % totalPlayers;
    } else {
      return (currentIndex - 1 + totalPlayers) % totalPlayers;
    }
  }
};

// Check if a player has won (no cards left)
export const checkWinCondition = (playerHand) => {
  return playerHand.length === 0;
};

// Get the card image path
export const getCardImagePath = (card) => {
  if (!card) return '';
  return `/playing_cards/${card.suit}_${card.value}.svg`;
};

// Get the suit image path
export const getSuitImagePath = (suit) => {
  return `/playing_cards/${suit}_main.svg`;
};

// Get the effect of a card based on its value
export const getCardEffect = (card) => {
  // Handle null or undefined card
  if (!card) {
    return { type: 'none', description: 'No card effect' };
  }
  
  const { suit, value } = card;
  
  switch (value) {
    case VALUES.ACE:
      return { type: 'wild', description: 'Can be played on any card and change the suit' };
    case VALUES.TWO:
      return { type: 'draw_two', description: 'Makes the previous player draw 2 cards' };
    case VALUES.THREE:
      return { type: 'reverse', description: 'Changes the direction of play' };
    case VALUES.SEVEN:
      return { type: 'draw_chain', description: 'Next player draws 2 cards or plays another 7 to chain' };
    case VALUES.EIGHT:
      return { type: 'play_again', description: 'Player can play again' };
    case VALUES.NINE:
      return { type: 'skip', description: 'Makes the next player lose a turn' };
    case VALUES.JACK:
      if (suit === SUITS.HEARTS || suit === SUITS.DIAMONDS) {
        return { type: 'negate', description: 'Negates the effect of a black Jack' };
      } else {
        return { type: 'draw_ten', description: 'Next player draws 10 cards or plays another black Jack to chain' };
      }
    case VALUES.QUEEN:
    case VALUES.KING:
      return { type: 'gura', description: 'Starts a GURA round if you have more in hand' };
    default:
      return { type: 'normal', description: '' };
  }
};

// Initialize game state
export const initializeGameState = (numPlayers) => {
  // Create and shuffle the deck
  const deck = shuffleDeck(createDeck());
  
  // Deal cards to players and set up initial discard pile
  const { deck: newDeck, hands, discardPile } = dealCards(deck, numPlayers);
  
  // Initial game state
  return {
    deck: newDeck,
    discardPile,
    hands,
    currentPlayerIndex: 0,
    lastPlayerIndex: null, // Track the player who played an Ace
    direction: 'clockwise',
    gamePhase: 'playing',
    wildSuit: null,
    drawCount: 0,
    chainType: null, // For 7s and black Jacks chains
    winner: null,
    logs: [{ message: 'Game started', timestamp: Date.now() }]
  };
};
