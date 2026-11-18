/**
 * Sends the standard success response envelope.
 * @param {import("express").Response} res - Express response.
 * @param {number} statusCode - HTTP status code.
 * @param {string} message - Human-readable success message.
 * @param {unknown} data - Response payload.
 * @returns {import("express").Response} The sent response.
 */
export const sendSuccess = (res, statusCode, message, data) =>
  res.status(statusCode).json({ success: true, message, data });