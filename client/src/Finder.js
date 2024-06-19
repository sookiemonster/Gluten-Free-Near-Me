import React, { useEffect } from 'react'; 
import { useMap } from '@vis.gl/react-google-maps';

let viewportBounds;

// Define offset to cast multiple nearby searches
const offset = 0.004;
const maxSearches = 3;

let getSearchPoints = (viewportBounds) => { 
   // Create an array of centers offset sequentially
   let result = [...Array(maxSearches).keys()];
   return result.map((i) => 
      ({ 
         lat : (viewportBounds.bottomLeft.lat + viewportBounds.topRight.lat) / 2, 
         long : viewportBounds.bottomLeft.long + (i * offset)
      })
   );
}

let getViewportBounds = (map) => {   
   return {
      bottomLeft : {
         lat: map.getBounds().getSouthWest().lat(),
         long: map.getBounds().getSouthWest().lng()
      },
      topRight : {
         lat: map.getBounds().getNorthEast().lat(),
         long: map.getBounds().getNorthEast().lng()
      }
   };
}

let findNearby = (map) => {
   if (!map) {return;}

   console.log("click!");
   let data = {};
   data.viewportBounds = getViewportBounds(map);
   data.searchFoci = getSearchPoints(data.viewportBounds);

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

function Finder() {
   const map = useMap("map");
   console.log(map);
   

   // useEffect(() => {
   //    if (!map) { return; }
   //    viewportBounds = map.getBounds();
   // }, [map])

   return (
      // <button onClick={console.log(getSearchPoints(getViewportBounds(map)))}>Test!</button>
      <button onClick={() => findNearby(map)}>Test!</button>
   );
}

export default Finder;