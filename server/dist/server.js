"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server);
// Store the history of guesses
const guessHistory = [];
const buildPath = path_1.default.join(__dirname, '..', '..', 'build');
app.use(express_1.default.static(buildPath));
io.on('connection', (socket) => {
    console.log('New WebSocket connection: ', socket.id);
    socket.on('requestInitialGuesses', () => {
        socket.emit('initialGuesses', guessHistory);
        console.log('Sent initial guesses upon request to client: ', guessHistory);
    });
    socket.on('makeGuess', (data) => {
        console.log(`Guess received from ${data.playerName}: `, data.guess);
        guessHistory.push(data); // Add new guess to the array
        io.emit('guessMade', data); // Broadcast the new guess to all clients
    });
});
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
