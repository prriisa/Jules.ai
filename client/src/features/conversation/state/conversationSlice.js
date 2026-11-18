import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
  activeId: null,
  loading: true,
  error: null
};

const conversationSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    conversationsLoaded(state, action) {
      state.items = action.payload.items;
      state.activeId = action.payload.activeId ?? state.activeId;
      if (!state.items.some((item) => item.id === state.activeId)) {
        state.activeId = state.items[0]?.id ?? null;
      }
      state.loading = false;
      state.error = null;
    },
    conversationSelected(state, action) {
      state.activeId = action.payload;
      state.error = null;
    },
    conversationFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    conversationErrorCleared(state) {
      state.error = null;
    }
  }
});

export const {
  conversationsLoaded,
  conversationSelected,
  conversationFailed,
  conversationErrorCleared
} = conversationSlice.actions;

export default conversationSlice.reducer;
