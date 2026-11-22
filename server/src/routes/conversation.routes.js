import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";
import { sendMessageValidator } from "../validators/conversation.validator.js";
import validate from "../middleware/validate.middleware.js";
import { deleteConversation, getAllConversation, getmessageByConversation, handleMessage } from "../controller/conversation.controller.js";

const router = Router()

router.post("/", authMiddleware, sendMessageValidator, validate, handleMessage)

router.get("/", authMiddleware, getAllConversation)

router.get("/messages/:conversationId", authMiddleware, getmessageByConversation)

router.delete("/delete/conversation/:conversationId", authMiddleware, deleteConversation)

export default router