import React, { useEffect, useState } from 'react';

const WinConfetti = () => {
  const [confetti, setConfetti] = useState([]);
  
  useEffect(() => {
    // Create 100 confetti pieces
    const confettiCount = 100;
    const colors = ['#f4a261', '#e76f51', '#2a9d8f', '#e9c46a', '#264653'];
    const pieces = [];
    
    for (let i = 0; i < confettiCount; i++) {
      pieces.push({
        id: i,
        x: Math.random() * 100, // Random starting x position (0-100%)
        y: -10 - Math.random() * 10, // Start just above the viewport
        size: 5 + Math.random() * 10, // Random size (5-15px)
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360, // Random rotation
        speed: 1 + Math.random() * 2, // Random fall speed
        oscillationSpeed: 0.8 + Math.random() * 1, // Random side-to-side movement
        oscillationDistance: 15 + Math.random() * 15 // Random distance of side-to-side movement
      });
    }
    
    setConfetti(pieces);
    
    // Cleanup function
    return () => {
      setConfetti([]);
    };
  }, []);
  
  // Animation loop
  useEffect(() => {
    if (confetti.length === 0) return;
    
    const animationFrame = requestAnimationFrame(() => {
      // Update confetti positions for the next frame
      setConfetti(prevConfetti => 
        prevConfetti.map(piece => {
          // Update y position based on speed
          let y = piece.y + piece.speed;
          
          // Update x position based on oscillation
          let x = piece.x + Math.sin(y * piece.oscillationSpeed / 15) * piece.oscillationDistance / 100;
          
          // If confetti goes off screen, recycle it to the top
          if (y > 120) {
            y = -10;
            x = Math.random() * 100;
          }
          
          return {
            ...piece,
            x,
            y,
            rotation: piece.rotation + piece.oscillationSpeed // Rotate as it falls
          };
        })
      );
    });
    
    // Clean up animation frame
    return () => cancelAnimationFrame(animationFrame);
  }, [confetti]);
  
  return (
    <div style={{ 
      position: 'fixed',
      pointerEvents: 'none', // Allow clicking through the confetti
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1001 // Above the win notification
    }}>
      {confetti.map(piece => (
        <div
          key={piece.id}
          style={{
            position: 'absolute',
            left: `${piece.x}%`,
            top: `${piece.y}%`,
            width: `${piece.size}px`,
            height: `${piece.size / 2}px`,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            opacity: 0.8,
            borderRadius: '2px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}
        />
      ))}
    </div>
  );
};

export default WinConfetti;