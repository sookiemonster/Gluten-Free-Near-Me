var Emitter = function (app, io) {
   this.app = app;
   this.io = io;
   this.broadcastRestaurant = broadcastRestaurant.bind(this);
}

function broadcastRestaurant(menuJSON) {
   // Store in db here

   // Remove the resolution attempt field (to minimize information stored)
   delete menuJSON['resolveAttempts'];
   this.io.emit('restaurant', menuJSON);
}

export { Emitter };