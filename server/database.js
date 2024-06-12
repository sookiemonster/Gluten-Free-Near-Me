// Specify DB details via environment variables
import pg from 'pg';
const { Pool } = pg;
import 'dotenv/config'; 

import { isError, voidExceptID, needsReview } from './gf-codes.js';

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
            // If not found / it's been previously inaccessible
            if (!res.rows[0] || needsReview(res.rows[0])) { throw null; }
            resolve(res.rows[0]);
         })
         .catch((err) => {
            // console.log(err);
            reject(null);
         })
   });
}

async function updateRestaurantDetails(resJSON) {
   // Do not propogate details if error. Only store ID.
   if (isError(resJSON)) { voidExceptID(resJSON); }

   const query = {
      text: `INSERT INTO places (id, name, lat, long, mapuri, summary, gfrank, reviews, items) 
               VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) 
               ON CONFLICT(id) 
               DO UPDATE SET (name, lat, long, mapuri, summary, gfrank, reviews, items, last_updated) = ($2, $3, $4, $5, $6, $7, $8, $9, NOW()::DATE)`,
      values: [resJSON.id, resJSON.name, resJSON.lat, resJSON.long, resJSON.mapuri, resJSON.summary, resJSON.gfrank, resJSON.reviews, resJSON.items]
   };
   return this.pool.query(query);
}

export { Database };