// google-handler.js defines routines for retrieving nearby places & checking whether a response from the Google API mentions a restaurant being GF

import fetch from "node-fetch";
import * as fs from 'fs';

let getNearbyLocations = async(location_details) => {
   
   fs.readFile("sample_gf2.json", (err, data) => { 
      // Check for errors 
      if (err) throw err; 
   
      // Converting to JSON and start looking for GF availabilites
      findGFNearby(JSON.parse(data));
   }); 
}

let findGFNearby = async(data) => {
   console.log(data);
}

getNearbyLocations("dummy");