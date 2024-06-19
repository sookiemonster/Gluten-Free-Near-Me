import {AdvancedMarker, Map, Marker, Pin } from '@vis.gl/react-google-maps';
import React, { useEffect } from 'react'; 
import { useSelector, useDispatch } from 'react-redux'
import { resAdded } from './RestaurantSlice';

function MapContainer() {
   let restaurants = useSelector((state) => state.restaurants.resList);
   console.log("state in component: ", restaurants);
   // const dispatch = useDispatch();

   // function addMarker() {
   //    const obj = {
   //       "name" : "addwd",
   //       id : "awdwd",
   //       lat : 40.7174,
   //       long : -73.985,
   //    };
   //    console.log('uh');
   //    setMarkerColleciton([...markerCollection, obj])
   // }

   console.log(<div id="map-container">
      <Map
      id="map"
      style={{width: '100%', height: '100%'}}
      defaultCenter={{lat: 40.7174, lng: -73.985}}
      defaultZoom={18}
      minZoom={17}
      maxZoom={20}
      disableDefaultUI={true}
      mapId={"beb67932d5e5a0ce"}>
         { restaurants.map((place, index) => 
            <Marker 
               key = {place.id}
               label={{ text:"awooga!",
                  color:'red', 
                  fontWeight: "500", 
                  className: "pin-title", 
                  path: ""}} 
               position={{lat: place.lat, lng: place.lng}} 
            />
         )}
         <div id="something"></div>
         {/* { restaurants.map((place) => console.log(place)) } */}
         {/* <AdvancedMarker position={{lat: 40.7174, lng: -73.985}} />
         <AdvancedMarker position={{lat: 40.7174, lng: -73.985}}>
            <Pin
               background={'#0f9d58'}
               borderColor={'#006425'}
               glyphColor={'#60d98f'}
            />
         </AdvancedMarker> */}
         {/* { markerCollection.map(markerData => (<Marker key={markerData.id} position={{lat: 40.7174, lng: -73.985}} />))} */}
         {/* { markerCollection.map(markerData => { console.log(markerData); } )} */}
      </Map>
   </div>)
   return (
      // <APIProvider apiKey={process.env.REACT_APP_API_KEY}>
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
            {/* { restaurants.map((place) => console.log(place)) } */}
            {/* <AdvancedMarker position={{lat: 40.7174, lng: -73.985}} />
            <AdvancedMarker position={{lat: 40.7174, lng: -73.985}}>
               <Pin
                  background={'#0f9d58'}
                  borderColor={'#006425'}
                  glyphColor={'#60d98f'}
               />
            </AdvancedMarker> */}
            {/* { markerCollection.map(markerData => (<Marker key={markerData.id} position={{lat: 40.7174, lng: -73.985}} />))} */}
            {/* { markerCollection.map(markerData => { console.log(markerData); } )} */}
         </Map>
      </div>
   );
}

export default MapContainer;