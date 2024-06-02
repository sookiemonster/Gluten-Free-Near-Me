// google-handler.js defines routines for retrieving nearby places & checking whether a response from the Google API mentions a restaurant being GF

import fetch from "node-fetch";
import * as fs from 'fs';
import * as codes from './gf-codes.js';
import { getGFMenu } from './scrape.js';
import { mentionsGlutenFree } from "./parse-gluten-free.js";
import { browser, dispatchScraper, enqueueRestaurant } from "./scrape-driver.js";

let getNearbyLocations = async(location_details) => {
   
   fs.readFile("sample_gf2.json", (err, data) => { 
      // Check for errors 
      if (err) throw err; 
      // Parse JSON and start looking for GF availabilites
      findGFNearby(JSON.parse(data));
   }); 
}

let findGFSummary = (restaurantData, storeSummary) => {
   if (!restaurantData) {
      return ;
   }

   // Ensure summary is cleared
   storeSummary.val = "";

   if (restaurantData.editorialSummary?.text && mentionsGlutenFree(restaurantData.editorialSummary.text)) {
      // Include editorial summary as rest. summ
      storeSummary.val = restaurantData.editorialSummary.text;
   } else if (restaurantData?.generativeSummary?.overview?.text && mentionsGlutenFree(restaurantData.generativeSummary.overview.text)) {
      // Include generative summary overview as rest. summ
      storeSummary.val = restaurantData.generativeSummary.overview.text;
   } else if (restaurantData?.generativeSummary?.description?.text && mentionsGlutenFree(restaurantData.generativeSummary.description.text)) {
      // Include generative summary descrption as rest summary
      storeSummary.val = restaurantData.generativeSummary.description.text;
   }
}

let findGFReviews = (restaurantReviews, storeGFReviews) => {
   // Validate array
   if (!Array.isArray(restaurantReviews) || restaurantReviews.length == 0) {
      return false;
   }
   
   // Ensure array is cleared
   storeGFReviews.length = 0;

   restaurantReviews.forEach((review) => {
      if (mentionsGlutenFree(review.text.text)) { 
         storeGFReviews.push(review.text.text); 
      }
   });

   return storeGFReviews.length > 0;
}

let findGFNearby = async(placeData) => {
   // Validate places informnation format
   if (!Array.isArray(placeData.places) || placeData.places.length == 0) {
      return ;
   }

   placeData.places.forEach((restaurant) => {
      if (!restaurant) { return; }
      console.log(restaurant.displayName.text);
      // Wrap summary into object to be edited in functions
      let gfSummary = { "val" : "" };
      let gfReviews = [];
      
      if (findGFSummary(restaurant, gfSummary)) {
         console.log(gfSummary);
         // Send response with this info back to client
         
      } else if (findGFReviews(restaurant.reviews, gfReviews)) {
         console.log(gfReviews);
         // Send response with this info back to client

      } else {
         enqueueRestaurant(restaurant.id, restaurant.googleMapsUri);
         dispatchScraper();
         // getGFMenu(restaurant.id, restaurant.googleMapsUri)
         //    .then((response) => {console.log(response)})
         //    .catch((error) => {console.error(error); });
      }
   });

   

   return ;
}

getNearbyLocations("dummy");