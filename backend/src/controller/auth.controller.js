import jwt from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import {
  clearRefreshToken,
  createUser,
  findUserByEmail,
  findUserByIdWithRefreshToken,
  updateRefreshToken
} from "../DAO/user.dao.js";
import { config } from "../config/env.js";
import {
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken
} from "../utils/jwt.js";
import { sendSuccess } from "../utils/apiResponse.js";

const refreshCookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === "production",
  sameSite: "strict",
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/api/v1/auth"
};

/**
 * Converts a user document into the public account shape.
 * @param {import("mongoose").Document} user - User document.
 * @returns {{ id: string, name: string, email: string }} Safe user properties.
 */
const toPublicUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email
});

/**
 * Issues a token pair, persists the refresh token and sets the secure cookie.
 * @param {import("express").Response} res - Express response.
 * @param {import("mongoose").Document} user - Authenticated user.
 * @returns {Promise<{ accessToken: string, user: object }>} Access token and public user.
 */
const issueSession = async (res, user) => {
  const identity = { id: user._id.toString(), email: user.email };
  const accessToken = createAccessToken(identity);
  const refreshToken = createRefreshToken(identity);
  await updateRefreshToken(identity.id, refreshToken);
  res.cookie("refreshToken", refreshToken, refreshCookieOptions);
  return { accessToken, user: toPublicUser(user) };
};

/**
 * Registers a new user and starts an authenticated session.
 * @param {import("express").Request} req - Express request with validated fields.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>}
 */
export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const user = await createUser({ name, email, password });
  const data = await issueSession(res, user);
  sendSuccess(res, 201, "Account created successfully", data);
};

/**
 * Verifies credentials and starts an authenticated session.
 * @param {import("express").Request} req - Express request with validated fields.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {AppError} When credentials do not match an account.
 */
export const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await findUserByEmail(email);
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(401, "Invalid credentials");
  }

  const data = await issueSession(res, user);
  sendSuccess(res, 200, "Login successful", data);
};

/**
 * Validates and rotates the refresh token stored in the httpOnly cookie.
 * @param {import("express").Request} req - Express request containing the refresh cookie.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>}
 * @throws {AppError} When the refresh token is missing, invalid, or revoked.
 */
export const refresh = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw new AppError(401, "Invalid refresh token");

  const payload = verifyRefreshToken(token);
  if (typeof payload === "string" || typeof payload.id !== "string") {
    throw new AppError(401, "Invalid refresh token");
  }

  const user = await findUserByIdWithRefreshToken(payload.id);
  if (!user || user.refreshToken !== token) {
    throw new AppError(401, "Invalid refresh token");
  }

  const data = await issueSession(res, user);
  sendSuccess(res, 200, "Session refreshed", data);
};

/**
 * Revokes a matching persisted refresh token and clears the browser cookie.
 * @param {import("express").Request} req - Express request containing an optional cookie.
 * @param {import("express").Response} res - Express response.
 * @returns {Promise<void>}
 */
export const logout = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    const payload = jwt.decode(token);
    if (payload && typeof payload === "object" && typeof payload.id === "string") {
      const user = await findUserByIdWithRefreshToken(payload.id);
      if (user?.refreshToken === token) await clearRefreshToken(payload.id);
    }
  }

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: config.nodeEnv === "production",
    sameSite: "strict",
    path: "/api/v1/auth"
  });
  sendSuccess(res, 200, "Logout successful", {});
};

/**
 * Returns the currently authenticated user's public profile.
 * @param {import("express").Request} req - Authenticated Express request.
 * @param {import("express").Response} res - Express response.
 * @returns {void}
 */
export const me = (req, res) => {
  sendSuccess(res, 200, "Account retrieved", { user: toPublicUser(req.user) });
};