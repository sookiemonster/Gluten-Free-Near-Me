// google-handler.js defines routines for retrieving nearby places & checking whether a response from the Google API mentions a restaurant being GF

import fetch from "node-fetch";
import 'dotenv/config';
import * as codes from './gf-codes.js';
import { mentionsGlutenFree } from "./parse-gluten-free.js";
import { dispatchScraper, enqueueRestaurant } from "./scrape.js";
import { appEmitter, db } from "./app.js";

import * as fs from 'fs';


const token = process.env.API_KEY;

/**
 * Returns the body of a HTTP request to find nearby restaurants within a 250m radius about a specified center
 * @param {float} lat The latitude of the center 
 * @param {float} long The longitude of the center
 * @returns An object in JSON format with the specified latitude and longitude for the center
 */
let createRequestBody = (lat, long) => {
   return {
      "includedTypes": [ "restaurant" ],
      "maxResultCount": 20,
      "rankPreference": "DISTANCE",
      "locationRestriction": {
         "circle": {
            "center": {
            "latitude": lat,
            "longitude": long
            },
            "radius": 250
         }
      }
   };
}

/**
 * The initializer for ranking places based on their gluten-free options within a circular region, specified by a centerpoint
 * @param {float} lat The latitude of the center 
 * @param {float} long The longitude of the center
 * @post The places within the region are sent to be ranked
 */
let rankNearbyPlaces = async(lat, long) => {
   fs.readFile("small.json", (err, data) => { 
      // Check for errors 
      if (err) throw err; 
      // Parse JSON and start looking for GF availabilites
      rankPlaces(JSON.parse(data));
   }); 

   return;


   try {
      const data = {
         "method" : "POST", 
         "headers" :  {
            "Content-Type" : "application/json",
            "X-Goog-FieldMask" : "places.id,places.displayName,places.formattedAddress,places.reviews,places.googleMapsUri,places.editorialSummary,places.generativeSummary.overview,places.generativeSummary.description,places.location",
            "X-Goog-Api-Key" : token,
         },
         "body" : JSON.stringify(createRequestBody(lat, long))
      }
      
      fetch("https://places.googleapis.com/v1/places:searchNearby", data)
         .then(response => { return response.json(); })
         .then(resJSON => { rankPlaces(resJSON); })
         .catch(err => { console.error(err); })
   } catch (err) {
      console.log(err);
   }

}

/**
 * Determines whether the place data summaries for a specified restaurant mention gluten-free
 * @param {Object} restaurantData The google maps place data for a given restaurant
 * @param {Object} res An object storing the response JSON for a given restaurant in the format: 
 *    <id> : {
         "summary" : "",
         "gfrank" : 0, 
         "reviews" : [],
         "items" : []
      }
 * @returns True if any of the restaurant summaries mention gluten-free
 * @post The object's summary property is updated with that summary
 */
let findGFSummary = (restaurantData, res) => {
   if (!restaurantData) { return false; }

   // Try using Editorial summary
   let summaries = [restaurantData.editorialSummary?.text, restaurantData?.generativeSummary?.overview?.text, restaurantData?.generativeSummary?.description?.text];
   
   for (const summary of summaries) {
      // Set the current summary if there is none already
      if (!res.summary) { res.summary = summary; }
      // If the current summary then mentions gluten-free, override and use it.
      if (mentionsGlutenFree(summary)) {
         res.summary = summary;
         return true; 
      }
   }

   return false;
}

/**
 * Determines whether the place data reviews for a specified restaurant mention gluten-free
 * @param {JSON|Array} restaurantReviews An array of restaurant reviews
 * @param {JSON|Array} storeGFReviews An array to store reviews that mention gluten-free in
 * @returns True whether any reviews were added. False otherwise.
 * @post The storeGFReviews array is propogated with any reviews mentioning gluten-free
 */
let findGFReviews = (restaurantReviews, storeGFReviews) => {
   // Validate array
   if (!Array.isArray(restaurantReviews) || restaurantReviews.length == 0) {
      return false;
   }

   // Define a local function to format the timestamp 
   let formatTimestamp = (dateString) => {
      if (!dateString || dateString.length == 0) { return; }
      return dateString.split('T')[0];
   };

   restaurantReviews.forEach((review) => {
      if (mentionsGlutenFree(review?.text?.text)) {
         storeGFReviews.push({
            author : review?.authorAttribution?.displayName,
            rating: review?.rating,
            text : review?.text?.text, 
            publishDate : formatTimestamp(review?.publishTime)
         }); 
      }
   });

   return storeGFReviews.length > 0;
}

let parseRestaurantInfo = (restaurant) => {
   let resJSON = codes.resFormat(restaurant.id, restaurant.googleMapsUri, restaurant.location.latitude, restaurant.location.longitude, restaurant.displayName.text);

   if (findGFSummary(restaurant, resJSON)) {
      resJSON.gfrank = codes.SELF_DESCRIBED_GF;
      console.log(resJSON);
      appEmitter.broadcastRestaurant(resJSON);
      // Send response with this info back to client
      
   } else if (findGFReviews(restaurant.reviews, resJSON.reviews)) {
      resJSON.gfrank = codes.COMMENTS_MENTION_GF;
      console.log(resJSON);
      appEmitter.broadcastRestaurant(resJSON);
   // Send response with this info back to client

   } else {
      enqueueRestaurant(resJSON);
      dispatchScraper();
   }
}

/**
 * Parses and ranks each restaurant in placeData, broadcasting the result to all connected users
 * @param {Object} placeData The google maps JSON response from a nearbySearch
 */
let rankPlaces = async(placeData) => {
   // Validate places information format
   if (!Array.isArray(placeData.places) || placeData.places.length == 0) {
      return ;
   }

   placeData.places.forEach((restaurant) => {
      if (!restaurant) { return; }
      console.log(restaurant.displayName.text);
      
      db.getRestaurant(restaurant.id)
         .then((resJSON) => {
            console.log(resJSON);
            appEmitter.broadcastRestaurant(resJSON);
         })
         .catch((err) => {
            console.error(err);
            parseRestaurantInfo(restaurant) }
         );
   });
}

export { rankNearbyPlaces }