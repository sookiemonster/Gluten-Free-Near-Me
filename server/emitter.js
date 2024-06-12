var Emitter = function (app, io) {
   this.app = app;
   this.io = io;
   this.broadcastRestaurant = broadcastRestaurant.bind(this);
}

function broadcastRestaurant(menuJSON) {
   this.io.emit('restaurant', menuJSON);
}

export { Emitter };