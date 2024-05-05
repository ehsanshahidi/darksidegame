import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import ErrorBanner from './ErrorBanner';

// Establish socket connection
const socket = io('http://localhost:4000');

interface Guess {
  playerName: string;
  guess: string;
}

// Define valid cards and suits
const validCards = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const validSuits = ['C', 'D', 'H', 'S']; // Clubs, Diamonds, Hearts, Spades

// Function to check if a guess is valid
const isValidGuess = (guess: string) => {
  const [card, suit] = guess.split('');
  return validCards.includes(card) && validSuits.includes(suit);
}

const Game: React.FC = () => {
  const [name, setName] = useState('');
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Attempt to retrieve the player's name from localStorage
    const storedName = localStorage.getItem('playerName');
    if (storedName) {
      setName(storedName);
      setNameSubmitted(true);
    }
  
    const handleNewGuess = (newGuess: Guess) => {
      if (isValidGuess(newGuess.guess)) {
      setGuesses((prevGuesses) => {
        // Check if the guess is already in the list to avoid duplication
        if (!prevGuesses.find(g => g.playerName === newGuess.playerName && g.guess === newGuess.guess)) {
          return [...prevGuesses, newGuess];
        }
        return prevGuesses;
      });
    }else{
      setErrorMessage('Invalid guess: ' + newGuess.guess);
    
    };
  }
  
    socket.on('connect', () => {
      console.log('Successfully connected to the server');
    });
    
    socket.on('connect_error', (error) => {
      console.log('Failed to connect to the server:', error);
    });
    
    socket.on('initialGuesses', (initialGuesses: Guess[]) => {
      setGuesses(initialGuesses);
    });
  
    socket.emit('requestInitialGuesses');
  
    socket.on('guessMade', handleNewGuess);
  
    return () => {
      socket.off('initialGuesses');
      socket.off('guessMade', handleNewGuess);
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
      <ErrorBanner message={errorMessage} />
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
