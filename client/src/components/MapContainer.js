import { useMap, Map, MapControl, ControlPosition, Marker, useApiIsLoaded } from '@vis.gl/react-google-maps';
import store from '../redux/Store.js';
import { restrictViewportMarkers, markIncomplete, storeMap } from '../redux/RestaurantSlice.js';
import React, { useEffect, useState } from 'react'; 
import { useSelector } from 'react-redux';
import AutocompleteSearch from './AutocompleteSearch.js';
import Finder from './Finder.js';

// Define marker color-scheme
const markerStrokeScheme = {
   "3" : "#123811",
   "2" : "#903B0B",
   "1" : "#421102"
}

const markerFillScheme = {
   "3" : "#25A305",
   "2" : "#f69709",
   "1" : "#611D00"
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
            anchor: {x : 14, y: 30},
            labelOrigin: {x: 14, y: -10}
         }
      }
      onClick={scrollToCard}
   />
   );
}

function MapHandler({place}) {
   // Get reference to the underlying Google maps object
   const map = useMap('map');
   const apiIsLoaded = useApiIsLoaded();

   useEffect(() => {
      if (!apiIsLoaded) { return; }
      store.dispatch( storeMap({ 'map' : map }) );
   }, [apiIsLoaded, map]);

   useEffect(() => {
         if (!map || !place) return;

         // Pan to the lat / long location of the selected place
         if (place.geometry?.location) {
            map.panTo(place.geometry?.location);
            store.dispatch(markIncomplete());
         }
   }, [map, place]);

   useEffect(() => {
      console.log(map);
      if (!map) return;

      map.addListener('idle', () => {
         store.dispatch(restrictViewportMarkers());
         store.dispatch(markIncomplete());
      });
   }, [map]);

  return null;
}

function MapContainer() {
   const [selectedPlace, setSelectedPlace] = useState(null);
   const [overlay, setOverlay] = useState(null);

   let restaurants = useSelector((state) => state.restaurants.renderedRestaurants);
   let stillExpecting = useSelector((state) => state.restaurants.expecting);
   
   useEffect(() => {
      if (stillExpecting.size > 0) {
         setOverlay(<div id='pending-overlay'></div>);
      } else {
         setOverlay(null);
      }
   }, [stillExpecting]);

   return (
      <div id="map-container">
         { overlay }
         <Map
            id="map"
            style={{width: '100%', height: '100%'}}
            defaultCenter={{lat: 40.7174, lng: -73.985}}
            defaultZoom={18}
            minZoom={17}
            maxZoom={20}
            disableDefaultUI={true}
            mapId={"e46937705745938a"}>
            <MapControl position={ControlPosition.TOP_CENTER}>
               <AutocompleteSearch onPlaceSelect={setSelectedPlace} />
            </MapControl>
            <MapControl position={ControlPosition.BOTTOM_CENTER}>
               <Finder />
            </MapControl>
            { restaurants.map((place) => 
               <GFMarker place={place} />
            )}
         </Map>
         <MapHandler place={selectedPlace}></MapHandler>
      </div>
   );
}

export default MapContainer;