// Import React & Components
import React, { useEffect } from 'react';
import MapContainer from './components/MapContainer.js';
import Restaurants from './components/Restaurants.js';

// Import Redux-related Components & info
import { Provider } from 'react-redux'
import { startSearch, resAdded, restrictViewportMarkers } from './redux/RestaurantSlice.js';
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
  // const socket = io("wss://localhost:5000", { transports : ['websocket'] });
  const socket = io("http://localhost:5000", { transports : ['websocket'] });
  // const socket = io("ws://localhost:5000");

  // Define events for web-socket
  useEffect(() => {

    function onRestaurantFound(resJSON) {
      console.log("Received packet", resJSON);
      store.dispatch(resAdded(resJSON));
      store.dispatch(restrictViewportMarkers());
    }

    socket.on('connect', () => console.log('connected'));
    socket.on('disconnect', () => console.log('disconnected'));
    socket.on('restaurant', onRestaurantFound);
    socket.on("connect_error", (err) => {
      console.log(err.message);
      console.log(err.description);
      console.log(err.context);
    });
  }, [socket]);

  return (
    <Provider store={store}>
      <APIProvider apiKey={process.env.REACT_APP_API_KEY}>
      <div className="App">
        <header id="mobile-header">
          <div>
            <h1>Gluten Free Near Me</h1>
            <h2>Let's find you something GF to munch on.</h2>
          </div>
          <div id="hamburger"></div>
        </header>
        <div id="sidebar">
          <header id="sidebar-header">
            <h1>Gluten Free Near Me</h1>
            <h2>Let's find you something GF to munch on.</h2>
          </header>
          <Restaurants />
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
