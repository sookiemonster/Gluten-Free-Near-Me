import { isError, voidExceptID } from "./gf-codes.js";

var Emitter = function (app, io) {
   this.app = app;
   this.io = io;
   this.broadcastRestaurant = broadcastRestaurant.bind(this);
}

function broadcastRestaurant(menuJSON) {
   // Do not propogate details if error. Only store ID.
   if (isError(menuJSON)) { voidExceptID(menuJSON); }
   this.io.emit('restaurant', menuJSON);
}

export { Emitter };