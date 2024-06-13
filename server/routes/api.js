import express from 'express';
import { rankNearbyPlaces } from '../google-handler.js';
import { appEmitter, db } from '../app.js';
var router = express.Router();

/* GET home page. */
router.post('/find-nearby', (req, res) => {
   console.log(req.body);
   let { bottomLeft, topRight } = req.body ;
   db.getAllInBounds(bottomLeft, topRight)
      .then((res) => {
         console.log(res);
         appEmitter.broadcastBatch(res);
      })
      .catch((err) => {
         console.error(err);
      })
   // rankNearbyPlaces(40.728940,-74.000321);
   // rankNearbyPlaces(40.690665,-73.850745);
});

export { router };
