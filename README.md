# Anapodiagonia Card Game

A multiplayer card game built with React, Vite, and PlayroomKit.

## Game Overview

Anapodiagonia is a turn-based card game that uses 2 standard decks (106 cards total). The objective is to be the first player to get rid of all your cards.

## Setup Instructions

1. Install dependencies:
   ```bash
   # Windows users can run the update-dependencies.bat file
   # Or manually run these commands:
   rmdir /s /q node_modules
   del /f package-lock.json
   npm install
   npm install playroomkit
   ```

2. Get a PlayroomKit game ID:
   - Go to [joinplayroom.com](https://joinplayroom.com)
   - Sign up and create a new game
   - Get your game ID from the dashboard

3. Update your PlayroomKit game ID:
   - Open `src/components/Lobby.jsx`
   - Replace `YOUR_GAME_ID` with your actual game ID in both create and join functions

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open the game in your browser at http://localhost:5173

## Game Rules

### Basic Gameplay
- Players take turns playing cards on a central discard pile
- You can play a card if it matches either the suit (Hearts, Diamonds, Clubs, Spades) or the value (1, 2, 3, etc.) of the card on top of the discard pile
- If you can't play a card, you must draw one from the deck
- The first player to get rid of all their cards wins

### Card Effects

Each card has a special effect:

- **1 (Ace)**: Wild card - can be played on any card and allows you to choose the next suit
- **2**: Makes the previous player draw 2 cards (in 2-player games, makes the other player draw)
- **3**: Reverses the turn order. In 2-player games, acts like an 8 (play again)
- **4, 5, 6, 10**: Regular cards with no special effects
- **7**: Next player must draw 2 cards or play another 7 to continue the chain (adding +2 for each 7)
- **8**: Play again - the player who plays this card gets another turn
- **9**: Skip the next player's turn. In 2-player games, acts like an 8 (play again)
- **Jack of Diamonds/Hearts**: Can negate the effect of a Jack of Spades/Clubs
- **Jack of Spades/Clubs**: Next player must draw 10 cards or play another Jack of Spades/Clubs to continue the chain (adding +10 for each Jack)
- **Queens and Kings**: If you have more than one, you can start a "GURA" round where players must play the same type of card or draw

### Special Rounds

#### 7s Chain
When a 7 is played, the next player has two options:
1. Draw the accumulated number of cards (starts at 2)
2. Play another 7, which increases the draw count by 2 for the next player

#### Black Jacks Chain
When a Jack of Spades or Clubs is played, the next player has two options:
1. Draw the accumulated number of cards (starts at 10)
2. Play another Jack of Spades/Clubs, which increases the draw count by 10 for the next player
3. Play a Jack of Hearts/Diamonds to negate the effect

#### GURA Round
When a player plays a King or Queen and has another of the same kind in their hand, they can start a GURA round. During this round:
1. Players must play a card of the same value (King or Queen)
2. If they don't have one, they must draw a card
3. The round continues until it gets back to the player who started it

## Technologies Used

- React + Vite for front-end
- PlayroomKit for real-time multiplayer functionality
- SVG cards for the visual elements

## Extending the Game

You can extend the game by:

1. Adding animations for card effects
2. Implementing sound effects
3. Creating a scoring system
4. Adding more card effects
5. Creating different game modes

## PlayroomKit Documentation

For more information about PlayroomKit and its features, visit the [official documentation](https://docs.joinplayroom.com).
