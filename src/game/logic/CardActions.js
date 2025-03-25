import { canPlayCard, getCardEffect, getNextPlayerIndex, shuffleDeck } from '../utils';
import { GAME_PHASES, EFFECTS } from '../types';

// Play a card
export const playCard = (card, index, gameState, player, players, setGameState, setHasDrawnThisTurn) => {
  if (!gameState) return;
  
  const newGameState = { ...gameState };
  const playerIndex = players.findIndex(p => p.id === player.id);
  
  const newHands = [...newGameState.hands];
  const playerHand = [...newHands[playerIndex]];
  playerHand.splice(index, 1);
  newHands[playerIndex] = playerHand;
  
  const newDiscardPile = [...newGameState.discardPile, card];
  
  const newLogs = [...newGameState.logs, {
    message: `${player.getProfile().name} played ${card.suit} ${card.value}`,
    timestamp: Date.now()
  }];
  
  const effect = getCardEffect(card, newGameState.gameMode);
  let newCurrentPlayerIndex = playerIndex;
  let newDirection = newGameState.direction;
  let newGamePhase = newGameState.gamePhase;
  let newWildSuit = newGameState.wildSuit;
  let newDrawCount = newGameState.drawCount;
  let newChainType = newGameState.chainType;
  let newLastPlayerIndex = newGameState.lastPlayerIndex;
  let startedGura = false;
  
  if (newGameState.potentialWinner && card.value === '7') {
    newGameState.potentialWinner = null;
    
    newLogs.push({
      message: `${player.getProfile().name} countered the final 7 with their own 7!`,
      timestamp: Date.now()
    });
  }
  
  if (gameState.gamePhase === GAME_PHASES.GURA && effect.type === 'gura') {
    const hasMoreGuraCards = playerHand.some(c => c.value === card.value);
    const isGuraStarter = gameState.guraStarterIndex === playerIndex;
    
    // Only the GURA starter can end the round, and only when they have no more GURA cards
    if (!hasMoreGuraCards && isGuraStarter) {
      newGamePhase = GAME_PHASES.PLAYING;
      newChainType = null;
      newGameState.guraCardValue = null;
      
      newLogs.push({
        message: `${player.getProfile().name} played their last GURA card, ending the round!`,
        timestamp: Date.now()
      });
      
      newGameState.guraStarterIndex = null;
    }
    // If it's not the starter but they ran out of GURA cards, just note it but don't end GURA
    else if (!hasMoreGuraCards && !isGuraStarter) {
      newLogs.push({
        message: `${player.getProfile().name} played their last GURA card, but the round continues!`,
        timestamp: Date.now()
      });
    }
  }
  
  switch (effect.type) {
    case 'wild':
      newGamePhase = GAME_PHASES.SUIT_SELECTION;
      newLastPlayerIndex = playerIndex;
      break;
      
    case 'draw_two': {
      const prevPlayer = getNextPlayerIndex(
        playerIndex,
        players.length,
        newDirection === 'clockwise' ? 'counter_clockwise' : 'clockwise'
      );
      
      for (let i = 0; i < 2; i++) {
        if (newGameState.deck.length > 0) {
          const drawnCard = newGameState.deck.pop();
          newHands[prevPlayer].push(drawnCard);
        }
      }
      
      newLogs.push({
        message: `${players[prevPlayer].getProfile().name} draws 2 cards`,
        timestamp: Date.now()
      });
      
      if (players.length === 2) {
        newCurrentPlayerIndex = prevPlayer;
        
        newLogs.push({
          message: `${players[prevPlayer].getProfile().name} continues their turn`,
          timestamp: Date.now()
        });
      } else {
        newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
      }
      
      break;
    }
      
    // Chaos mode effects
    case 'swap_hands':
      // Enter player selection phase
      newGamePhase = GAME_PHASES.PLAYER_SELECTION;
      newGameState.pendingEffect = 'swap_hands';
      newLastPlayerIndex = playerIndex;
      
      newLogs.push({
        message: `${player.getProfile().name} played a 4 - Select an opponent to swap hands with`,
        timestamp: Date.now()
      });
      
      newCurrentPlayerIndex = playerIndex; // Keep turn with current player for selection
      break;
      
    case 'steal_card':
      // Enter player selection phase
      newGamePhase = GAME_PHASES.PLAYER_SELECTION;
      newGameState.pendingEffect = 'steal_card';
      newLastPlayerIndex = playerIndex;
      
      newLogs.push({
        message: `${player.getProfile().name} played a 5 - Select an opponent to take a card from`,
        timestamp: Date.now()
      });
      
      newCurrentPlayerIndex = playerIndex; // Keep turn with current player for selection
      break;
      
    case 'swap_random':
      // Enter player selection phase
      newGamePhase = GAME_PHASES.PLAYER_SELECTION;
      newGameState.pendingEffect = 'swap_random';
      newLastPlayerIndex = playerIndex;
      
      newLogs.push({
        message: `${player.getProfile().name} played a 6 - Select an opponent to swap a random card with`,
        timestamp: Date.now()
      });
      
      newCurrentPlayerIndex = playerIndex; // Keep turn with current player for selection
      break;
      
    case 'see_hand':
      // Enter player selection phase
      newGamePhase = GAME_PHASES.PLAYER_SELECTION;
      newGameState.pendingEffect = 'see_hand';
      newLastPlayerIndex = playerIndex;
      
      newLogs.push({
        message: `${player.getProfile().name} played a 10 - Select an opponent to see their hand`,
        timestamp: Date.now()
      });
      
      newCurrentPlayerIndex = playerIndex; // Keep turn with current player for selection
      break;
      
    case 'reverse':
      newDirection = newDirection === 'clockwise' ? 'counter_clockwise' : 'clockwise';
      
      if (players.length === 2) {
        newCurrentPlayerIndex = playerIndex;
      } else {
        newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
      }
      
      newLogs.push({
        message: `${player.getProfile().name} reversed the direction of play`,
        timestamp: Date.now()
      });
      break;
      
    case 'draw_chain':
      if (newChainType === 'draw_chain') {
        newDrawCount += 2;
        newLogs.push({
          message: `${player.getProfile().name} added to the chain! Next player draws ${newDrawCount} cards or plays a 7`,
          timestamp: Date.now()
        });
      } else {
        newChainType = 'draw_chain';
        newDrawCount = 2;
        newLogs.push({
          message: `${player.getProfile().name} started a chain! Next player draws 2 cards or plays a 7`,
          timestamp: Date.now()
        });
      }
      
      newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
      break;
      
    case 'play_again':
      newCurrentPlayerIndex = playerIndex;
      
      newLogs.push({
        message: `${player.getProfile().name} plays again!`,
        timestamp: Date.now()
      });
      break;
      
    case 'skip':
      if (players.length === 2) {
        newCurrentPlayerIndex = playerIndex;
      } else {
        newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection, true);
      }
      
      newLogs.push({
        message: `${players[getNextPlayerIndex(playerIndex, players.length, newDirection)].getProfile().name}'s turn is skipped`,
        timestamp: Date.now()
      });
      break;
      
    case 'draw_ten':
      if (newChainType === 'draw_ten') {
        newDrawCount += 10;
        newLogs.push({
          message: `${player.getProfile().name} added to the chain! Next player draws ${newDrawCount} cards or plays a black Jack`,
          timestamp: Date.now()
        });
      } else {
        newChainType = 'draw_ten';
        newDrawCount = 10;
        newLogs.push({
          message: `${player.getProfile().name} started a chain! Next player draws 10 cards or plays a black Jack`,
          timestamp: Date.now()
        });
      }
      
      newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
      break;
      
    case 'negate':
      if (newChainType === 'draw_ten' || newChainType === 'draw_ten_response') {
        newLogs.push({
          message: `${player.getProfile().name} negated the black Jack with a red Jack!`,
          timestamp: Date.now()
        });
        
        newChainType = null;
        newDrawCount = 0;
      }
      
      newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
      break;
      
    case 'gura':
      if (gameState.gamePhase === GAME_PHASES.GURA) {
        newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
        break;
      }
      
      {
        const hasSameValueCards = playerHand.some(c => c.value === card.value);
        
        // Count how many of the same card value they have in hand
        const sameValueCardCount = playerHand.filter(c => c.value === card.value).length;
        
        if (hasSameValueCards) {
          newGameState.guraCardValue = card.value;
          
          newGameState.pendingGuraDecision = true;
          startedGura = true;
          
          newGameState.guraStarterIndex = playerIndex;
          
          // Check if player has more than 2 of the same King/Queen
          if (sameValueCardCount > 2) {
            newGameState.hasManyGuraCards = true;
            newLogs.push({
              message: `${player.getProfile().name} played a ${card.value} and has ${sameValueCardCount} more. They can choose to start GURA or continue!`,
              timestamp: Date.now()
            });
          } else {
            newLogs.push({
              message: `${player.getProfile().name} played a ${card.value}. They can start a GURA round!`,
              timestamp: Date.now()
            });
          }
          
          newCurrentPlayerIndex = playerIndex;
        } else {
          newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
        }
      }
      break;
      
    default:
      newCurrentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
      break;
  }
  
  if (playerHand.length === 0) {
    if (players.length === 2 && (card.value === '3' || card.value === '8' || card.value === '9')) {
      newLogs.push({
        message: `${player.getProfile().name} played their last card, but must draw another since it was a ${card.value}!`,
        timestamp: Date.now()
      });
      
      if (newGameState.deck.length > 0) {
        const drawnCard = newGameState.deck.pop();
        playerHand.push(drawnCard);
        newHands[playerIndex] = playerHand;
        
        newLogs.push({
          message: `${player.getProfile().name} draws a card and continues their turn`,
          timestamp: Date.now()
        });
      }
      
      newCurrentPlayerIndex = playerIndex;
      setHasDrawnThisTurn(true);
    }
    else if (card.value === '7' && (newChainType === 'draw_chain' || effect.type === 'draw_chain')) {
      newLogs.push({
        message: `${player.getProfile().name} played their last card, but the next player must respond to the 7!`,
        timestamp: Date.now()
      });
      
      newGameState.potentialWinner = player.id;
    } else {
      newGamePhase = GAME_PHASES.GAME_OVER;
      newLogs.push({
        message: `${player.getProfile().name} has won the game!`,
        timestamp: Date.now()
      });
    }
  }

  if (newGameState.potentialWinner) {
    const nextPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newDirection);
    const nextPlayerHand = newHands[nextPlayerIndex];
    const nextPlayerHas7 = nextPlayerHand.some(c => c.value === '7');
    
    if (!nextPlayerHas7) {
      newGamePhase = GAME_PHASES.GAME_OVER;
      newGameState.winner = newGameState.potentialWinner;
      
      const winnerPlayer = players.find(p => p.id === newGameState.potentialWinner);
      newLogs.push({
        message: `${winnerPlayer ? winnerPlayer.getProfile().name : 'Player'} wins the game!`,
        timestamp: Date.now()
      });
    }
  }
  
  if (newCurrentPlayerIndex === playerIndex && effect.type !== 'normal') {
    setHasDrawnThisTurn(false);
  }
  
  if (newCurrentPlayerIndex !== playerIndex) {
    setHasDrawnThisTurn(false);
  }
  
  setGameState({
    ...newGameState,
    hands: newHands,
    discardPile: newDiscardPile,
    currentPlayerIndex: newCurrentPlayerIndex,
    direction: newDirection,
    gamePhase: startedGura ? (newGameState.pendingGuraDecision ? newGamePhase : GAME_PHASES.GURA) : newGamePhase,
    wildSuit: newWildSuit,
    drawCount: newDrawCount,
    chainType: startedGura ? (newGameState.pendingGuraDecision ? newChainType : 'gura') : newChainType,
    lastPlayerIndex: newLastPlayerIndex,
    logs: newLogs,
    winner: newGamePhase === GAME_PHASES.GAME_OVER ? player.id : null,
    pendingEffect: newGameState.pendingEffect || null
  }, true);
};

// Check if a card can be played
export const canPlayCardNow = (card, gameState) => {
  const topCard = gameState.discardPile[gameState.discardPile.length - 1];
  
  if (gameState.gamePhase === GAME_PHASES.SUIT_SELECTION ||
      gameState.gamePhase === GAME_PHASES.PLAYER_SELECTION) {
    return false;
  } else if (gameState.gamePhase === GAME_PHASES.GURA) {
    return card.value === gameState.guraCardValue;
  } else if (gameState.drawCount > 0) {
    if (gameState.chainType === 'draw_chain' && card.value === '7') {
      return true;
    } else if (gameState.chainType === 'draw_ten' && card.value === 'jack' &&
              (card.suit === 'clubs' || card.suit === 'spades')) {
      return true;
    } else if (gameState.chainType === 'draw_ten' && card.value === 'jack' &&
              (card.suit === 'hearts' || card.suit === 'diamonds')) {
      return true;
    } else if (gameState.chainType === 'draw_ten_response' && card.value === 'jack' &&
              (card.suit === 'hearts' || card.suit === 'diamonds')) {
      return true;
    } else {
      return false;
    }
  } else {
    return canPlayCard(topCard, card, gameState.wildSuit);
  }
};

// Draw a card from the deck
export const drawCard = (gameState, player, players, setGameState, setHasDrawnThisTurn, setDrewFromEffect) => {
  if (!gameState) return;
  
  const playerIndex = players.findIndex(p => p.id === player.id);
  
  if (gameState.currentPlayerIndex !== playerIndex) {
    return;
  }
  
  // Skip the check for has drawn this turn - we just let players draw whenever they want
  // if (gameState.drawCount === 0 && setHasDrawnThisTurn && typeof setHasDrawnThisTurn === 'function') {
  //   // Check if we've already drawn a card this turn by looking at the component state
  //   const alreadyDrewThisTurn = gameState.playerStatus?.hasDrawnThisTurn;
  //   if (alreadyDrewThisTurn) {
  //     return;
  //   }
  // }
  
  if (gameState.pendingGuraDecision) {
    confirmGura(false, gameState, player, players, setGameState);
    return;
  }
  
  const newGameState = { ...gameState };
  const newHands = [...newGameState.hands];
  const playerHand = [...newHands[playerIndex]];
  
  // Check if deck needs to be reshuffled
  const reshuffleDeck = () => {
    // Keep the top card separate
    const topCard = newGameState.discardPile.pop();
    
    // Shuffle the rest of the discard pile to make a new deck
    const newDeck = shuffleDeck([...newGameState.discardPile]);
    newGameState.deck = newDeck;
    
    // Reset discard pile with just the top card
    newGameState.discardPile = topCard ? [topCard] : [];
    
    newGameState.logs.push({
      message: 'Discard pile has been reshuffled into the deck',
      timestamp: Date.now()
    });
  };
  
  if (gameState.drawCount > 0) {
    // Drawing for an effect (mandatory)
    for (let i = 0; i < gameState.drawCount; i++) {
      // If deck is empty, reshuffle discard pile
      if (newGameState.deck.length === 0 && newGameState.discardPile.length > 1) {
        reshuffleDeck();
      }
      
      if (newGameState.deck.length > 0) {
        const drawnCard = newGameState.deck.pop();
        playerHand.push(drawnCard);
      }
    }
    
    newGameState.chainType = null;
    newGameState.drawCount = 0;
    
    newGameState.logs.push({
      message: `${player.getProfile().name} drew ${gameState.drawCount} cards`,
      timestamp: Date.now()
    });
    
    newGameState.logs.push({
      message: `${player.getProfile().name} continues their turn`,
      timestamp: Date.now()
    });
    
  } else {
    // Normal draw for turn (once per turn)
    // If deck is empty, reshuffle discard pile
    if (newGameState.deck.length === 0 && newGameState.discardPile.length > 1) {
      reshuffleDeck();
    }
    
    if (newGameState.deck.length > 0) {
      const drawnCard = newGameState.deck.pop();
      playerHand.push(drawnCard);
      
      newGameState.logs.push({
        message: `${player.getProfile().name} drew a card`,
        timestamp: Date.now()
      });

      setHasDrawnThisTurn(true);
    } else {
      newGameState.logs.push({
        message: `${player.getProfile().name} attempted to draw, but there are no cards left`,
        timestamp: Date.now()
      });
    }
  }
  
  newHands[playerIndex] = playerHand;
  
  setDrewFromEffect(true);
  
  if (gameState.gamePhase === GAME_PHASES.GURA) {
    const hasGuraCard = playerHand.some(card => card.value === newGameState.guraCardValue);
    
    if (hasGuraCard) {
      newGameState.logs.push({
        message: `${player.getProfile().name} drew a card and should play their ${newGameState.guraCardValue}`,
        timestamp: Date.now()
      });
      
      newGameState.currentPlayerIndex = playerIndex;
    } else {
      // We don't need to calculate the next player index since we're not changing players
      newGameState.logs.push({
        message: `${player.getProfile().name} drew a card and doesn't have a ${newGameState.guraCardValue}`,
        timestamp: Date.now()
      });
      
      // Don't automatically change the current player - allow them to pass manually
      newGameState.currentPlayerIndex = playerIndex;
    }
  }
  
  setGameState({
    ...newGameState,
    hands: newHands
  }, true);
};

// Select a suit after playing a wild card
export const selectSuit = (suit, gameState, player, players, setGameState) => {
  if (!gameState || gameState.gamePhase !== GAME_PHASES.SUIT_SELECTION) {
    return;
  }
  
  const playerIndex = players.findIndex(p => p.id === player.id);
  
  if (playerIndex !== gameState.lastPlayerIndex) {
    return;
  }
  
  const newGameState = { ...gameState };
  
  newGameState.wildSuit = suit;
  
  newGameState.gamePhase = GAME_PHASES.PLAYING;
  
  newGameState.logs.push({
    message: `${player.getProfile().name} selected ${suit} as the active suit`,
    timestamp: Date.now()
  });
  
  newGameState.currentPlayerIndex = getNextPlayerIndex(
    playerIndex,
    players.length,
    newGameState.direction
  );
  
  setGameState(newGameState, true);
};

// Select a player for Chaos mode effects
export const selectPlayer = (targetPlayerIndex, gameState, player, players, setGameState) => {
  if (!gameState || gameState.gamePhase !== GAME_PHASES.PLAYER_SELECTION) {
    return;
  }
  
  const playerIndex = players.findIndex(p => p.id === player.id);
  
  if (playerIndex !== gameState.lastPlayerIndex) {
    return;
  }
  
  // Don't allow selecting yourself
  if (targetPlayerIndex === playerIndex) {
    return;
  }
  
  const newGameState = { ...gameState };
  const newHands = [...newGameState.hands];
  const playerHand = [...newHands[playerIndex]];
  const targetPlayerHand = [...newHands[targetPlayerIndex]];
  
  const targetPlayerName = players[targetPlayerIndex].getProfile().name;
  
  // Apply the pending effect
  switch (newGameState.pendingEffect) {
    case 'swap_hands':
      // Swap hands with the selected player
      newHands[playerIndex] = targetPlayerHand;
      newHands[targetPlayerIndex] = playerHand;
      
      newGameState.logs.push({
        message: `${player.getProfile().name} swapped hands with ${targetPlayerName}!`,
        timestamp: Date.now()
      });
      break;
      
    case 'steal_card':
      // Take a random card from the selected player
      if (targetPlayerHand.length > 0) {
        const randomIndex = Math.floor(Math.random() * targetPlayerHand.length);
        const stolenCard = targetPlayerHand.splice(randomIndex, 1)[0];
        playerHand.push(stolenCard);
        
        newHands[playerIndex] = playerHand;
        newHands[targetPlayerIndex] = targetPlayerHand;
        
        newGameState.logs.push({
          message: `${player.getProfile().name} took a card from ${targetPlayerName}!`,
          timestamp: Date.now()
        });
      } else {
        newGameState.logs.push({
          message: `${targetPlayerName} has no cards to take!`,
          timestamp: Date.now()
        });
      }
      break;
      
    case 'swap_random':
      // Swap a random card with the selected player
      if (playerHand.length > 0 && targetPlayerHand.length > 0) {
        const randomPlayerIndex = Math.floor(Math.random() * playerHand.length);
        const randomTargetIndex = Math.floor(Math.random() * targetPlayerHand.length);
        
        const playerCard = playerHand[randomPlayerIndex];
        const targetCard = targetPlayerHand[randomTargetIndex];
        
        playerHand[randomPlayerIndex] = targetCard;
        targetPlayerHand[randomTargetIndex] = playerCard;
        
        newHands[playerIndex] = playerHand;
        newHands[targetPlayerIndex] = targetPlayerHand;
        
        newGameState.logs.push({
          message: `${player.getProfile().name} swapped a random card with ${targetPlayerName}!`,
          timestamp: Date.now()
        });
      } else {
        newGameState.logs.push({
          message: `Cannot swap cards - one player has no cards!`,
          timestamp: Date.now()
        });
      }
      break;
      
    case 'see_hand':
      // Show the selected player's hand to everyone
      newGameState.revealedHand = {
        playerIndex: targetPlayerIndex,
        playerName: targetPlayerName,
        hand: targetPlayerHand,
        revealedBy: player.getProfile().name,
        showToAll: true,
        timestamp: Date.now() + 10000 // Show for 10 seconds
      };
      
      newGameState.logs.push({
        message: `${player.getProfile().name} revealed ${targetPlayerName}'s hand to everyone!`,
        timestamp: Date.now()
      });
      break;
      
    default:
      break;
  }
  
  // Reset and continue the game
  newGameState.pendingEffect = null;
  newGameState.gamePhase = GAME_PHASES.PLAYING;
  newGameState.currentPlayerIndex = getNextPlayerIndex(playerIndex, players.length, newGameState.direction);
  
  setGameState({
    ...newGameState,
    hands: newHands
  }, true);
};

// Pass the turn
export const passTurn = (gameState, player, players, setGameState, setHasDrawnThisTurn) => {
  if (!gameState) return;
  
  const playerIndex = players.findIndex(p => p.id === player.id);
  
  if (gameState.currentPlayerIndex !== playerIndex) {
    return;
  }
  
  // Require drawing before passing turn
  if (!gameState.playerHasDrawn && !gameState.playerMustRespond) {
    // Create a message that the player must draw first
    const newGameState = { ...gameState };
    newGameState.logs.push({
      message: `${player.getProfile().name} must draw a card before passing`,
      timestamp: Date.now()
    });
    
    setGameState(newGameState, true);
    return;
  }
  
  if (gameState.gamePhase === GAME_PHASES.GURA) {
    const playerHand = gameState.hands[playerIndex];
    const hasGuraCard = playerHand.some(card => card.value === gameState.guraCardValue);
    
    // Check if player has GURA cards and should play one
    if (hasGuraCard) {
      // If the player has GURA cards, they should play one
      const newGameState = { ...gameState };
      newGameState.logs.push({
        message: `${player.getProfile().name} should play their ${gameState.guraCardValue} card`,
        timestamp: Date.now()
      });
      
      setGameState(newGameState, true);
      return;
    }
    // If player has drawn this turn, they can pass even if they have GURA cards
  }
  
  if (gameState.pendingGuraDecision) {
    confirmGura(false, gameState, player, players, setGameState);
    return;
  }
  
  const newGameState = { ...gameState };
  
  newGameState.logs.push({
    message: `${player.getProfile().name} passed their turn`,
    timestamp: Date.now()
  });
  
  newGameState.currentPlayerIndex = getNextPlayerIndex(
    playerIndex, 
    players.length, 
    newGameState.direction
  );
  
  setHasDrawnThisTurn(false);
  
  setGameState(newGameState, true);
};

// Confirm or decline starting a GURA round
export const confirmGura = (startGura, gameState, player, players, setGameState) => {
  if (!gameState || !gameState.pendingGuraDecision) {
    return;
  }
  
  const playerIndex = players.findIndex(p => p.id === player.id);
  const newGameState = { ...gameState };
  
  newGameState.pendingGuraDecision = false;
  
  if (startGura) {
    newGameState.gamePhase = GAME_PHASES.GURA;
    newGameState.chainType = 'gura';
    
    newGameState.logs.push({
      message: `${player.getProfile().name} started a GURA round with a ${newGameState.guraCardValue}!`,
      timestamp: Date.now()
    });
    
    newGameState.currentPlayerIndex = getNextPlayerIndex(
      playerIndex,
      players.length, 
      newGameState.direction
    );
  } else {
    newGameState.gamePhase = GAME_PHASES.PLAYING;
    newGameState.guraStarterIndex = null;
    newGameState.guraCardValue = null;
    
    newGameState.logs.push({
      message: `${player.getProfile().name} decided not to start a GURA round`,
      timestamp: Date.now()
    });
    
    newGameState.currentPlayerIndex = getNextPlayerIndex(
      playerIndex,
      players.length, 
      newGameState.direction
    );
  }
  
  setGameState(newGameState, true);
};

// End a GURA round
export const endGura = (gameState, player, players, setGameState) => {
  if (!gameState || gameState.gamePhase !== GAME_PHASES.GURA) {
    return;
  }
  
  const playerIndex = players.findIndex(p => p.id === player.id);
  
  // Only the GURA starter can manually end the round
  if (gameState.guraStarterIndex !== playerIndex) {
    return;
  }
  
  const newGameState = { ...gameState };
  
  const playerHand = newGameState.hands[playerIndex];
  const guraCards = playerHand.filter(card => card.value === newGameState.guraCardValue);
  
  // If the starter still has GURA cards, they must play them all first
  if (guraCards.length > 0) {
    newGameState.logs.push({
      message: `${player.getProfile().name} must play all their ${newGameState.guraCardValue} cards before ending the round`,
      timestamp: Date.now()
    });
    
    setGameState(newGameState, true);
    return;
  }
  
  // All conditions satisfied - end the GURA round
  newGameState.gamePhase = GAME_PHASES.PLAYING;
  newGameState.chainType = null;
  newGameState.guraCardValue = null;
  
  newGameState.logs.push({
    message: `${player.getProfile().name} ended the GURA round`,
    timestamp: Date.now()
  });
  
  newGameState.currentPlayerIndex = getNextPlayerIndex(
    playerIndex,
    players.length, 
    newGameState.direction
  );
  
  newGameState.guraStarterIndex = null;
  
  setGameState(newGameState, true);
};