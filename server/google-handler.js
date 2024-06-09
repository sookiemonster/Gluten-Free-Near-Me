// google-handler.js defines routines for retrieving nearby places & checking whether a response from the Google API mentions a restaurant being GF

import fetch from "node-fetch";
import * as fs from 'fs/promises';
import * as codes from './gf-codes.js';
import { mentionsGlutenFree } from "./parse-gluten-free.js";
import { dispatchScraper, enqueueRestaurant } from "./scrape.js";
import { appEmitter } from "./app.js";

let rankNearbyPlaces = async(lat, long) => {

   let body = {
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

   try {
      const token = await fs.readFile('secret', { encoding: 'utf8' });
      const data = {
         "method" : "POST", 
         "headers" :  {
            "Content-Type" : "application/json",
            "X-Goog-FieldMask" : "places.id,places.displayName,places.formattedAddress,places.reviews,places.googleMapsUri,places.generativeSummary.overview,places.generativeSummary.description",
            "X-Goog-Api-Key" : token,
         },
         "body" : JSON.stringify(body)
      }
      
      fetch("https://places.googleapis.com/v1/places:searchNearby", data)
         .then((response) => { return response.json(); })
         .then(resJSON => { rankPlaces(resJSON); })
         .catch(err => { console.error(err); })
   } catch (err) {
      console.log(err);
   }

}

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

let findGFReviews = (restaurantReviews, storeGFReviews) => {
   // Validate array
   if (!Array.isArray(restaurantReviews) || restaurantReviews.length == 0) {
      return false;
   }

   restaurantReviews.forEach((review) => {
      if (mentionsGlutenFree(review.text.text)) { 
         storeGFReviews.push(review.text.text); 
      }
   });

   return storeGFReviews.length > 0;
}

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