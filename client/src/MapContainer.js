import {APIProvider, Map, Marker } from '@vis.gl/react-google-maps';
import React, { useState } from 'react'; 

function MapContainer() {
   const [markerCollection , setMarkerColleciton] = useState([]);

   function addMarker({name, id, lat, long}) {
      const updatedCollection = markerCollection.slice();
      updatedCollection.push({
         "name" : name,
         "id" : id,
         "lat" : lat,
         "long" : long,
      });
   }

   return (
      <APIProvider apiKey={process.env.REACT_APP_API_KEY}>
         <div id="map-container">
            <Map
            id="map"
            style={{width: '100%', height: '100'}}
            defaultCenter={{lat: 40.7174, lng: -73.985}}
            defaultZoom={18}
            minZoom={17}
            maxZoom={20}
            mapId={"map-id"}>
               <Marker position={{lat: 40.7174, lng: -73.985}} />
               <Marker position={{lat: 40.7104, lng: -73.985}} />
            </Map>
         </div>
      </APIProvider>
   );
}

export default MapContainer;