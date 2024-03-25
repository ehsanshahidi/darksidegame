import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:4000'); // Adjust if your server runs on a different port

const Game: React.FC = () => {
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState<Array<{playerId: string, guess: string}>>([]);

  useEffect(() => {
    socket.on('guessMade', (data: {playerId: string, guess: string}) => {
      setGuesses((prevGuesses) => [...prevGuesses, data]);
    });

    return () => {
      socket.off('guessMade');
    };
  }, []);

  const submitGuess = () => {
    socket.emit('makeGuess', { guess });
    setGuess('');
  };

  return (
    <div>
      <input value={guess} onChange={(e) => setGuess(e.target.value)} />
      <button onClick={submitGuess}>Submit Guess</button>
      <div>
        {guesses.map((g, index) => (
          <p key={index}>{`${g.playerId}: ${g.guess}`}</p>
        ))}
      </div>
    </div>
  );
}

export default Game;
