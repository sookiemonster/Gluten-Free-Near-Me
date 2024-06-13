import { isError } from "./gf-codes.js";

var Emitter = function (app, io) {
   this.app = app;
   this.io = io;
   this.broadcastRestaurant = broadcastRestaurant.bind(this);
   this.broadcastBatch = broadcastBatch.bind(this);

}

function broadcastRestaurant(menuJSON) {
   // Do not broadcast errors
   if (isError(menuJSON)) { return; }
   this.io.emit('restaurant', menuJSON);
}

function broadcastBatch(collection) {
   collection.forEach(resJSON => {
      this.broadcastRestaurant(resJSON);
   });
}

export { Emitter };