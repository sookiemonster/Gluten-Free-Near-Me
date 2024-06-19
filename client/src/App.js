import logo from './logo.svg';
import React from 'react';
// import { findNearby } from './script.js';
import Restaurants from './Restaurants.js';
import store from './Store.js';
import MapContainer from './MapContainer.js';
import './master.css';
import { Provider } from 'react-redux'
import { APIProvider } from '@vis.gl/react-google-maps';
import { resAdded } from './RestaurantSlice.js';
// import './master.css';

function App() {
  // Append map file
  return (
    <Provider store={store}>
      <div className="App">
        <div id="sidebar">
          <h1>Gluten Free Near Me</h1>
          <button id="finder">Send request</button>

          <Restaurants />
          <div id="search-container">
            <span id="search-prompt">Search </span>

            {/* <button onClick={() => {
              store.dispatch(resAdded({
              id: "aba" + String(Math.random()),
              name: "testRandom",
              lat: 40.717 + Math.random() * (0.001), 
              lng: -73.985 + Math.random() * (0.001), 
            }))}
            
            }>Do test</button> */}
            </div>
            <nav id="nav">
                <a className="active" href="/">Home</a>
                <a href="/about">About</a>
                <a href="">Documentation</a>
            </nav>
        </div>

        <APIProvider apiKey="AIzaSyA5Jtb97DX2_YGOh1zwpfiHqdumhDfKC9c">
          <MapContainer/>
        </APIProvider>
      </div>
  </Provider>
  );
}

export default App;
