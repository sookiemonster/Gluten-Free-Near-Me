import logo from './logo.svg';
import React from 'react';
import { findNearby } from './script.js';
import './App.css';

function App() {
  // Append map file
  return (
    <div className="App">
      <header className="App-header">
        Hello world!
      </header>
      <button onClick={findNearby}>Send request</button>
    </div>
  );
}

export default App;
