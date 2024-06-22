import { configureStore } from '@reduxjs/toolkit'

import resReducer from './RestaurantSlice.js'

var store = configureStore({
  reducer: {
    restaurants: resReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these paths in the state
        ignoredPaths: ['restaurants'],
        ignoredActions: ['restaurants/storeMap']
      },
    }),
});

export default store;