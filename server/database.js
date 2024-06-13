// Specify DB details via environment variables
import pg from 'pg';
const { Pool } = pg;
import 'dotenv/config'; 

import { isError, voidExceptID, needsReview } from './gf-codes.js';
const LATITUDE_TOLERANCE = 0.001; // .001 degrees ~= 100m
const LONGITUDE_TOLERANCE = 0.001;


var Database = function() {
   // Initialize Database manager
   this.pool = new Pool({ ssl: true });
   
   // Query methods
   this.updateRestaurantDetails = updateRestaurantDetails.bind(this);
   this.pushLog = pushLog.bind(this);
   this.isValidSearch = isValidSearch.bind(this);
   this.getRestaurant = getRestaurant.bind(this);
   this.getAllInBounds = getAllInBounds.bind(this);

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

async function getAllInBounds(bottomLeft, topRight) {
   const query = {
      text: "SELECT * FROM places WHERE lat BETWEEN $1 AND $2 AND long BETWEEN $3 AND $4",
      values: [bottomLeft.lat, topRight.lat, bottomLeft.long, topRight.long]
   }

   return new Promise((resolve, reject) => {
      this.pool.query(query)
         .then((res) => {
            // If not found / it's been previously inaccessible
            resolve(res.rows);
         })
         .catch((err) => {
            console.log(err);
            reject([]);
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

async function pushLog(lat, long) {
   if (!lat || !long) { return; }
   
   // Store logs with 4 decimal places (since highly unlikely for very close coordinates to be the same)
   lat = lat.toFixed(4);
   long = long.toFixed(4);
   // Create a unique string token by appending latitudes and longitudes
   const query = {
      text: `INSERT INTO log (id, lat, long) 
               VALUES($1, $2, $3) 
               ON CONFLICT(id) 
               DO UPDATE SET last_updated = NOW()::DATE`,
      values: [lat.toString() + long.toString(), lat, long]
   }
   return this.pool.query(query);
}

async function isValidSearch(point) {
   if (!point) { return; }

   // 20 days for a search nearby request to be stale; get all logs that are near the specified point
   const query = {
      text: `SELECT id FROM log WHERE last_updated >= NOW()::DATE - INTERVAL '20 days' AND lat BETWEEN $1 AND $2 AND long BETWEEN $3 AND $4`,
      values: [point.lat - LATITUDE_TOLERANCE, point.lat + LATITUDE_TOLERANCE, point.long - LONGITUDE_TOLERANCE, point.long + LONGITUDE_TOLERANCE]
   }

   return new Promise((resolve, reject) => {
      this.pool.query(query)
         .then((res) => {
            // console.log(res);
            return resolve(res.rows.length == 0);
         })
         .catch((err) => {
            console.log(err)
            return reject(true);
         });
   });
}

// let test = new Database();
// test.isValidSearch({ lat: 0.0010, long: 23.4})
//    .then(res => console.log(res))
//    .catch(err => console.error(err));

export { Database };