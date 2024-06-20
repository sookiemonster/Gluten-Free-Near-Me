import {AdvancedMarker, Map, Marker, Pin } from '@vis.gl/react-google-maps';
import React from 'react'; 
import { useSelector } from 'react-redux'

// Define marker color-scheme
const markerScheme = {
   "3" : "#123811",
   "2" : "#903B0B",
   "1" : "#421102"
}

const tagScheme = {
   "3" : "green",
   "2" : "yellow",
   "1" : "brown"
}

function GFMarker({place}) {
   const markerColor = markerScheme[String(place.gfrank)];
   const tagColorClass = tagScheme[String(place.gfrank)];
   return (<Marker 
      key = {place.id}
      label={{ text: place.name,
         color: markerColor , 
         fontWeight: "500", 
         className: "pin-title " + tagColorClass, 
         path: ""}} 
      position={{lat: Number(place.lat), lng: Number(place.long)
      }} 
   />
   );
}

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
               <GFMarker place={place} />
            )}
         </Map>
      </div>
   );
}

export default MapContainer;