import { configureStore } from '@reduxjs/toolkit'
import resReducer, { resAdded } from './RestaurantSlice.js'

var store = configureStore({
    reducer: {
      restaurants: resReducer,
    }
  });


console.log(store.getState().restaurants);
store.dispatch(resAdded({
  id: "aa",
  name: "test1!",
  lat: 40.7174, 
  lng: -73.985
}))
store.dispatch(resAdded({
  id: "aba",
  name: "test2",
  lat: 40.717, 
  lng: -73.985
}))
store.dispatch(resAdded({
  id: "aca",
  name: "test3",
  lat: 40.7168, 
  lng: -73.985
}))
store.dispatch(resAdded({
  id: "a3a",
  name: "test4",
  lat: 40.7169, 
  lng: -73.985
}))
console.log(store.getState().restaurants);

export default store;