import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  items: [],
  activeId: null,
  loading: true,
  sending: false,
  error: null
}

const conversationSlice = createSlice({
  name: "conversations",
  initialState,
  reducers: {
    conversationsLoaded(state, action) {
      state.items = [...action.payload.items].sort((first, second) =>
        new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
      )
      state.activeId = action.payload.activeId ?? state.activeId
      if (!state.items.some((item) => item.id === state.activeId)) {
        state.activeId = state.items[0]?.id ?? null
      }
      state.loading = false
      state.error = null
    },
    conversationMessagesLoaded(state, action) {
      const conversation = state.items.find((item) => item.id === action.payload.id)
      if (conversation) {
        conversation.messages = action.payload.messages
        conversation.updatedAt = action.payload.updatedAt || conversation.updatedAt
      }
      state.loading = false
      state.error = null
    },
    conversationSending(state, action) {
      state.sending = action.payload
    },
    conversationDeleted(state, action) {
      state.items = state.items.filter((item) => item.id !== action.payload)
      if (state.activeId === action.payload) {
        state.activeId = state.items[0]?.id ?? null
      }
      state.error = null
    },
    conversationSelected(state, action) {
      state.activeId = action.payload
      state.error = null
    },
    conversationFailed(state, action) {
      state.loading = false
      state.error = action.payload
    },
    conversationErrorCleared(state) {
      state.error = null
    }
  }
})

export const {
  conversationsLoaded,
  conversationMessagesLoaded,
  conversationSelected,
  conversationFailed,
  conversationSending,
  conversationDeleted,
  conversationErrorCleared
} = conversationSlice.actions

export default conversationSlice.reducer
