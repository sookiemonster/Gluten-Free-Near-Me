import logo from './logo.svg';
import React from 'react';
import { findNearby } from './script.js';
import './master.css';
// import './master.css';

function App() {
  // Append map file
  return (
    <div className="App">
      <div id="sidebar">
        <h1>Gluten Free Near Me</h1>
        <div id="restaurants">
          <div className="restaurant-container"></div>
        </div>
        <div id="search-container">
          <span id="search-prompt">Search </span>
          {/* <input
          id="map-input"
          class="controls"
          type="text"
          placeholder="Enter a place"
          /> */}
          </div>
          <nav id="nav">
              <a className="active" href="/">Home</a>
              <a href="/about">About</a>
              <a href="">Documentation</a>
          </nav>
      </div>
      {/* <header className="App-header">
        Hello world!
      </header>
      <button onClick={findNearby}>Send request</button> */}
      <div id="map-container">
        <div id="map"></div>
      </div>
    </div>
  );
}

export default App;
