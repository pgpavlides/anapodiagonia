// Card suits
export const SUITS = {
  HEARTS: 'hearts',
  DIAMONDS: 'diamonds',
  CLUBS: 'clubs',
  SPADES: 'spades'
};

// Card values
export const VALUES = {
  ACE: '1',
  TWO: '2',
  THREE: '3',
  FOUR: '4',
  FIVE: '5',
  SIX: '6',
  SEVEN: '7',
  EIGHT: '8',
  NINE: '9',
  TEN: '10',
  JACK: 'jack',
  QUEEN: 'queen',
  KING: 'king'
};

// Card types
export const CARD_TYPES = {
  NORMAL: 'normal',
  SPECIAL: 'special'
};

// Game directions
export const DIRECTIONS = {
  CLOCKWISE: 'clockwise',
  COUNTER_CLOCKWISE: 'counter_clockwise'
};

// Special card effects
export const EFFECTS = {
  DRAW_TWO: 'draw_two',
  DRAW_TEN: 'draw_ten',
  SKIP: 'skip',
  REVERSE: 'reverse',
  WILD: 'wild',
  PLAY_AGAIN: 'play_again',
  GURA: 'gura',
  // Chaos mode effects
  SWAP_HANDS: 'swap_hands',
  STEAL_CARD: 'steal_card',
  SWAP_RANDOM: 'swap_random',
  SEE_HAND: 'see_hand'
};

// Game phases
export const GAME_PHASES = {
  LOBBY: 'lobby',
  PLAYING: 'playing',
  SUIT_SELECTION: 'suit_selection',
  GURA: 'gura',
  GAME_OVER: 'game_over',
  PLAYER_SELECTION: 'player_selection' // For selecting an opponent in Chaos mode
};

// Game modes
export const GAME_MODES = {
  CLASSIC: 'classic',
  CHAOS: 'chaos'
};
