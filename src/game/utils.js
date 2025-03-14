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
  
  // If current top card is an ACE with a selected suit
  if (currentCard.value === VALUES.ACE && wildSuit) {
    // If player is trying to play another ACE
    if (playedCard.value === VALUES.ACE) {
      // Only allow if the ACE matches the selected wild suit
      return playedCard.suit === wildSuit;
    }
    
    // For non-ACE cards, the card must match the wild suit
    return playedCard.suit === wildSuit;
  }
  
  // If trying to play a wild card (Ace) on a non-ACE
  if (playedCard.value === VALUES.ACE) {
    // ACE can be played on any card that's not another ACE
    return currentCard.value !== VALUES.ACE;
  }
  
  // Standard matching rules: same suit (shape) or same value
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
  
  // Get the effect of the first card
  const topCard = discardPile[0];
  let initialGameState = {
    deck: newDeck,
    discardPile,
    hands,
    currentPlayerIndex: 0,
    lastPlayerIndex: null,
    guraStarterIndex: null,
    direction: 'clockwise',
    gamePhase: 'playing',
    wildSuit: null,
    drawCount: 0,
    chainType: null,
    winner: null,
    logs: [{ message: 'Game started', timestamp: Date.now() }]
  };

  // Apply effect of the first card
  if (topCard) {
    const effect = getCardEffect(topCard);
    initialGameState.logs.push({ 
      message: `Top card is ${topCard.suit} ${topCard.value}`, 
      timestamp: Date.now() 
    });
    
    switch (effect.type) {
      case 'wild': // Ace
        // We'll need to randomly select a suit since there's no player to choose
        const suits = Object.values(SUITS);
        const randomSuit = suits[Math.floor(Math.random() * suits.length)];
        initialGameState.wildSuit = randomSuit;
        initialGameState.logs.push({ 
          message: `Initial wild card randomly selected ${randomSuit} as the active suit`, 
          timestamp: Date.now() 
        });
        break;
        
      case 'draw_two': // 2
        // First player draws 2 cards
        for (let i = 0; i < 2; i++) {
          if (initialGameState.deck.length > 0) {
            const drawnCard = initialGameState.deck.pop();
            initialGameState.hands[0].push(drawnCard);
          }
        }
        initialGameState.logs.push({ 
          message: `First player draws 2 cards from initial 2 card`, 
          timestamp: Date.now() 
        });
        // Skip first player's turn
        initialGameState.currentPlayerIndex = 1 % numPlayers;
        break;
        
      case 'reverse': // 3
        // Reverse initial direction
        initialGameState.direction = 'counter_clockwise';
        initialGameState.logs.push({ 
          message: `Initial direction reversed to counter-clockwise`, 
          timestamp: Date.now() 
        });
        break;
        
      case 'draw_chain': // 7
        // Start with draw chain active
        initialGameState.chainType = 'draw_chain';
        initialGameState.drawCount = 2;
        initialGameState.logs.push({ 
          message: `Initial 7 starts a chain! First player must draw 2 cards or play a 7`, 
          timestamp: Date.now() 
        });
        break;
        
      case 'play_again': // 8
        // No effect at start
        break;
        
      case 'skip': // 9
        // Skip first player
        initialGameState.currentPlayerIndex = 1 % numPlayers;
        initialGameState.logs.push({ 
          message: `First player's turn skipped due to initial 9`, 
          timestamp: Date.now() 
        });
        break;
        
      case 'draw_ten': // Black Jack
        initialGameState.chainType = 'draw_ten';
        initialGameState.drawCount = 10;
        initialGameState.logs.push({ 
          message: `Initial Black Jack starts a chain! First player must draw 10 cards or play a black Jack`, 
          timestamp: Date.now() 
        });
        break;
        
      case 'negate': // Red Jack
        // No effect at start
        break;
        
      case 'gura': // King/Queen
        // No effect at start - can't start with GURA
        break;
        
      default:
        // Normal card - no effect
        break;
    }
  }
  
  return initialGameState;
};
