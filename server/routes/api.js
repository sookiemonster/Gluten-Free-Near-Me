import express from 'express';
import { rankNearbyPlaces } from '../google-handler.js';
var router = express.Router();

/* GET home page. */
router.post('/find-nearby', (req, res) => {
   console.log(req.body);
   rankNearbyPlaces(40.728940,-74.000321);
   // rankNearbyPlaces(40.690665,-73.850745);
});

export { router };
