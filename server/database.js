// Specify DB details via environment variables
import pg from 'pg';
const { Pool } = pg;
import 'dotenv/config'; 

import { isError, voidExceptID, needsReview } from './gf-codes.js';
const LATITUDE_TOLERANCE = 0.0005; // .001 degrees ~= 100m
const LONGITUDE_TOLERANCE = 0.0005;

/**
 * Creates a Point object representing a pair of coordinates (latitude, longitude)
 * @param {Number} lat 
 * @param {Number} long 
 */
export function Point(lat, long) {
   return { "lat" : lat, "long" : long };
}

var Database = function() {
   // Initialize Database manager
   this.initializeDatabase = () => {
      if (this.pool) return; 

      this.pool = new Pool({ ssl: true, idleTimeoutMillis: 0 });
   
      this.pool.on('error', (error) => {
         console.error(error);
         console.error("TIMEOUT!");
         this.pool = null;
      })
   }

   this.initializeDatabase();
   
   // Query methods
   this.updateRestaurantDetails = updateRestaurantDetails.bind(this);
   this.pushLog = pushLog.bind(this);
   this.isValidSearch = isValidSearch.bind(this);
   this.getRestaurant = getRestaurant.bind(this);
   this.getAllInBounds = getAllInBounds.bind(this);

   // Close pool
   this.end = () => { this.pool.end(); }
}

/**
 * Fetches the restaurant details stored in the Database using its Google Place ID
 * @param {String} id The Google Place ID of the target restaurant
 * @returns {Promise|RestaurantDetails} Returns a promise for an object following the restaurant details format
 */
async function getRestaurant(id) {
   this.initializeDatabase();

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

/**
 * Selects and returns all restaurants stored in the Database 
 * that are in within a box defined by the lat / long coordinates 
 * of the bottom left and top right of the box
 * 
 * @param {Point} bottomLeft 
 * @param {Point} topRight 
 * @returns {Promise|Array|RestaurantDetails} An array of objects following the RestaurantDetails format
 */
async function getAllInBounds(bottomLeft, topRight) {
   this.initializeDatabase();

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

/**
 * Upserts the information of a given restaurant within the Database
 * @param {RestaurantDetails} resJSON 
 * @returns The query result
 */
async function updateRestaurantDetails(resJSON) {
   this.initializeDatabase();

   // Do not propogate details if error. Only store ID.
   if (isError(resJSON)) { voidExceptID(resJSON); }

   const query = {
      text: `INSERT INTO places (id, name, lat, long, mapuri, summary, gfrank, reviews, items, rating) 
               VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
               ON CONFLICT(id) 
               DO UPDATE SET (name, lat, long, mapuri, summary, gfrank, reviews, items, rating, last_updated) = ($2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()::DATE)`,
      values: [resJSON.id, resJSON.name, resJSON.lat, resJSON.long, resJSON.mapuri, resJSON.summary, resJSON.gfrank, resJSON.reviews, resJSON.items, resJSON.rating]
   };
   return this.pool.query(query);
}

/**
 * Logs a record of a pair of lat/long coordinates defining where a Nearby Search had been executed 
 *    Used to prevent Nearby Searches around identical / nominally different centers
 * @param {Point} center A pair of coordinates specifying a the centerpoint for a Nearby Search
 * @returns The result of the query
 */
async function pushLog(center) {
   if (!center.lat || !center.long) { return; }
   this.initializeDatabase();
   
   // Store logs with 4 decimal places (since highly unlikely for very close coordinates to be the same)
   let lat = center.lat.toFixed(4);
   let long = center.long.toFixed(4);
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

/**
 * Determines whether a center point for a Nearby Search should be executed or not
 * A search is exectued if: 
 *    -> There have been no Nearby Searches that use a center within a given lat/long tolerance threshold (LATITUDE_TOLERANCE / LONGITUDE_TOLERANCE)
 *    -> OR all Nearby Searches within that threshold have been executed more than 20 days ago
 * @param {Point} center An object of the form: { lat : <NUM>, long : <NUM> }
 * @returns True if the given point should be used as a center for a Nearby Search. False if it should not be.
 */
async function isValidSearch(center) {
   if (!center) { return; }

   this.initializeDatabase();

   // 20 days for a search nearby request to be stale; get all logs that are near the specified point
   const query = {
      text: `SELECT id FROM log WHERE last_updated >= NOW()::DATE - INTERVAL '20 days' AND lat BETWEEN $1 AND $2 AND long BETWEEN $3 AND $4`,
      values: [center.lat - LATITUDE_TOLERANCE, center.lat + LATITUDE_TOLERANCE, center.long - LONGITUDE_TOLERANCE, center.long + LONGITUDE_TOLERANCE]
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

export { Database };