import { createSlice } from '@reduxjs/toolkit'

const resSlice = createSlice({
  name: 'restaurants',
  initialState: { resList: [], idSet: new Set() },
  reducers: {
    resAdded(state, action) {
       console.log('reducing');
       console.log(action.payload);
       console.log(state.idSet);
      // If not the right action, or we have already tracked this restaurant, don't modify the state
      if (action.type !== 'restaurants/resAdded' || state.idSet.has(action.payload.id)) { return state; }

      // Create copies to maintain immutability
      let updatedResList = state.resList.slice();
      let updatedIdSet = new Set(state.idSet);

      updatedResList.push(action.payload);
      updatedIdSet.add(action.payload.id);

      console.log('adding restaurant:');
      console.log(action.payload);
      // Otherwise continue
      return {
         resList: updatedResList, 
         idSet: updatedIdSet
      }
    }
  }
})

export const { resAdded } = resSlice.actions
export default resSlice.reducer