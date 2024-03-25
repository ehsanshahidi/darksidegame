import React, { useState } from 'react';
import './App.css';
import Game from './Game';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <p>Welcome to the dark side game</p>
        <Game />
      </header>
    </div>
  );
}

export default App;
