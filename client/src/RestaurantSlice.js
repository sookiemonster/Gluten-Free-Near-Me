import { createSlice } from '@reduxjs/toolkit'

console.log('a')

const resSlice = createSlice({
  name: 'restaurants',
  initialState: { resList: [] },
  reducers: {
    resAdded(state, action) {
       console.log('reducing');
       console.log(action.payload);
      // If not the right action, return
      if (action.type !== 'restaurants/resAdded') { return state; }
      let copyResList = state.resList.slice();
      copyResList.push(1);
      console.log()
      // Otherwise continue
      return {
         resList: copyResList
      }
    }
  }
})

export const { resAdded } = resSlice.actions
export default resSlice.reducer