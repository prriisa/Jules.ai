import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

/**
 * Creates the short-lived bearer access token.
 * @param {{ id: string, email: string }} user - Public identity claims.
 * @returns {string} Signed access token.
 */
export const createAccessToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, config.accessTokenSecret, {
    expiresIn: "15m"
  });

/**
 * Creates the longer-lived refresh token.
 * @param {{ id: string, email: string }} user - Public identity claims.
 * @returns {string} Signed refresh token.
 */
export const createRefreshToken = (user) =>
  jwt.sign({ id: user.id, email: user.email }, config.refreshTokenSecret, {
    expiresIn: "7d"
  });

/**
 * Verifies an access token.
 * @param {string} token - Bearer token to verify.
 * @returns {string | jwt.JwtPayload} Verified token payload.
 * @throws {jwt.JsonWebTokenError} When verification fails.
 */
export const verifyAccessToken = (token) =>
  jwt.verify(token, config.accessTokenSecret);

/**
 * Verifies a refresh token.
 * @param {string} token - Cookie token to verify.
 * @returns {string | jwt.JwtPayload} Verified token payload.
 * @throws {jwt.JsonWebTokenError} When verification fails.
 */
export const verifyRefreshToken = (token) =>
  jwt.verify(token, config.refreshTokenSecret);