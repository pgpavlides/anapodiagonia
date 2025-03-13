import { useState } from 'react';
import { insertCoin } from 'playroomkit';

const Lobby = ({ onJoin }) => {
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCreateGame = async () => {
    setIsJoining(true);
    setError('');
    
    try {
      // Create a new room using insertCoin
      await insertCoin({
        maxPlayersPerRoom: 8, // Maximum 8 players per game
        // You'll get this from your PlayroomKit dashboard
        gameId: 'YOUR_GAME_ID', // Replace with your actual game ID
      });
      
      onJoin();
    } catch (err) {
      console.error('Failed to create game:', err);
      setError('Failed to create game. Please try again.');
      setIsJoining(false);
    }
  };

  const handleJoinGame = async () => {
    setIsJoining(true);
    setError('');
    
    try {
      // Open the PlayroomKit join screen directly
      await insertCoin({
        maxPlayersPerRoom: 8, // Maximum 8 players per game
        // You'll get this from your PlayroomKit dashboard
        gameId: 'YOUR_GAME_ID', // Replace with your actual game ID
      });
      
      onJoin();
    } catch (err) {
      console.error('Failed to join game:', err);
      setError('Failed to join game. Please check the Room Code and try again.');
      setIsJoining(false);
    }
  };

  return (
    <div className="lobby-container" style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Anapodiagonia</h1>
        <h2 style={styles.subtitle}>The Card Game of Chaos</h2>
        
        <div style={styles.cardsPreview}>
          {['hearts_king', 'spades_jack', 'diamonds_1'].map(card => (
            <img
              key={card}
              src={`/playing_cards/${card}.svg`}
              alt={card}
              style={styles.previewCard}
            />
          ))}
        </div>
        
        {error && <p style={styles.error}>{error}</p>}
        
        <div style={styles.buttonContainer}>
          <button
            onClick={handleCreateGame}
            disabled={isJoining}
            style={{...styles.button, ...styles.createButton}}
          >
            {isJoining ? 'Creating...' : 'Create New Game'}
          </button>
          
          <div style={styles.divider}>
            <span style={styles.dividerText}>OR</span>
          </div>
          
          <button
            onClick={handleJoinGame}
            disabled={isJoining}
            style={{...styles.button, ...styles.joinButton}}
          >
            {isJoining ? 'Joining...' : 'Join Game'}
          </button>
        </div>
        
        <div style={styles.instructions}>
          <h3 style={styles.instructionsTitle}>How to Play:</h3>
          <p>• Create a game or join an existing one with a Room Code</p>
          <p>• Each turn, play a card that matches either the suit or the value of the top card</p>
          <p>• Special cards have powerful effects! Be strategic!</p>
          <p>• The first player to get rid of all their cards wins!</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: '20px',
    backgroundImage: 'linear-gradient(135deg, #264653, #2a9d8f)',
    fontFamily: 'Arial, sans-serif'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '15px',
    padding: '30px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '600px',
    textAlign: 'center'
  },
  title: {
    color: '#264653',
    fontSize: '40px',
    margin: '0 0 5px 0'
  },
  subtitle: {
    color: '#2a9d8f',
    fontSize: '22px',
    fontWeight: 'normal',
    margin: '0 0 30px 0'
  },
  cardsPreview: {
    display: 'flex',
    justifyContent: 'center',
    margin: '20px 0 30px',
    gap: '10px'
  },
  previewCard: {
    height: '120px',
    transform: 'rotate(0deg)',
    transition: 'transform 0.3s',
    ':hover': {
      transform: 'rotate(10deg)'
    }
  },
  error: {
    color: '#e76f51',
    margin: '15px 0',
    fontWeight: 'bold'
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    margin: '20px 0'
  },
  button: {
    padding: '15px 20px',
    fontSize: '18px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s, transform 0.1s',
    ':hover': {
      transform: 'translateY(-2px)'
    },
    ':active': {
      transform: 'translateY(1px)'
    }
  },
  createButton: {
    backgroundColor: '#f4a261',
    color: '#264653'
  },
  joinButton: {
    backgroundColor: '#e9c46a',
    color: '#264653'
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '10px 0',
    color: '#666'
  },
  dividerText: {
    padding: '0 10px',
    backgroundColor: 'white',
    position: 'relative',
    fontSize: '14px'
  },
  instructions: {
    backgroundColor: '#f8f9fa',
    padding: '20px',
    borderRadius: '8px',
    marginTop: '30px',
    textAlign: 'left'
  },
  instructionsTitle: {
    color: '#264653',
    margin: '0 0 15px 0',
    fontSize: '18px'
  }
};

export default Lobby;
