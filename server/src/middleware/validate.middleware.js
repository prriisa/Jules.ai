import { validationResult } from "express-validator";
import AppError from "../utils/AppError.js";

/**
 * Rejects requests containing validation errors.
 * @param {import("express").Request} req - Express request.
 * @param {import("express").Response} _res - Express response.
 * @param {import("express").NextFunction} next - Express continuation.
 * @returns {void}
 * @throws {AppError} When one or more request fields are invalid.
 */
const validate = (req, _res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    const fieldErrors = result.array().map((error) => ({
      field: "path" in error ? error.path : "request",
      message: error.msg
    }));
    return next(new AppError(422, "Validation failed", fieldErrors));
  }

  next();
};

export default validate;