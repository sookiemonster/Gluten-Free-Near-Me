// google-handler.js defines routines for retrieving nearby places & checking whether a response from the Google API mentions a restaurant being GF

import fetch from "node-fetch";
import * as fs from 'fs/promises';
import * as codes from './gf-codes.js';
import { mentionsGlutenFree } from "./parse-gluten-free.js";
import { dispatchScraper, enqueueRestaurant } from "./scrape.js";
import { appEmitter } from "./app.js";

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
   try {
      const token = await fs.readFile('secret', { encoding: 'utf8' });
      const data = {
         "method" : "POST", 
         "headers" :  {
            "Content-Type" : "application/json",
            "X-Goog-FieldMask" : "places.id,places.displayName,places.formattedAddress,places.reviews,places.googleMapsUri,places.generativeSummary.overview,places.generativeSummary.description",
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
         "gfSum" : "",
         "gfRank" : 0, 
         "gfReviews" : [],
         "gfItems" : []
      }
 * @returns True if any of the restaurant summaries mention gluten-free
 * @post The object's gfSum property is updated with that summary
 */
let findGFSummary = (restaurantData, res) => {
   if (!restaurantData) {
      return false;
   }

   if (restaurantData.editorialSummary?.text && mentionsGlutenFree(restaurantData.editorialSummary.text)) {
      // Include editorial summary as rest. summ
      res.gfSum = restaurantData.editorialSummary.text;
   } else if (restaurantData?.generativeSummary?.overview?.text && mentionsGlutenFree(restaurantData.generativeSummary.overview.text)) {
      // Include generative summary overview as rest. summ
      res.gfSum = restaurantData.generativeSummary.overview.text;
   } else if (restaurantData?.generativeSummary?.description?.text && mentionsGlutenFree(restaurantData.generativeSummary.description.text)) {
      // Include generative summary descrption as rest summary
      res.gfSum = restaurantData.generativeSummary.description.text;
   }

   return res.gfSum.length > 0;
}

/**
 * Determines whether the place data reviews for a specified restaurant mention gluten-free
 * @param {String|Array} restaurantReviews An array of restaurant reviews
 * @param {String|Array} storeGFReviews An array to store reviews that mention gluten-free in
 * @returns True whether any reviews were added. False otherwise.
 * @post The storeGFReviews array is propogated with any reviews mentioning gluten-free
 */
let findGFReviews = (restaurantReviews, storeGFReviews) => {
   // Validate array
   if (!Array.isArray(restaurantReviews) || restaurantReviews.length == 0) {
      return false;
   }

   restaurantReviews.forEach((review) => {
      // console.log(review);
      if (mentionsGlutenFree(review?.text?.text)) { 
         storeGFReviews.push(review?.text?.text); 
      }
   });

   return storeGFReviews.length > 0;
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
      // Wrap summary into object to be edited in functions
      let resJSON = codes.resFormat(restaurant.id);

      if (findGFSummary(restaurant, resJSON[restaurant.id])) {
         resJSON[restaurant.id].gfRank = codes.SELF_DESCRIBED_GF;
         appEmitter.broadcastRestaurant(resJSON);
         console.log(resJSON);
         // Send response with this info back to client
         
         } else if (findGFReviews(restaurant.reviews, resJSON[restaurant.id].gfReviews)) {
            let resJSON = codes.resFormat(restaurant.id);
            resJSON[restaurant.id].gfRank = codes.COMMENTS_MENTION_GF;
            console.log(resJSON);
            appEmitter.broadcastRestaurant(resJSON);
         // Send response with this info back to client

      } else {
         enqueueRestaurant(restaurant.id, restaurant.googleMapsUri);
         dispatchScraper();
      }
   });
}

export { rankNearbyPlaces }