import { map } from './map.js';

let viewportBounds;

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
   const options = {
      method: "Post", 
      headers: { "Content-Type" : "application/json"},
      body: JSON.stringify(viewportBounds)
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
 if (!viewport) { return false; }
 return isBetween(placeLat, viewportBounds.bottomLeft.lat, viewportBounds.topRight.lat) && isBetween(placeLong, viewportBounds.bottomLeft.long, viewportBounds.topRight.long);
}

document.getElementById("finder").addEventListener('click', findNearby);

export { isInViewport };