import { createSlice } from '@reduxjs/toolkit'
import { getViewportBounds } from '../components/Finder';

var CenterPoint = function(coordinates) {
  this.lat = Number(coordinates.lat());
  this.long = Number(coordinates.lng());

  this.quadranceToPlace = (place) => {
    let latDiff = this.lat - Number(place.lat);
    let lngDiff = this.lng - Number(place.long);
    
    return (latDiff * latDiff) + (lngDiff * lngDiff);
  }

  this.compare = (placeA, placeB) => {
    console.log("place a",placeA)
    console.log("place b",placeB)
    return this.quadranceToPlace(placeA) < this.quadranceToPlace(placeB);
  }
}

const resSlice = createSlice({
  name: 'restaurants',
  initialState: { resList: [], renderedRestaurants: [], idSet: new Set(), expecting: new Set(), mapObject: null },
  reducers: {
    storeMap(state, action) {
      // If not the right action / no map object provided don't modify the state
      if (action.type !== 'restaurants/storeMap' || !action.payload.map) { return state; }
    
      return {
        ...state,
        mapObject: action.payload.map
      }
    }, 

    resAdded(state, action) {
      // If not the right action, or we have already tracked this restaurant, don't modify the state
      if (action.type !== 'restaurants/resAdded' || state.idSet.has(action.payload.id)) { return state; }

      // Create copies to maintain immutability
      let updatedResList = state.resList.slice();
      let updatedIdSet = new Set(state.idSet);

      updatedResList.push(action.payload);
      updatedIdSet.add(action.payload.id);      

      return {
         ...state,
         idSet : updatedIdSet,
         resList: updatedResList, 
      }
    },

    receive(state, action) { 
      console.log('performing receive', action);
      if (action.type !== 'restaurants/receive' || !action.payload) { return state; }

      let updatedExpectations = new Set(state.expecting);
      updatedExpectations.delete(action.payload);
      console.log("waiting on", updatedExpectations.size, "restaurants: ", updatedExpectations);

      return {
         ...state,
         expecting: updatedExpectations
      }
    },

    expect(state, action) {
      // If not the right action, or there is no restaurant id, don't modify the state
      if (action.type !== 'restaurants/expect' || !action.payload || action.payload === -1) { return state; }

      let updatedExpectations = new Set(state.expecting);
      updatedExpectations.add(action.payload);
      console.log("waiting on", updatedExpectations.size, "restaurants");

      return {
         ...state,
         expecting: updatedExpectations
      }
    },

    /**
     * WIP. DO NOT USE. 
     * @param state Redux state
     * @param action An action whose payload is in the form { lat: <NUMBER>, lng: <NUMBER> }
     * @returns An updated state
     */
  //   resSort(state, action) {
  //     if (action.type !== 'restaurants/resSort') { return state; }
      
  //     // Create a new centerpoint
  //     let newCenter = new CenterPoint(action.payload);
  //     console.log(newCenter);

  //     // Create copies to maintain immutability
  //     let updatedResList = state.resList.slice();
  //     updatedResList.sort( newCenter.compare );

  //     console.log(updatedResList);
  //     for (let obj of updatedResList) {
  //       console.log(obj);
  //     }

  //     // console.log('adding restaurant:');
  //     // console.log(action.payload);
  //     return {
  //       ...state,
  //       resList: updatedResList
  //     }
  //   }
  // },

  /**
   * Filters markers so that only those in the viewport are rendered
   * @param state Redux state
   * @param action An action with no particular format
   * 
   * @returns A new state in which renderedRestaurants contains only restaurants displayable within the viewport
   */
  restrictViewportMarkers(state, action) {
    if (action.type !== 'restaurants/restrictViewportMarkers' || !state.mapObject) { return state; }
    
    let isInViewport = (viewportBounds, point) => {
      if (!viewportBounds) { return false; }

      const result = (viewportBounds.bottomLeft.lat <= point.lat && point.lat <= viewportBounds.topRight.lat) && 
        (viewportBounds.bottomLeft.long <= point.long && point.long <= viewportBounds.topRight.long);

      return result;
    }

    const updatedRenderList = state.resList.filter((place) => isInViewport(getViewportBounds(state.mapObject), place));
    // console.log(JSON.parse(JSON.stringify(state.resList)));
    // console.log(JSON.parse(JSON.stringify(updatedRenderList)));

    return {
      ...state, 
      renderedRestaurants: updatedRenderList
    }
  },
  
}
})

export const { resAdded, restrictViewportMarkers, storeMap, expect, receive} = resSlice.actions
export default resSlice.reducer