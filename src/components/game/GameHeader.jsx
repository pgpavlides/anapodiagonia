import React from 'react';

const GameHeader = ({ roomCode, direction, players, currentPlayerIndex, myIndex, playerNames }) => {
  return (
    <>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: '#264653',
        borderTopLeftRadius: '10px',
        borderTopRightRadius: '10px',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ fontWeight: 'bold', marginRight: '15px' }}>Room: {roomCode}</span>
          <span>Direction: {direction === 'clockwise' ? '→' : '←'}</span>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          {players.map((p) => (
            <div 
              key={p.id} 
              style={{ 
                padding: '5px 10px', 
                backgroundColor: p.isCurrentPlayer ? '#f4a261' : '#e9c46a',
                borderRadius: '5px',
                color: '#264653',
                fontWeight: p.isCurrentPlayer ? 'bold' : 'normal',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                minWidth: '80px'
              }}
            >
              <span style={{ fontSize: '14px' }}>{p.name}</span>
              <span style={{ fontSize: '12px' }}>{p.cards} cards</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        padding: '5px 15px',
        backgroundColor: currentPlayerIndex === myIndex 
          ? '#f4a261' 
          : '#e9c46a',
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#264653',
        borderBottom: '1px solid #eaeaea'
      }}>
        {currentPlayerIndex === myIndex 
          ? "It's your turn!" 
          : `Waiting for ${playerNames[currentPlayerIndex] || 'other player'} to play...`}
      </div>
    </>
  );
};

export default GameHeader;