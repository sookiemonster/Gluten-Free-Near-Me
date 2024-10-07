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
         appEmitter.broadcastBatch(res);
      })
      .catch((err) => {
         console.log("error bounds checking: ", err);
      });

   let searchPromises = [];
   let isValid = false;
   for (let point of searchFoci) {
      console.log("Search Point: ", point);
      searchPromises.push(new Promise((resolve) => {
         db.isValidSearch(point)
            .then((validationResult) => {
               isValid = validationResult;
               // console.log(point);
               // console.log(isValid);
            })
            .catch(err => {
               // There was an error querying the database, so just use this search point
               console.log("There was an error querying the database.", err);
               isValid = true;
            }).then(() => {
               if (!isValid) { resolve([-1]); }
               console.log("Ranking: ");
               rankNearbyPlaces(point.lat, point.long)
                  .then((ids) => resolve(ids));
            });
      }));
   }

   
   Promise.all(searchPromises)
      .then((allIDsWrapper) => {
         console.log("all ids: ", allIDsWrapper, "\nall ids end");
         res.send(allIDsWrapper);
      }) 
      .catch((err) => {
         console.log("Error:", err);
      })
});

export { router };
