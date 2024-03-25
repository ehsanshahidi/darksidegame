"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server);
app.use(express_1.default.static('build')); // Serve static files from React app
io.on('connection', (socket) => {
    console.log('New WebSocket connection: ', socket.id);
    socket.on('makeGuess', (data) => {
        console.log(`Guess received: `, data);
        // Broadcast the guess to all clients
        io.emit('guessMade', Object.assign(Object.assign({}, data), { playerId: socket.id }));
    });
});
const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
