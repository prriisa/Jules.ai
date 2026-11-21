import express from "express";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { config } from "./config/env.js";
import apiRouter from "./routes/index.routes.js";
import notFoundMiddleware from "./middleware/notFound.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(config.nodeEnv === "production" ? "combined" : "dev"));
app.use("/api/v1", apiRouter);
app.use("/", (req, res) => {
    res.send("server working")
})
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;