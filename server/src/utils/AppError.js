/**
 * Represents an expected HTTP error handled by the centralized middleware.
 */
export default class AppError extends Error {
  /**
   * @param {number} statusCode - HTTP status code.
   * @param {string} message - Safe message for the client.
   * @param {Array<{ field: string, message: string }>} errors - Optional field errors.
   */
  constructor(statusCode, message, errors = []) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }
}