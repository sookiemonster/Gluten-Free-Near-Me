import { marker } from './map.js';
import { isInViewport } from './find.js';

const socket = io("wss://localhost:5000", { transports : ['websocket'] });
socket.on('restaurant', (restaurant) => {
   console.log(restaurant);
   // Error or not in viewport, do not render
   if (restaurant.gfRank < 1 || !isInViewport(restaurant.lat, restaurant.long)) { return; }
   console.log(isInViewport(restaurant.lat, restaurant.long));
   // Otherwise, render on the map
   marker(restaurant.name, restaurant.id, restaurant.lat, restaurant.long, restaurant.gfrank);
});
console.log("client on");