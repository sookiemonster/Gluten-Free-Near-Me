import logo from './logo.svg';
import React from 'react';
// import { findNearby } from './script.js';
import Restaurant from './Restaurants.js';
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
          <Restaurant name ="NAME" id="abc" summary="It has GF options. Holy!" rating="1.0" mapUri="/" gfrank="3" reviews={[]} menu={[]} />
          <Restaurant name ="Wild" id="a" summary="Cozy, locally minded, farmhouse-chic eatery specializes in creative pizzas, with vegan options." rating="4.8" mapUri="/" gfrank="2" menu={[{name : "Pancakes (GF)", description : "Gluten-free. Served with fresh berries and maple syrup."}, { name : "Hangover Burger", description : "1/2 pound beef burger, fried egg, cheddar & aioli, tomato, lettuce, and onion served on a gluten-free bun. With a free side of roasted potatoes Or a small house salad and soda."}]     } reviews={[]} />
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
