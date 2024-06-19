import logo from './logo.svg';
import React, { useEffect, useState }from 'react';
// import { findNearby } from './script.js';
import Restaurants from './Restaurants.js';
import Finder from './Finder.js';
import store from './Store.js';
import MapContainer from './MapContainer.js';
import './master.css';
import { Provider } from 'react-redux'
import { APIProvider } from '@vis.gl/react-google-maps';
import io from 'socket.io-client';
import { resAdded } from './RestaurantSlice.js';
// import { resAdded } from './RestaurantSlice.js';


function App() {
  const socket = io("wss://localhost:5000", { transports : ['websocket'] });

  useEffect(() => {

    function onRestaurantFound(resJSON) {
      store.dispatch(resAdded(resJSON));
    }

    socket.on('connect', () => console.log('connected'));
    socket.on('disconnect', () => console.log('disconnected'));
    socket.on('restaurant', onRestaurantFound);
  }, [socket]);


  // Append map file
  return (
    <Provider store={store}>
      <APIProvider apiKey="AIzaSyA5Jtb97DX2_YGOh1zwpfiHqdumhDfKC9c">
      <div className="App">
        <div id="sidebar">
          <h1>Gluten Free Near Me</h1>
          <Finder />

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

          <MapContainer/>
      </div>
    </APIProvider>
  </Provider>
  );
}

export default App;
