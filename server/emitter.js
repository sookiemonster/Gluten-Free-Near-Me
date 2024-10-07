import { isError } from "./gf-codes.js";

var Emitter = function (app, io) {
   this.app = app;
   this.io = io;
   this.broadcastRestaurant = broadcastRestaurant.bind(this);
   this.broadcastBatch = broadcastBatch.bind(this);
}

/**
 * Emits the RestaurantDetails of a given restaurant to all connected users
 * @param {RestaurantDetails} resJSON 
 */
function broadcastRestaurant(resJSON) {
   console.log("broadcasting RECEIVED PACKET:", resJSON, resJSON.id);
   // console.log("broadcasting:", resJSON.id, resJSON.name, resJSON.gfrank);
   this.io.emit('restaurant', resJSON);
}

/**
 * Wrapper for individually emitting details of all restaurant in an array
 * @param {Array|RestaurantDetails} collection An array containing RestaurantDetail objects
 */
function broadcastBatch(collection) {
   if (!collection || collection.length == 0) { return; }
   collection.forEach(resJSON => {
      this.broadcastRestaurant(resJSON);
   });
}

export { Emitter };