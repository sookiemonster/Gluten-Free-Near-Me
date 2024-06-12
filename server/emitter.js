import { isError } from "./gf-codes";

var Emitter = function (app, io) {
   this.app = app;
   this.io = io;
   this.broadcastRestaurant = broadcastRestaurant.bind(this);
}

function broadcastRestaurant(menuJSON) {
   // Do not propogate details if error. Only store ID.
   if (isError(resJSON)) { resJSON = voidExceptID(resJSON); }
   // Store in db here

   this.io.emit('restaurant', menuJSON);
}

export { Emitter };