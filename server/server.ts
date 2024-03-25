import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static('build')); // Serve static files from React app

io.on('connection', (socket) => {
  console.log('New WebSocket connection: ', socket.id);

  socket.on('makeGuess', (data) => {
    console.log(`Guess received: `, data);
    // Broadcast the guess to all clients
    io.emit('guessMade', {...data, playerId: socket.id});
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
