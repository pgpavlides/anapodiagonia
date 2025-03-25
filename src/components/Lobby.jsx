import { useState, useEffect, useRef } from 'react';
import { insertCoin } from 'playroomkit';
import { GAME_MODES } from '../game/types';
import GameSettings from './lobby/GameSettings';

// WebGL shader implementation
const LobbyShader = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    
    // Vertex shader
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0, 1);
      }
    `;
    
    // Fragment shader with infinite cards and dark blue background
    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      
      // Card size, corner radius, suit size, edge size
      float Size = .165, Radius = .04, SuitSize = .04, E = .125;
      
      // Card rectangle size
      vec2 Aspect = vec2(1.7,1.2);
      
      // Dark blue background color
      vec3 backgroundColor = vec3(0.02, 0.05, 0.15);
      
      // Suit colors
      vec3 diamondColor = vec3(1.0, 0.0, 0.0);  // Red
      vec3 heartColor = vec3(1.0, 0.0, 0.0);    // Red
      vec3 clubColor = vec3(0.0, 0.0, 0.0);     // Black
      vec3 spadeColor = vec3(0.0, 0.0, 0.0);    // Black
      
      // Diamond shape
      bool Diamonds(float n, vec2 p, vec2 q) {
        float A,B, x=p.x, y=p.y, X=abs(x-.07), Y=abs(y-.09);
        A = min(X + y, x + abs(y-.05));
        A = n < 8. ? min(X + y, q.y > 0. ? x + abs(q.y - 0.05) : 1.) : A;
        A = n < 1. ? 1. :
            n < 2. ? x + y :
            n < 3. ? x + Y :
            n < 4. ? x + min(y,Y) :
            n < 5. ? X + Y :
            n < 6. ? x + y :
            n < 7. ? X + y : A;
        B = n > 5. ? X + Y : A;
        return min(A,B) < SuitSize;
      }
      
      // Heart shape
      bool Hearts(vec2 p) {
        p.y -= 0.05;
        float r = length(p);
        if (r < 0.01) return true;
        
        float a = atan(p.y, p.x);
        float b = 0.02 + 0.04 * pow(abs(sin(a * 7.0)), 0.5);
        return r < b && p.y > -0.05;
      }
      
      // Club shape
      bool Clubs(vec2 p) {
        p.y -= 0.02;
        vec2 q = vec2(abs(p.x), p.y);
        
        // Three circles
        float d1 = length(q - vec2(0.0, 0.03)) - 0.03;
        float d2 = length(q - vec2(0.03, 0.0)) - 0.03;
        float d3 = length(q - vec2(-0.03, 0.0)) - 0.03;
        
        // Stem
        float d4 = max(abs(p.x) - 0.01, -(p.y + 0.05));
        
        return min(min(min(d1, d2), d3), d4) < 0.0;
      }
      
      // Spade shape
      bool Spades(vec2 p) {
        p.y -= 0.02;
        float r = length(p);
        if (r < 0.01) return true;
        
        float a = atan(p.y, p.x);
        float b = 0.02 + 0.04 * pow(abs(sin(a * 7.0)), 0.5);
        
        // Invert heart and add stem
        if (p.y < 0.0 && r < b) return true;
        if (abs(p.x) < 0.01 && p.y < -0.02 && p.y > -0.08) return true;
        
        return false;
      }
      
      vec3 Card(vec2 w, float n, vec2 p, vec3 col) {
        // Relative position scaled by card size
        vec2 q = (w-p) * Aspect, r = abs(q);
      
        if (max(r.x, r.y) < Size) {
          if (r.x < E || r.y < E) {
            // Determine which suit to draw based on the card value
            int suitType = int(mod(n, 4.0));
            
            if (suitType == 0 && Diamonds(n,r,q)) {
              col = diamondColor;
            }
            else if (suitType == 1 && Hearts(r)) {
              col = heartColor;
            }
            else if (suitType == 2 && Clubs(r)) {
              col = clubColor;
            }
            else if (suitType == 3 && Spades(r)) {
              col = spadeColor;
            }
            else {
              col = vec3(1); // White card background
            }
          }
          else if (length(r-E) < Radius) {
            col = vec3(1); // White card corners
          }
        }
        
        return col;
      }
      
      // Ray marching parameters
      #define MAX_STEPS 100
      #define MAX_DIST 100.0
      #define SURF_DIST 0.001
      
      // Ray marching function for infinite cards
      float GetDist(vec3 p) {
        // Create an infinite grid of cards
        vec3 q = mod(p + 0.5, 1.0) - 0.5;
        return length(q) - 0.1; // Sphere approximation for cards
      }
      
      float RayMarch(vec3 ro, vec3 rd) {
        float dO = 0.0;
        
        for(int i = 0; i < MAX_STEPS; i++) {
          vec3 p = ro + rd * dO;
          float dS = GetDist(p);
          dO += dS;
          if(dO > MAX_DIST || dS < SURF_DIST) break;
        }
        
        return dO;
      }
      
      void mainImage(out vec4 fragColor, in vec2 fragCoord) {
        // Normalized pixel coordinates
        vec2 w = (fragCoord - .5*iResolution.xy) / iResolution.x;
        
        // Background color
        vec3 col = backgroundColor;
        
        // Ray marching setup
        vec3 ro = vec3(0, 0, -3); // Ray origin
        vec3 rd = normalize(vec3(w, 1)); // Ray direction
        
        // Rotate ray origin for movement
        float t = iTime * 0.3;
        ro.x += sin(t) * 2.0;
        ro.y += cos(t) * 1.0;
        ro.z += sin(t * 0.5) * 2.0;
        
        // Create multiple hovering cards with different suits
        for(int i = 0; i < 12; i++) {
          float fi = float(i);
          
          // Create a grid of cards with different positions
          float gridX = mod(fi, 4.0) - 1.5;
          float gridY = floor(fi / 4.0) - 1.0;
          
          // Add movement to each card
          vec2 cardPos = vec2(
            gridX * 0.4 + sin(iTime * 0.3 + fi * 0.7) * 0.1,
            gridY * 0.3 + cos(iTime * 0.2 + fi * 0.5) * 0.1
          );
          
          // Add depth and rotation variation
          float depth = 1.0 + sin(iTime * 0.15 + fi * 0.3) * 0.2;
          cardPos *= depth;
          
          // Draw card with different values and suits
          col = Card(w, fi, cardPos, col);
        }
        
        // Add some subtle glow
        col += vec3(0.05, 0.1, 0.2) * (0.5 + 0.5 * sin(iTime * 0.2));
        
        // Output to screen
        fragColor = vec4(col, 1.0);
      }
      
      void main() {
        mainImage(gl_FragColor, gl_FragCoord.xy);
      }
    `;
    
    // Create and compile shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);
    
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);
    
    // Create shader program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);
    
    // Create a buffer for the position of the rectangle
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1
    ]), gl.STATIC_DRAW);
    
    // Get attribute and uniform locations
    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const resolutionLocation = gl.getUniformLocation(program, 'iResolution');
    const timeLocation = gl.getUniformLocation(program, 'iTime');
    
    // Enable the attribute
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    // Set uniforms
    gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    
    // Resize handler
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
    };
    
    window.addEventListener('resize', handleResize);
    handleResize();
    
    // Animation loop
    let startTime = Date.now();
    let animationFrame;
    
    const render = () => {
      const time = (Date.now() - startTime) / 1000;
      gl.uniform1f(timeLocation, time);
      
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      
      animationFrame = requestAnimationFrame(render);
    };
    
    render();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrame);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1
      }}
    />
  );
};

// Logo component
const AppLogo = () => {
  return (
    <div style={styles.logoContainer}>
      <img
        src="/logo/anapodiagonia_logo.svg"
        alt="Anapodiagonia Logo"
        style={styles.appLogo}
      />
    </div>
  );
};

const Lobby = ({ onJoin }) => {
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [isInvite, setIsInvite] = useState(false);
  const [gameMode, setGameMode] = useState(GAME_MODES.CLASSIC);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    // Check if the URL has a room code parameter or hash, indicating an invite
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('roomCode');
    const hashMatch = window.location.hash.match(/#r=([A-Z0-9]+)/);
    
    if (roomCode || hashMatch) {
      setIsInvite(true);
      
      // If it's a hash invite, automatically join the game
      if (hashMatch) {
        handleJoinGame();
      }
    }
  }, []);

  const handleCreateGame = async () => {
    setIsJoining(true);
    setError('');
    
    try {
      // Create a new room using insertCoin
      await insertCoin({
        maxPlayersPerRoom: 8, // Maximum 8 players per game
        // You'll get this from your PlayroomKit dashboard
        gameId: 'YOUR_GAME_ID', // Replace with your actual game ID
        initialState: {
          gameMode: gameMode
        }
      });
      
      // Store the game mode in localStorage so it can be accessed by the Game component
      localStorage.setItem('anapodiagonia_gameMode', gameMode);
      
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
      {/* WebGL shader background */}
      <LobbyShader />
      
      <div style={styles.contentWrapper}>
        <div style={styles.logoCard}>
          {/* App Logo */}
          <AppLogo />
          
          {/* Game mode selection modal */}
          {showSettings && (
            <div style={styles.modalOverlay}>
              <div style={styles.modalContent}>
                <div style={styles.modalHeader}>
                  <h2 style={styles.modalTitle}>Game Settings</h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    style={styles.closeButton}
                  >
                    ✕
                  </button>
                </div>
                <GameSettings gameMode={gameMode} setGameMode={setGameMode} />
                <button
                  onClick={() => setShowSettings(false)}
                  style={styles.saveButton}
                >
                  Save Settings
                </button>
              </div>
            </div>
          )}
        </div>
        
        {error && <p style={styles.error}>{error}</p>}
        
        <div style={styles.buttonContainer}>
          {/* Square buttons next to each other */}
          {!isInvite ? (
            <>
              <button
                onClick={() => setShowSettings(!showSettings)}
                style={styles.squareButton}
              >
                <div style={styles.buttonContent}>
                  <span style={styles.buttonIcon}>⚙️</span>
                  <span style={styles.buttonText}>SETTINGS</span>
                </div>
              </button>
              
              <button
                onClick={handleCreateGame}
                disabled={isJoining}
                style={styles.squareButton}
              >
                <div style={styles.buttonContent}>
                  <span style={styles.buttonIcon}>🎮</span>
                  <span style={styles.buttonText}>{isJoining ? 'CREATING...' : 'CREATE GAME'}</span>
                </div>
              </button>
              
              <button
                onClick={handleJoinGame}
                disabled={isJoining}
                style={styles.squareButton}
              >
                <div style={styles.buttonContent}>
                  <span style={styles.buttonIcon}>👥</span>
                  <span style={styles.buttonText}>{isJoining ? 'JOINING...' : 'JOIN GAME'}</span>
                </div>
              </button>
            </>
          ) : (
            <button
              onClick={handleJoinGame}
              disabled={isJoining}
              style={{...styles.squareButton, width: '100%'}}
            >
              <div style={styles.buttonContent}>
                <span style={styles.buttonIcon}>👥</span>
                <span style={styles.buttonText}>{isJoining ? 'JOINING...' : 'JOIN GAME'}</span>
              </div>
            </button>
          )}
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
    fontFamily: 'Arial, sans-serif',
    position: 'relative',
    overflow: 'hidden'
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: '800px',
    width: '100%',
    zIndex: 1
  },
  logoCard: {
    backgroundColor: 'transparent', // Transparent background
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    textAlign: 'center',
    position: 'relative',
    marginBottom: '30px'
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px'
  },
  appLogo: {
    width: '250px',
    height: 'auto',
    filter: 'drop-shadow(0 5px 15px rgba(0, 0, 0, 0.4))'
  },
  title: {
    color: '#4cfc50', // Bright green
    fontSize: '48px',
    margin: '0 0 5px 0',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)',
    fontWeight: 'bold',
    letterSpacing: '4px',
    fontFamily: '"Trebuchet MS", Arial, sans-serif'
  },
  subtitle: {
    color: '#81fc84', // Light green
    fontSize: '24px',
    fontWeight: 'normal',
    margin: '0 0 30px 0',
    letterSpacing: '2px',
    fontFamily: '"Trebuchet MS", Arial, sans-serif'
  },
  cardFanContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: '200px',
    position: 'relative',
    marginTop: '20px',
    marginBottom: '20px',
    perspective: '1000px'
  },
  fanCardWrapper: {
    position: 'relative',
    transformOrigin: 'bottom center',
    transition: 'transform 0.3s ease',
    filter: 'drop-shadow(0 5px 15px rgba(0, 0, 0, 0.4))'
  },
  fanCard: {
    height: '180px',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    border: '2px solid white'
  },
  error: {
    color: '#ff6b6b',
    margin: '15px 0',
    fontWeight: 'bold',
    padding: '10px 20px',
    borderRadius: '5px',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    backdropFilter: 'blur(5px)',
    textAlign: 'center',
    width: '100%'
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    width: '100%',
    maxWidth: '600px'
  },
  squareButton: {
    flex: 1,
    aspectRatio: '1/1',
    maxWidth: '200px',
    backgroundColor: 'rgba(30, 60, 100, 0.8)', // Blue instead of green
    border: '3px solid rgba(100, 150, 255, 0.7)', // Light blue border
    borderRadius: '15px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.3)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: 'white',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4)',
      backgroundColor: 'rgba(40, 80, 130, 0.9)' // Darker blue on hover
    },
    '&:active': {
      transform: 'translateY(2px)',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.4)'
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed'
    }
  },
  buttonContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%'
  },
  buttonIcon: {
    fontSize: '40px',
    marginBottom: '15px'
  },
  buttonText: {
    fontSize: '18px',
    fontWeight: 'bold',
    letterSpacing: '1px',
    textAlign: 'center',
    fontFamily: '"Trebuchet MS", Arial, sans-serif'
  },
  settingsButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    backgroundColor: 'rgba(30, 60, 100, 0.8)', // Blue instead of green
    color: 'white',
    border: '2px solid rgba(100, 150, 255, 0.7)', // Light blue border
    borderRadius: '8px',
    padding: '8px 15px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
    transition: 'all 0.2s ease'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(5px)'
  },
  modalContent: {
    backgroundColor: 'rgba(10, 20, 40, 0.9)',
    borderRadius: '15px',
    padding: '25px',
    width: '90%',
    maxWidth: '500px',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(100, 150, 255, 0.3)',
    position: 'relative',
    animation: 'fadeIn 0.3s ease'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  modalTitle: {
    color: 'white',
    margin: 0,
    fontSize: '24px',
    fontWeight: 'bold'
  },
  closeButton: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '5px 10px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.2s ease'
  },
  saveButton: {
    backgroundColor: 'rgba(30, 60, 100, 0.8)',
    color: 'white',
    border: '2px solid rgba(100, 150, 255, 0.7)',
    borderRadius: '10px',
    padding: '12px 25px',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '20px',
    width: '100%',
    transition: 'all 0.2s ease',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)'
  }
};

export default Lobby;
