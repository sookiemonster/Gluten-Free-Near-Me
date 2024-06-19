import { configureStore } from '@reduxjs/toolkit'
import resReducer from './RestaurantSlice.js'

var store = configureStore({
  reducer: {
    restaurants: resReducer,
  }
});

export default store;