import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import ErrorBanner from './ErrorBanner';
import Select from 'react-select';

// Establish socket connection
const socket = io('http://localhost:4000');

interface Guess {
  playerName: string;
  guess: string;
}

// Define valid cards and suits
const validCards: { [key: string]: string } = {
  'A': 'ace',
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  '10': '10',
  'J': 'jack',
  'Q': 'queen',
  'K': 'king'
};

const validSuits: { [key: string]: string } = {
  'C': 'clubs',
  'D': 'diamonds',
  'H': 'hearts',
  'S': 'spades'
};

// Function to check if a guess is valid
const isValidGuess = (guess: string) => {
  const [card, suit] = guess.split('');
  return validCards[card] && validSuits[suit];
}

// Function to get image name from guess
const getImageNameFromGuess = (guess: string) => {
  const [card, suit] = guess.split('');
  return `${validCards[card]}_of_${validSuits[suit]}.png`;
}

const Game: React.FC = () => {
  const [name, setName] = useState('');
  const [guess, setGuess] = useState('');
  const [guesses, setGuesses] = useState<Guess[]>([]);
  const [nameSubmitted, setNameSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedCard, setSelectedCard] = useState(validCards[0]);
  const [selectedSuit, setSelectedSuit] = useState(validSuits[0]);
// Define the options for the Select components
  const cardOptions = Object.values(validCards).map(card => ({ value: card, label: `${card} of ${validSuits[0]}` }));
  const suitOptions = Object.values(validSuits).map(suit => ({ value: suit, label: `${validCards[0]} of ${suit}` }));

// Use the useState hook to manage the selected options
const [selectedCards, setSelectedCards] = useState([cardOptions[0], cardOptions[1]]);
const [selectedSuits, setSelectedSuits] = useState([suitOptions[0], suitOptions[1]]);


  const handleNewGuess = () => {
    const newGuess = { playerName: name, guess: selectedCard + selectedSuit };

    if (isValidGuess(newGuess.guess)) {
      setGuesses((prevGuesses) => {
        // Check if the guess is already in the list to avoid duplication
        if (!prevGuesses.find(g => g.playerName === newGuess.playerName && g.guess === newGuess.guess)) {
          return [...prevGuesses, newGuess];
        }
        return prevGuesses;
      });

      // Emit the new guess
      socket.emit('makeGuess', newGuess);
    } else {
      setErrorMessage('Invalid guess: ' + newGuess.guess);
    }
  };
  useEffect(() => {
    // Attempt to retrieve the player's name from localStorage
    const storedName = localStorage.getItem('playerName');
    if (storedName) {
      setName(storedName);
      setNameSubmitted(true);
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
  
  
    return () => {
      socket.off('initialGuesses');
    };
  }, []);
  

  const handleSubmitName = () => {
    localStorage.setItem('playerName', name);
    setNameSubmitted(true);
  };

  return (
    <div>
      <ErrorBanner message={errorMessage} />
      <Select
        options={cardOptions}
        value={selectedCards}
        onChange={setSelectedCards}
        isMulti
      />
      <Select
        options={suitOptions}
        value={selectedSuits}
        onChange={setSelectedSuits}
        isMulti
      />
      <button onClick={handleNewGuess}>Guess</button>
   
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
        <div>
          {guesses.map((g, index) => (
            <div key={index}>
              <p>{`${g.playerName}: ${g.guess}`}</p>
              <img src={`${process.env.PUBLIC_URL}/cards/${getImageNameFromGuess(g.guess)}`} alt={g.guess} style={{ width: '10%', height: 'auto' }} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Game;
