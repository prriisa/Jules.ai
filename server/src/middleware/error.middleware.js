import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

/**
 * Converts application and persistence errors into the standard failure envelope.
 * @param {Error} error - Error forwarded by a route or middleware.
 * @param {import("express").Request} _req - Express request.
 * @param {import("express").Response} res - Express response.
 * @param {import("express").NextFunction} _next - Express continuation.
 * @returns {void}
 */
const errorMiddleware = (error, _req, res, _next) => {
  let statusCode = 500;
  let message = "Internal server error";
  let errors = [];

  if (error?.name === "AppError") {
    statusCode = error.statusCode;
    message = error.message;
    errors = error.errors;
  } else if (error?.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0] || "email";
    message = "An account with this information already exists";
    errors = [{ field, message: "This value is already in use" }];
  } else if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid request";
    errors = [{ field: error.path, message: "Invalid value" }];
  } else if (
    error instanceof jwt.JsonWebTokenError ||
    error instanceof jwt.TokenExpiredError
  ) {
    statusCode = 401;
    message = "Invalid or expired token";
  } else {
    console.error(error);
  }

  const response = { success: false, message, errors };
  if (config.nodeEnv !== "production") response.stack = error?.stack;
  res.status(statusCode).json(response);
};

export default errorMiddleware;