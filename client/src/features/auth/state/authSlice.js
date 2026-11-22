import { createSlice } from "@reduxjs/toolkit"

const initialState = {
  user: null,
  accessToken: null,
  status: "loading",
  error: null
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sessionStarted(state, action) {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.status = "authenticated"
      state.error = null
    },
    sessionEnded(state) {
      state.user = null
      state.accessToken = null
      state.status = "unauthenticated"
      state.error = null
    },
    authFailed(state, action) {
      state.error = action.payload
    },
    clearAuthError(state) {
      state.error = null
    },
    sessionLoading(state) {
      state.status = "loading"
      state.error = null
    }
  }
})

export const {
  sessionStarted,
  sessionEnded,
  authFailed,
  clearAuthError,
  sessionLoading
} = authSlice.actions

export default authSlice.reducer
