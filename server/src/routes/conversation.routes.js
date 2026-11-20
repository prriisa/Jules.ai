import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { sendMessageValidator } from "../validators/conversation.validator.js";
import validate from "../middleware/validate.middleware.js";
import { handleMessage } from "../controller/conversation.controller.js";

const router = Router()

router.post("/", authMiddleware, sendMessageValidator, validate, handleMessage)

export default router