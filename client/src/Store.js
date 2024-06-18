import { configureStore } from '@reduxjs/toolkit'
import resReducer, { resAdded } from './RestaurantSlice.js'

var store = configureStore({
    reducer: {
      restaurants: resReducer,
    }
  });


console.log(store.getState().restaurants);
store.dispatch(resAdded(20))
console.log(store.getState().restaurants);

export default store;