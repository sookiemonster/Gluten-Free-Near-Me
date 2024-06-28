// Specify DB details via environment variables
import postgres from 'postgres';
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
      if (this.connection) return; 

      this.connection = postgres({ 
         ssl: true, 
         idle_timeout: 30,
         connect_timeout: 60 * 30
      });
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

   return new Promise((resolve, reject) => {
      this.connection`SELECT * FROM places WHERE id = ${id}`
         .then((res) => {
            // If not found / it's been previously inaccessible
            console.log(res);
            if (!res || res.length == 0 || needsReview(res)) { reject(null); }
            resolve(res);
         })
         .catch((err) => {
            console.log(err);
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

   return new Promise((resolve, reject) => {
      this.connection`SELECT * FROM places WHERE lat BETWEEN ${bottomLeft.lat} AND ${topRight.lat} AND long BETWEEN ${bottomLeft.long} AND ${topRight.long}`
         .then((res) => {
            // If not found / it's been previously inaccessible
            console.log("Bounded:", res);
            resolve(res);
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

   return new Promise((resolve, reject) => {
      this.connection`INSERT INTO places (id, name, lat, long, mapuri, summary, gfrank, reviews, items, rating) 
         VALUES(${resJSON.id}, ${resJSON.name}, ${resJSON.lat}, ${resJSON.long}, ${resJSON.mapuri}, ${resJSON.summary}, ${resJSON.gfrank}, ${resJSON.reviews}, ${resJSON.items}, ${resJSON.rating}) 
         ON CONFLICT(id) 
         DO UPDATE SET (name, lat, long, mapuri, summary, gfrank, reviews, items, rating, last_updated) = (${resJSON.name}, ${resJSON.lat}, ${resJSON.long}, ${resJSON.mapuri}, ${resJSON.summary}, ${resJSON.gfrank}, ${resJSON.reviews}, ${resJSON.items}, ${resJSON.rating}, NOW()::DATE)` 
         .then(resolve(`Upserted ${resJSON.id} (${resJSON.name}) successfully.`))
         .catch(resolve(`Error upserting ${resJSON.id} (${resJSON.name})`))
      });
}

/**
 * Logs a record of a pair of lat/long coordinates defining where a Nearby Search had been executed 
 *    Used to prevent Nearby Searches around identical / nominally different centers
 * @param {Point} center A pair of coordinates specifying a the centerpoint for a Nearby Search
 * @returns The result of the query
 */
async function pushLog(center) {
   // if (!center.lat || !center.long) { return; }
   // this.initializeDatabase();
   
   // // Store logs with 4 decimal places (since highly unlikely for very close coordinates to be the same)
   // let lat = center.lat.toFixed(4);
   // let long = center.long.toFixed(4);
   // // Create a unique string token by appending latitudes and longitudes
   // const query = {
   //    text: `INSERT INTO log (id, lat, long) 
   //             VALUES($1, $2, $3) 
   //             ON CONFLICT(id) 
   //             DO UPDATE SET last_updated = NOW()::DATE`,
   //    values: [lat.toString() + long.toString(), lat, long]
   // }
   // return this.pool.query(query);
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
   // if (!center) { return; }

   // this.initializeDatabase();

   // // 20 days for a search nearby request to be stale; get all logs that are near the specified point
   // const query = {
   //    text: `SELECT id FROM log WHERE last_updated >= NOW()::DATE - INTERVAL '20 days' AND lat BETWEEN $1 AND $2 AND long BETWEEN $3 AND $4`,
   //    values: [center.lat - LATITUDE_TOLERANCE, center.lat + LATITUDE_TOLERANCE, center.long - LONGITUDE_TOLERANCE, center.long + LONGITUDE_TOLERANCE]
   // }

   // return new Promise((resolve, reject) => {
   //    this.pool.query(query)
   //       .then((res) => {
   //          // console.log(res);
   //          return resolve(res.rows.length == 0);
   //       })
   //       .catch((err) => {
   //          console.log(err)
   //          return reject(true);
   //       });
   // });
}

let test = new Database();
test.updateRestaurantDetails({
   "id": "ChIJN4tQRExZwokRxJDkc7_g5yU",
   "name": "Zerza Moroccan Mediterranean",
   "lat": "40.717942",
   "long": "-73.988239",
   "mapuri": "https://maps.google.com/?cid=2731398811911229636",
   "summary": "Moroccan and Mediterranean fare dished up fast in a casual eatery inside Essex Market.",
   "gfrank": "0",
   "reviews": [],
   "items": [],
   "last_updated": "2024-06-23T04:00:00.000Z",
   "rating": "4.4"
})
.then(res => console.log(res));

// test.getRestaurant("ChIJN4tQRExZwokRxJDkc7_g5yU");
// test.getAllInBounds(Point(40.71, -74), Point(40.72, -73));

export { Database };