import { configureStore } from "@reduxjs/toolkit"
import authReducer from "../features/auth/state/authSlice.js"
import conversationReducer from "../features/conversation/state/conversationSlice.js"

export const store = configureStore({
  reducer: {
    auth: authReducer,
    conversations: conversationReducer
  }
})
