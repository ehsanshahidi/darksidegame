import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

// Establish socket connection
const socket = io('http://localhost:4000');

interface Guess {
  playerName: string;
  guess: string;
}

const Game: React.FC = () => {
  const [name, setName] = useState('');
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [nameSubmitted, setNameSubmitted] = useState(false);

  useEffect(() => {
    // Attempt to retrieve the player's name from localStorage
    const storedName = localStorage.getItem('playerName');
    if (storedName) {
      setName(storedName);
      setNameSubmitted(true);
    }

    // Listen for initial guesses and subsequent guesses
    socket.on('initialGuesses', (initialGuesses: Guess[]) => {
      setGuesses(initialGuesses);
    });

    socket.emit('requestInitialGuesses');

    socket.on('guessMade', (newGuess: Guess) => {
      setGuesses((prevGuesses) => [...prevGuesses, newGuess]);
    });

    return () => {
      socket.off('guessMade');
      socket.off('initialGuesses');
    };
  }, []);

  const handleSubmitName = () => {
    localStorage.setItem('playerName', name);
    setNameSubmitted(true);
  };

  const submitGuess = () => {
    if (!name) {
      alert("Please enter your name first.");
      return;
    }
    socket.emit('makeGuess', { playerName: name, guess });
    setGuess('');
  };

  return (
    <div>
      {!nameSubmitted ? (
        <div>
          <input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <button onClick={handleSubmitName}>Submit Name</button>
        </div>
      ) : (
        <>
          <input
            placeholder="Enter your guess"
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
          />
          <button onClick={submitGuess}>Submit Guess</button>
        </>
      )}
      <div>
        {guesses.map((g, index) => (
          <p key={index}>{`${g.playerName}: ${g.guess}`}</p>
        ))}
      </div>
    </div>
  );
};

export default Game;
