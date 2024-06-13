import logo from './logo.svg';
import React from 'react';
// import { findNearby } from './script.js';
import './master.css';
// import './master.css';

function App() {
  // Append map file
  return (
    <div className="App">
      <div id="sidebar">
        <h1>Gluten Free Near Me</h1>
        <button id="finder">Send request</button>

        <div id="restaurants">
          <div className="restaurant-container"></div>
        </div>
        <div id="search-container">
          <span id="search-prompt">Search </span>

          </div>
          <nav id="nav">
              <a className="active" href="/">Home</a>
              <a href="/about">About</a>
              <a href="">Documentation</a>
          </nav>
      </div>

      <div id="map-container">
        <div id="map"></div>
      </div>
    </div>
  );
}

export default App;
