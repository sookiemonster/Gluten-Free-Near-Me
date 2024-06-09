import express from 'express';
import { rankNearbyPlaces } from '../google-handler.js';
var router = express.Router();

let responseReady = async() => {
   // stub 
   return;
}

/* GET home page. */
router.post('/find-nearby', (req, res) => {
   console.log(req.body);
   rankNearbyPlaces(40.728940,-74.000321);
   
   // responseReady()
      // .then((val) => 
      //    res.send({ body: "Server responded (woah)"})
      // )
});

export { router };
