import { marker } from './map.js';

const socket = io("wss://localhost:5000", { transports : ['websocket'] });
socket.on('restaurant', (data) => {
   console.log(data);
   marker(data.name, data.lat, data.long)
});
console.log("client on");