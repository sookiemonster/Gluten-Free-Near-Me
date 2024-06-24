import { createSlice } from '@reduxjs/toolkit'
import { getViewportBounds } from '../components/Finder';

// Define a set of constants to allow for listing restaurants just outside the viewport
const LAT_TOLERANCE = .001;
const LONG_TOLERANCE = .001;

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
      let updatedExpectations = new Set(state.expecting);

      // Only allow the restaurant to be rendered if it has GF options
      if (action.payload.gfrank > 0) { 
        updatedResList.push(action.payload);
      }
      updatedIdSet.add(action.payload.id);      
      updatedExpectations.delete(action.payload.id);

      if (updatedExpectations.size === 0 && state.mapObject) { 
        state.mapObject.setOptions({gestureHandling: "auto "})
      }

      // console.log("Restaurant being added: ", action.payload.id, action.payload.name);
      // console.log("Now we have: ", updatedIdSet);
      // console.log("Now we expect: ", updatedExpectations);

      return {
         ...state,
         idSet : updatedIdSet,
         resList: updatedResList, 
         expecting: updatedExpectations
      }
    },

    expect(state, action) {
      // If not the right action, or there is no restaurant id, or we already have the information (eg. from a previous scrape) don't modify the state
      if (action.type !== 'restaurants/expect' || !action.payload || action.payload === -1 || state.idSet.has(action.payload)) { return state; }

      let updatedExpectations = new Set(state.expecting);
      updatedExpectations.add(action.payload);
      console.log("Currently Expecting: ", updatedExpectations.size, "restaurants");

      return {
         ...state,
         expecting: updatedExpectations
      }
    },

    clearExpectations(state, action) {
      if (action.type !== 'restaurants/clearExpectations') { return state; }
      return {
        ...state, 
        expecting: new Set()
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

      const result = (viewportBounds.bottomLeft.lat - point.lat <= LAT_TOLERANCE && point.lat - viewportBounds.topRight.lat <= LAT_TOLERANCE) && 
        (viewportBounds.bottomLeft.long - point.long <= LONG_TOLERANCE && point.long - viewportBounds.topRight.long <= LONG_TOLERANCE);

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

export const { resAdded, restrictViewportMarkers, storeMap, expect, clearExpectations} = resSlice.actions
export default resSlice.reducer