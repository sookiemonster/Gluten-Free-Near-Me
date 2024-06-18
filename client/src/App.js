import logo from './logo.svg';
import React from 'react';
// import { findNearby } from './script.js';
import Restaurants from './Restaurants.js';
import store from './Store.js';
import {APIProvider, Map} from '@vis.gl/react-google-maps';
import './master.css';
// import './master.css';

function App() {
  // Append map file
  return (
      <div className="App">
        <div id="sidebar">
          <h1>Gluten Free Near Me</h1>
          <button id="finder">Send request</button>

          <Restaurants />
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
          <APIProvider apiKey={process.env.REACT_APP_API_KEY}>
          <Map
            id="map"
            style={{width: '100%', height: '100'}}
            defaultCenter={{lat: 40.7174, lng: -73.985}}
            defaultZoom={18}
            minZoom={17}
            maxZoom={20}
            gestureHandling={'greedy'}
            disableDefaultUI={true}
            mapId={"map-id"}
            />
          </APIProvider>
          </div>
      </div>
  );
}

export default App;
