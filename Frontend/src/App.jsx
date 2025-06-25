// App.jsx
import React, { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './App.css';

export default function App() {
  const animRef   = useRef(null) //using ref to direct access dom element;
  const socketRef = useRef(null) //using ref so new connection are not made on re renders ;

  useEffect(() => {
    socketRef.current = io('http://localhost:4000');

    // listen for each animation frame
    socketRef.current.on('animate', ({ height, width, opacity }) => {
      const el = animRef.current;
      if (!el) return;
      el.style.height  = `${height}px`;
      el.style.width   = `${width}%`;
      el.style.opacity = opacity;
    });
    //disconnect on unmounting
    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const send = (cmd) => socketRef.current.emit(cmd);

  return (
    <>
      <div className="controls">
        <button onClick={() => send('start')}>Start</button>
        <button onClick={() => send('stop')}>Stop</button>
      </div>
      <div ref={animRef} className="animation" />
    </>
  );
}
