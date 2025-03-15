import { useState } from 'react';
import Lobby from './components/Lobby';
import Game from './components/Game';
import { GameProvider } from './game/logic/GameContext';
import './App.css';

function App() {
  const [isInGame, setIsInGame] = useState(false);
  
  return (
    <div className="app-container">
      {!isInGame ? (
        <Lobby onJoin={() => setIsInGame(true)} />
      ) : (
        <GameProvider>
          <Game />
        </GameProvider>
      )}
    </div>
  );
}

export default App;