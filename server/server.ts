import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import cors from 'cors';

const app = express();
app.use(cors());
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: false
  }
});

interface Guess {
  playerName: string;
  guess: string;
}


// Store the history of guesses
const guessHistory: Guess[] = [];

const buildPath = path.join(__dirname, '..', '..', 'build');
app.use(express.static(buildPath));


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


