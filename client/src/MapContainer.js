import {AdvancedMarker, Map, Marker, Pin } from '@vis.gl/react-google-maps';
import React from 'react'; 
import { useSelector } from 'react-redux'

function MapContainer() {
   let restaurants = useSelector((state) => state.restaurants.resList);
   console.log("state in component: ", restaurants);
   return (
      <div id="map-container">
         <Map
         id="map"
         style={{width: '100%', height: '100%'}}
         defaultCenter={{lat: 40.7174, lng: -73.985}}
         defaultZoom={18}
         minZoom={17}
         maxZoom={20}
         disableDefaultUI={true}
         mapId={"beb67932d5e5a0ce"}>
            { restaurants.map((place) => 
               <Marker 
                  key = {place.id}
                  label={{ text: place.name,
                     color:'red', 
                     fontWeight: "500", 
                     className: "pin-title", 
                     path: ""}} 
                  position={{lat: Number(place.lat), lng: Number(place.lng)}} 
               />
            )}
         </Map>
      </div>
   );
}

export default MapContainer;