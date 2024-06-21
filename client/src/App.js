// Import React & Components
import React, { useEffect } from 'react';
import MapContainer from './components/MapContainer.js';
import Restaurants from './components/Restaurants.js';
import Finder from './components/Finder.js';

// Import Redux-related Components & info
import { Provider } from 'react-redux'
import { resAdded } from './redux/RestaurantSlice.js';
import store from './redux/Store.js';

// Improt Google API Provider
import { APIProvider } from '@vis.gl/react-google-maps';

// Import client web-socket connection
import io from 'socket.io-client';
import './styles/master.css';

// Enable Maps / Sets (for keeping only unique restaurants in the Redux store)
import {enableMapSet} from "immer";
enableMapSet();

function App() {
  // Connect to server using web-sockets
  const socket = io("wss://localhost:5000", { transports : ['websocket'] });

  // Define events for web-socket
  useEffect(() => {

    function onRestaurantFound(resJSON) {
      store.dispatch(resAdded(resJSON));
    }

    socket.on('connect', () => console.log('connected'));
    socket.on('disconnect', () => console.log('disconnected'));
    socket.on('restaurant', onRestaurantFound);
  }, [socket]);


  return (
    <Provider store={store}>
      <APIProvider apiKey={process.env.REACT_APP_API_KEY}>
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
