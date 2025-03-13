import React, { useRef, useEffect } from 'react';

const GameLogs = ({ logs }) => {
  const logsEndRef = useRef(null);
  
  // Auto-scroll to the bottom when new logs are added
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);
  
  return (
    <div 
      style={{
        backgroundColor: '#f1faee',
        padding: '10px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        maxHeight: '200px',
        overflowY: 'auto',
        marginTop: '20px'
      }}
    >
      <h3 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>Game Logs</h3>
      <div className="logs-container">
        {logs.map((log, index) => (
          <div 
            key={index}
            style={{
              padding: '5px',
              borderBottom: index < logs.length - 1 ? '1px solid #ddd' : 'none',
              fontSize: '14px'
            }}
          >
            <span style={{ color: '#666', marginRight: '8px' }}>
              {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}:
            </span>
            {log.message}
          </div>
        ))}
        <div ref={logsEndRef} />
      </div>
    </div>
  );
};

export default GameLogs;
