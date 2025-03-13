import { useState } from 'react';
import Lobby from './components/Lobby';
import Game from './components/Game';
import './App.css';

function App() {
  const [isInGame, setIsInGame] = useState(false);
  
  return (
    <div className="app-container">
      {!isInGame ? (
        <Lobby onJoin={() => setIsInGame(true)} />
      ) : (
        <Game />
      )}
    </div>
  );
}

export default App;
