import { Router } from "express";
import {
  login,
  logout,
  me,
  refresh,
  register
} from "../controller/auth.controller.js";
import { loginValidator, registerValidator } from "../validators/auth.validator.js";
import validate from "../middleware/validate.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";
import asyncHandler from "../utils/asyncHandler.js";

const authRouter = Router();

/**
 * Registers a user account.
 * @name POST /register
 * @returns {void}
 */
authRouter.post("/register", registerValidator, validate, asyncHandler(register));

/**
 * Creates a user session.
 * @name POST /login
 * @returns {void}
 */
authRouter.post("/login", loginValidator, validate, asyncHandler(login));

/**
 * Rotates a refresh token stored in an httpOnly cookie.
 * @name POST /refresh
 * @returns {void}
 */
authRouter.post("/refresh", asyncHandler(refresh));

/**
 * Revokes the current refresh token and clears its cookie.
 * @name POST /logout
 * @returns {void}
 */
authRouter.post("/logout", asyncHandler(logout));

/**
 * Returns the current user's public profile.
 * @name GET /me
 * @returns {void}
 */
authRouter.get("/me", authMiddleware, asyncHandler(me));

export default authRouter;