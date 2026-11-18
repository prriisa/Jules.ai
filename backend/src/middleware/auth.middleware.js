import AppError from "../utils/AppError.js";
import { findUserById } from "../DAO/user.dao.js";
import { verifyAccessToken } from "../utils/jwt.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Authenticates a bearer token and attaches the corresponding user to the request.
 * @type {import("express").RequestHandler}
 */
const authMiddleware = asyncHandler(async (req, _res, next) => {
  const authorization = req.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    throw new AppError(401, "Authentication required");
  }

  const payload = verifyAccessToken(authorization.slice(7));
  if (typeof payload === "string" || typeof payload.id !== "string") {
    throw new AppError(401, "Invalid access token");
  }

  const user = await findUserById(payload.id);
  if (!user) throw new AppError(401, "Invalid access token");

  req.user = user;
  next();
});

export default authMiddleware;