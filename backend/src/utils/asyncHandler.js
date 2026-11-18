/**
 * Forwards asynchronous route handler failures to Express error middleware.
 * @param {import("express").RequestHandler} handler - Route handler to wrap.
 * @returns {import("express").RequestHandler} Express-compatible guarded handler.
 */
const asyncHandler = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export default asyncHandler;