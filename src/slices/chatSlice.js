import { createSlice } from "@reduxjs/toolkit"; 

const chatSlice = createSlice({
  name: 'chats',
  initialState: {
    chats: [],
    loading: false,
    error: null,
  },
  reducers: {
    setChats: (state, action) => {
      state.chats = action.payload;
    }
  },
});

export const { setChats } = chatSlice.actions;
export default chatSlice.reducer;