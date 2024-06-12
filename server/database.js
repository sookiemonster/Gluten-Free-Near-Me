// Specify DB details via environment variables
import pg from 'pg';
const { Pool } = pg;
import 'dotenv/config'; 

import { isError, resFormat, voidExceptID } from './gf-codes.js';

var Database = function() {
   // Initialize Database manager
   this.pool = new Pool({ ssl: true });
   
   // Query methods
   this.updateRestaurantDetails = updateRestaurantDetails.bind(this);
   this.getRestaurant = getRestaurant.bind(this);

   // Close pool
   this.end = () => { this.pool.end(); }
}

async function getRestaurant(id) {
   const query = {
      text: "SELECT * FROM places WHERE id = $1",
      values: [id]
   }

   return new Promise((resolve, reject) => {
      this.pool.query(query)
         .then((res) => {
            // let resJSON = resFormat(res.id, res.mapuri, )
            console.log(res.rows[0]);
            return resolve(res.rows[0]);
         })
         .catch((err) => {
            console.error(err);
            return reject(err);
         })
   });
}

async function updateRestaurantDetails(resJSON) {
   // Do not propogate details if error. Only store ID.
   if (isError(resJSON)) { resJSON = voidExceptID(resJSON); }

   // do updates instead of inserting if already in table:
   // https://stackoverflow.com/questions/1109061/insert-on-duplicate-update-in-postgresql/1109198#1109198

   const query = {
      text: 'INSERT INTO places (id, name, lat, long, mapuri, summary, gfrank, reviews, items) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      values: [resJSON.id, resJSON.name, resJSON.lat, resJSON.long, resJSON.mapUri, resJSON.gfSum, resJSON.gfRank, resJSON.gfReviews, resJSON.gfItems]
   };
   return this.pool.query(query);
}

let db = new Database;

// await db.updateRestaurantDetails(
//    {
//       "id" : "test4",
//       "name" : "test",
//       "lat" : 23.442,
//       "long": 180.233,
//       "mapUri" : "test.com",
//       "gfSum" : "A summary!",
//       "gfRank" : 3, 
//       "gfReviews" : [{"author" : "sarah", "text" : "a review!"}],
//       "gfItems" : [{"item" : "borgar", "description" : "very tasty."}],
//       "resolveAttempts" : 0
//    }
// )

await db.getRestaurant("test4");

// pool.query("SELECT * FROM places;")
//    .then((result) => console.log(result.rows));
   
db.end();
