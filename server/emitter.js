var Emitter = function (app, io) {
   this.app = app;
   this.io = io;
   this.broadcastRestaurant = broadcastRestaurant.bind(this);
}

function broadcastRestaurant(menuJSON) {
   // Remove the resolution attempt field (to minimize information sent)
   delete menuJSON['resolveAttempts'];
   // Store in db here

   this.io.emit('restaurant', menuJSON);
}

export { Emitter };