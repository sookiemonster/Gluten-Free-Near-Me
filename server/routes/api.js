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

   let searchPromises = [];
   let isValid = false;
   for (let point of searchFoci) {
      console.log(point);
      searchPromises.push(new Promise((resolve) => {
         db.isValidSearch(point)
            .then((validationResult) => {
               isValid = validationResult;
               console.log(point);
               console.log(isValid);
            })
            .catch(err => {
               // There was an error querying the database, so just use this search point
               console.error("There was an error querying the database.");
               console.error(err);
               isValid = true;
            }).then(() => {
               if (!isValid) { return; }
               console.log("Ranking: ");
               rankNearbyPlaces(point.lat, point.long)
                  .then((ids) => resolve(ids));
            });
      }));
   }

   
   Promise.all(searchPromises)
      .then((allIDsWrapper) => {
         console.log("all ids: ");
         console.log(allIDsWrapper);
         console.log("all id end");
         res.send(allIDsWrapper);
      }) 
      .catch((err) => {
         console.error(err);
      })
});

export { router };
