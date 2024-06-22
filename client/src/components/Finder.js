import React, { useEffect, useState } from 'react'; 
import { useMap } from '@vis.gl/react-google-maps';
import { Grid } from 'react-loader-spinner';

import { useSelector } from 'react-redux';
import store from '../redux/Store';
import { expect } from '../redux/RestaurantSlice';

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
   if (!map) { return; }

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
      .then((batchJSON) => {
            batchJSON.forEach((batch) => {
               console.log("expecting", batch);
               batch.forEach(place => {store.dispatch(expect(place))})
            });
         }
      )
      .catch((error) => console.error("An error has occurred: " + error));
}

function Finder() {
   // Get the underlying Google Maps Object of the restaurant map
   const map = useMap("map");
   let stillExpecting = useSelector((state) => state.restaurants.expecting); 
   const [waitingObject, setWaitingObject] = useState("");
   
   useEffect(() => {
      if (stillExpecting.size === 0) {
         setWaitingObject("");
      } else {
         setWaitingObject(
            <Grid
            visible={true}
            height="18"
            width="18"
            color="#FFFFFF"
            ariaLabel="grid-loading"
            radius="10"
            wrapperStyle={{}}
            wrapperClass="grid-wrapper"/>
         );
      }
   }, [stillExpecting])

   return (
      <button id="search-button" onClick={() => findNearby(map)}>{waitingObject}Search Here{waitingObject}</button>
   );
}

export default Finder;
export { findNearby, getViewportBounds }