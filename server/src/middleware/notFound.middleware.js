import AppError from "../utils/AppError.js";

/**
 * Forwards unmatched routes to the centralized error handler.
 * @param {import("express").Request} _req - Express request.
 * @param {import("express").Response} _res - Express response.
 * @param {import("express").NextFunction} next - Express continuation.
 * @returns {void}
 */
const notFoundMiddleware = (_req, _res, next) => next(new AppError(404, "Route not found"));

export default notFoundMiddleware;