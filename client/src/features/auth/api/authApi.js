import axios from "axios";

const http = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
});

const authPath = "/auth";

/**
 * Submits login credentials and returns the session data.
 * @param {{ email: string, password: string }} credentials - User credentials.
 * @returns {Promise<{ accessToken: string, user: object }>} Authenticated session.
 */
export const loginRequest = async (credentials) =>
  (await http.post(`${authPath}/login`, credentials)).data.data;

/**
 * Creates an account and returns its authenticated session.
 * @param {{ name: string, email: string, password: string }} details - Registration fields.
 * @returns {Promise<{ accessToken: string, user: object }>} Authenticated session.
 */
export const registerRequest = async (details) =>
  (await http.post(`${authPath}/register`, details)).data.data;

/**
 * Rotates the current refresh cookie.
 * @returns {Promise<{ accessToken: string, user: object }>} Refreshed session.
 */
export const refreshRequest = async () =>
  (await http.post(`${authPath}/refresh`)).data.data;

/**
 * Loads the current user's public profile.
 * @param {string} accessToken - Bearer access token.
 * @returns {Promise<object>} Public user.
 */
export const meRequest = async (accessToken) =>
  (await http.get(`${authPath}/me`, {
    headers: { Authorization: `Bearer ${accessToken}` }
  })).data.data.user;

/**
 * Clears the server-side refresh token and browser cookie.
 * @returns {Promise<void>} Resolves when logout is complete.
 */
export const logoutRequest = async () => {
  await http.post(`${authPath}/logout`);
};

/**
 * Extracts a standard API error message for the UI.
 * @param {unknown} error - Axios or request error.
 * @returns {string} User-safe error message.
 */
export const getAuthError = (error) => {
  if (axios.isAxiosError(error)) {
    const fieldMessage = error.response?.data?.errors?.[0]?.message;
    return fieldMessage || error.response?.data?.message || "Something went wrong. Please try again.";
  }
  return "Something went wrong. Please try again.";
};
