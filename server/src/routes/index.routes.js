import { Router } from "express";
import authRouter from "./auth.routes.js";
import conversationRouter from "./conversation.routes.js"


const apiRouter = Router();
apiRouter.use("/auth", authRouter);
apiRouter.use("/conversation", conversationRouter)

export default apiRouter;