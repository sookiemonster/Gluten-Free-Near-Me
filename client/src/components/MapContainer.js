import {AdvancedMarker, Map, Marker, Pin } from '@vis.gl/react-google-maps';
import React from 'react'; 
import { useSelector } from 'react-redux'

// Define marker color-scheme
const markerStrokeScheme = {
   "3" : "#123811",
   "2" : "#903B0B",
   "1" : "#421102"
}

const markerFillScheme = {
   "3" : "#25A305",
   "2" : "#F6B409",
   "1" : "#631700"
}

function GFMarker({place}) {
   const markerStroke = markerStrokeScheme[String(place.gfrank)];
   const markerFill = markerFillScheme[String(place.gfrank)];

   const scrollToCard = () => {
      const restaurantCard = document.querySelector( '#card-' + place.id );
      restaurantCard.scrollIntoView( { behavior: 'smooth', block: 'start' } );
   }

   return (<Marker 
      key = {place.id}
      label={{ text: place.name,
         color: markerFill , 
         fontWeight: "500", 
         className: "pin-title", 
         path: ""}} 
      position={{lat: Number(place.lat), lng: Number(place.long) }} 
      icon= {
         {
            path: "M22.8,11.2c0.1,4.3-5.9,10-8,13.6c-2.4,4-2.4,4-3.4,7.7c-0.7-3.8-0.7-3.8-3.1-7.7C6.2,21.2,0,15.5,0,11.4C0,3.8,7.5-2.1,15.5,0.7C19.9,2.2,22.7,6.5,22.8,11.2z",
            fillColor: markerFill,
            fillOpacity: 1.0,
            strokeColor: markerStroke,
            strokeOpacity: 0.25,
            labelOrigin: {x: 16, y: 30}
         }
      }
      onClick={scrollToCard}
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