import express from 'express';
import { rankNearbyPlaces } from '../google-handler.js';
import { appEmitter, db } from '../app.js';
var router = express.Router();


/* GET home page. */
router.post('/find-nearby', (req, res) => {
   console.log(req.body);
   let { bottomLeft, topRight } = req.body.viewportBounds;
   let searchFoci = req.body.searchFoci;
   db.getAllInBounds(bottomLeft, topRight)
      .then((res) => {
         console.log(res);
         appEmitter.broadcastBatch(res);
      })
      .catch((err) => {
         console.error("error bounds checking");
         console.error(err);
      });

   for (let point of searchFoci) {
      console.log(point);
      db.isValidSearch(point)
         .then((isValid) => {
            console.log(point);
            console.log(isValid);
            if (!isValid) { return; }
            console.log('RANKING');
            rankNearbyPlaces(point.lat, point.long);
         })
         .catch(err => {
            console.log(err)
            console.log("WE HAVE AN ERROR");
            rankNearbyPlaces(point.lat, point.long);
         });
   }
   // rankNearbyPlaces(40.728940,-74.000321);
   // rankNearbyPlaces(40.690665,-73.850745);
});

export { router };
