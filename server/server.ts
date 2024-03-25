import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

interface Guess {
  playerName: string;
  guess: string;
}


// Store the history of guesses
const guessHistory: Guess[] = [];

app.use(express.static('build')); // Serve static files from React app

io.on('connection', (socket) => {
  console.log('New WebSocket connection: ', socket.id);

  socket.on('requestInitialGuesses', () => {
    socket.emit('initialGuesses', guessHistory);
    console.log('Sent initial guesses upon request to client: ', guessHistory);
  });

  socket.on('makeGuess', (data: Guess) => {
    console.log(`Guess received from ${data.playerName}: `, data.guess);
    guessHistory.push(data); // Add new guess to the array
    io.emit('guessMade', data); // Broadcast the new guess to all clients
  });
});


const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


