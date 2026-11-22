import { useCallback, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  getAuthError,
  loginRequest,
  logoutRequest,
  meRequest,
  refreshRequest,
  registerRequest
} from "../api/authApi.js"
import {
  authFailed,
  clearAuthError,
  sessionEnded,
  sessionLoading,
  sessionStarted
} from "../state/authSlice.js"

/**
 * Provides auth state and session operations for auth UI.
 * @returns {object} Auth state, actions, and session operations.
 */
export const useAuth = () => {
  const dispatch = useDispatch()
  const auth = useSelector((state) => state.auth)
  const sessionRestoreStarted = useRef(false)

  const startSession = useCallback(async (request) => {
    dispatch(sessionLoading())
    try {
      const session = await request()
      dispatch(sessionStarted(session))
      return session
    } catch (error) {
      const message = getAuthError(error)
      dispatch(sessionEnded())
      dispatch(authFailed(message))
      throw new Error(message)
    }
  }, [dispatch])

  const login = useCallback(
    (credentials) => startSession(() => loginRequest(credentials)),
    [startSession]
  )

  const register = useCallback(
    (details) => startSession(() => registerRequest(details)),
    [startSession]
  )

  const restoreSession = useCallback(async () => {
    if (sessionRestoreStarted.current) return
    sessionRestoreStarted.current = true
    dispatch(sessionLoading())
    try {
      const session = await refreshRequest()
      dispatch(sessionStarted(session))
    } catch (error) {
      dispatch(sessionEnded())
      if (!error.response || error.response.status >= 500) {
        dispatch(authFailed(getAuthError(error)))
      }
    }
  }, [dispatch])

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
      dispatch(sessionEnded())
    } catch (error) {
      dispatch(sessionEnded())
      const message = getAuthError(error)
      dispatch(authFailed(message))
      throw new Error(message)
    }
  }, [dispatch])

  const clearError = useCallback(() => dispatch(clearAuthError()), [dispatch])

  return {
    ...auth,
    login,
    register,
    logout,
    restoreSession,
    clearError
  }
}
