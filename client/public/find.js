import { marker, map } from './map.js';

let viewportBounds;

// Define offset to cast multiple nearby searches
const offset = 0.004;
const maxSearches = 3;

let getViewportSearches = () => { 
   if (!viewportBounds) { return; }

   // Create an array of centers offset sequentially
   let result = [...Array(maxSearches).keys()];
   return result.map((i) => 
      ({ 
         lat : (viewportBounds.bottomLeft.lat + viewportBounds.topRight.lat) / 2, 
         long : viewportBounds.bottomLeft.long + (i * offset)
      })
   );
}

let findNearby = () => {
   if (!map) { return; }

   // console.log(lat0, lng0, lat1, lng1);
   
   console.log("click!");
   viewportBounds = {
      bottomLeft : {
         lat: map.getBounds().getSouthWest().lat(),
         long: map.getBounds().getSouthWest().lng()
      },
      topRight : {
         lat: map.getBounds().getNorthEast().lat(),
         long: map.getBounds().getNorthEast().lng()
      }
   }
   
   let data = {};
   data.searchFoci = getViewportSearches();
   data.viewportBounds = viewportBounds;

   const options = {
      method: "Post", 
      headers: { "Content-Type" : "application/json"},
      body: JSON.stringify(data)
   }

   // Now the API will emit locations within this region. 
   fetch("https://localhost:5000/api/find-nearby", options)
      .then((response) => { return response.json() })
      .then((resJson) => console.log(resJson))
      .catch((error) => console.error("An error has occurred: " + error));
}

let isBetween = (target, min, max) => {
   return min <= target && target <= max;
}

let isInViewport = (placeLat, placeLong) => {
 // We have no viewport to get the bounds of
 if (!viewportBounds) { return false; }
 return isBetween(placeLat, viewportBounds.bottomLeft.lat, viewportBounds.topRight.lat) && isBetween(placeLong, viewportBounds.bottomLeft.long, viewportBounds.topRight.long);
}

document.getElementById("finder").addEventListener('click', findNearby);

export { isInViewport };