import UserModel from "../models/user.model.js";

/**
 * Creates and persists a user.
 * @param {{ name: string, email: string, password: string }} userData - New user fields.
 * @returns {Promise<import("mongoose").Document>} The created user.
 */
export const createUser = async (userData) => UserModel.create(userData);

/**
 * Finds a user by normalized email and selects the password for credential checks.
 * @param {string} email - User email address.
 * @returns {Promise<import("mongoose").Document | null>} Matching user, if any.
 */
export const findUserByEmail = async (email) =>
  UserModel.findOne({ email }).select("+password");

/**
 * Finds a user by database identifier.
 * @param {string} id - User identifier.
 * @returns {Promise<import("mongoose").Document | null>} Matching user, if any.
 */
export const findUserById = async (id) => UserModel.findById(id);

/**
 * Finds a user and explicitly selects the persisted refresh token.
 * @param {string} id - User identifier.
 * @returns {Promise<import("mongoose").Document | null>} Matching user, if any.
 */
export const findUserByIdWithRefreshToken = async (id) =>
  UserModel.findById(id).select("+refreshToken");

/**
 * Replaces the persisted refresh token for a user.
 * @param {string} id - User identifier.
 * @param {string} refreshToken - New refresh token.
 * @returns {Promise<import("mongoose").Document | null>} Updated user, if any.
 */
export const updateRefreshToken = async (id, refreshToken) =>
  UserModel.findByIdAndUpdate(id, { refreshToken }, { new: true });

/**
 * Invalidates a user's persisted refresh token.
 * @param {string} id - User identifier.
 * @returns {Promise<import("mongoose").Document | null>} Updated user, if any.
 */
export const clearRefreshToken = async (id) =>
  UserModel.findByIdAndUpdate(id, { refreshToken: null }, { new: true });