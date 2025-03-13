// A script to verify all card files exist and fix the hearts_main.svg typo

const fs = require('fs');
const path = require('path');

// Card types
const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];

// Path to the cards directory
const cardsDir = path.join(__dirname, '..', 'public', 'playing_cards');

// Check if directory exists
if (!fs.existsSync(cardsDir)) {
  console.error(`Directory does not exist: ${cardsDir}`);
  process.exit(1);
}

// Get all files in the directory
const files = fs.readdirSync(cardsDir);

// Check for typos
if (files.includes('hears_main.svg')) {
  console.log('Found typo: hears_main.svg');
  
  // Fix the typo by renaming the file
  try {
    fs.renameSync(
      path.join(cardsDir, 'hears_main.svg'),
      path.join(cardsDir, 'hearts_main.svg')
    );
    console.log('Fixed: renamed hears_main.svg to hearts_main.svg');
  } catch (error) {
    console.error('Error fixing typo:', error);
  }
}

// Check for missing card files
const missingCards = [];

// Check regular playing cards
suits.forEach(suit => {
  values.forEach(value => {
    const filename = `${suit}_${value}.svg`;
    if (!files.includes(filename)) {
      missingCards.push(filename);
    }
  });
});

// Check suit main files
suits.forEach(suit => {
  const filename = `${suit}_main.svg`;
  if (!files.includes(filename)) {
    missingCards.push(filename);
  }
});

// Report missing cards
if (missingCards.length > 0) {
  console.error('Missing card files:');
  missingCards.forEach(card => console.error(`- ${card}`));
} else {
  console.log('All card files are present!');
}

// Report all found card files for verification
console.log('\nFound card files:');
files.forEach(file => console.log(`- ${file}`));
