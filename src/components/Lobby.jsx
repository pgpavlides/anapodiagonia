import { useState, useEffect, useRef } from 'react';
import { insertCoin } from 'playroomkit';

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
    
    // Fragment shader (modified to be more green)
    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 iResolution;
      uniform float iTime;
      
      #define SPIN_ROTATION -2.0
      #define SPIN_SPEED 7.0
      #define OFFSET vec2(0.0)
      #define COLOUR_1 vec4(0.231, 0.871, 0.267, 1.0) // Green instead of red
      #define COLOUR_2 vec4(0.106, 0.706, 0.420, 1.0) // Green-blue instead of blue
      #define COLOUR_3 vec4(0.086, 0.145, 0.095, 1.0) // Dark green instead of dark blue
      #define CONTRAST 3.5
      #define LIGTHING 0.4
      #define SPIN_AMOUNT 0.25
      #define PIXEL_FILTER 745.0
      #define SPIN_EASE 1.0
      #define PI 3.14159265359
      #define IS_ROTATE false
      
      vec4 effect(vec2 screenSize, vec2 screen_coords) {
        float pixel_size = length(screenSize.xy) / PIXEL_FILTER;
        vec2 uv = (floor(screen_coords.xy*(1./pixel_size))*pixel_size - 0.5*screenSize.xy)/length(screenSize.xy) - OFFSET;
        float uv_len = length(uv);
        
        float speed = (SPIN_ROTATION*SPIN_EASE*0.2);
        if(IS_ROTATE){
           speed = iTime * speed;
        }
        speed += 302.2;
        float new_pixel_angle = atan(uv.y, uv.x) + speed - SPIN_EASE*20.*(1.*SPIN_AMOUNT*uv_len + (1. - 1.*SPIN_AMOUNT));
        vec2 mid = (screenSize.xy/length(screenSize.xy))/2.;
        uv = (vec2((uv_len * cos(new_pixel_angle) + mid.x), (uv_len * sin(new_pixel_angle) + mid.y)) - mid);
        
        uv *= 30.;
        speed = iTime*(SPIN_SPEED);
        vec2 uv2 = vec2(uv.x+uv.y);
        
        for(int i=0; i < 5; i++) {
          uv2 += sin(max(uv.x, uv.y)) + uv;
          uv  += 0.5*vec2(cos(5.1123314 + 0.353*uv2.y + speed*0.131121),sin(uv2.x - 0.113*speed));
          uv  -= 1.0*cos(uv.x + uv.y) - 1.0*sin(uv.x*0.711 - uv.y);
        }
        
        float contrast_mod = (0.25*CONTRAST + 0.5*SPIN_AMOUNT + 1.2);
        float paint_res = min(2., max(0.,length(uv)*(0.035)*contrast_mod));
        float c1p = max(0.,1. - contrast_mod*abs(1.-paint_res));
        float c2p = max(0.,1. - contrast_mod*abs(paint_res));
        float c3p = 1. - min(1., c1p + c2p);
        float light = (LIGTHING - 0.2)*max(c1p*5. - 4., 0.) + LIGTHING*max(c2p*5. - 4., 0.);
        return (0.3/CONTRAST)*COLOUR_1 + (1. - 0.3/CONTRAST)*(COLOUR_1*c1p + COLOUR_2*c2p + vec4(c3p*COLOUR_3.rgb, c3p*COLOUR_1.a)) + light;
      }
      
      void main() {
        vec2 uv = gl_FragCoord.xy/iResolution.xy;
        gl_FragColor = effect(iResolution.xy, uv * iResolution.xy);
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

const CardFan = () => {
  const cardTypes = [
    'hearts_king',
    'diamonds_queen',
    'clubs_jack',
    'spades_10',
    'hearts_1'
  ];
  
  return (
    <div style={styles.cardFanContainer}>
      {cardTypes.map((card, index) => (
        <div 
          key={card} 
          style={{
            ...styles.fanCardWrapper,
            transform: `rotate(${(index - 2) * 10}deg)`,
            zIndex: index + 1,
            marginLeft: index > 0 ? '-40px' : '0'
          }}
        >
          <img
            src={`/playing_cards/${card}.svg`}
            alt={card}
            style={styles.fanCard}
          />
        </div>
      ))}
    </div>
  );
};

const Lobby = ({ onJoin }) => {
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [isInvite, setIsInvite] = useState(false);

  useEffect(() => {
    // Check if the URL has a room code parameter, indicating an invite
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('roomCode');
    if (roomCode) {
      setIsInvite(true);
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
      {/* WebGL shader background */}
      <LobbyShader />
      
      <div style={styles.contentWrapper}>
        <div style={styles.logoCard}>
          <h1 style={styles.title}>ANAPODIAGONIA</h1>
          <h2 style={styles.subtitle}>THE CARD GAME OF CHAOS</h2>
          
          {/* Fan of 5 cards */}
          <CardFan />
        </div>
        
        {error && <p style={styles.error}>{error}</p>}
        
        <div style={styles.buttonContainer}>
          {/* Square buttons next to each other */}
          {!isInvite ? (
            <>
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
    backgroundColor: 'rgba(0, 30, 15, 0.7)',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 15px 30px rgba(0, 0, 0, 0.3)',
    width: '100%',
    textAlign: 'center',
    position: 'relative',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(75, 211, 75, 0.3)',
    marginBottom: '30px'
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
    backgroundColor: 'rgba(18, 75, 43, 0.8)',
    border: '3px solid #4cfc50',
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
      backgroundColor: 'rgba(28, 95, 63, 0.9)'
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
  }
};

export default Lobby;
