import cors from "cors";
import express from "express";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env.js";
import {
  openApiDocument,
} from "./docs/openapi.js";
import { errorHandler }
  from "./middlewares/errorHandler.js";
import { apiRateLimiter }
  from "./middlewares/rateLimiter.js";
import { requestLogger }
  from "./middlewares/requestLogger.js";
import moviesRouter from "./routers/movies.js";

export const app = express();

app.use(requestLogger);
app.use(helmet());

app.use(
  cors({
    origin: env.corsOrigin,
  }),
);

app.get("/health", (req, res) => {
  return res.status(200).json({
    status: "ok",
  });
});

app.use(apiRateLimiter);
app.use(express.json());

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument),
);

app.get("/", (req, res) => {
  res.send("Merhaba Express!");
});

app.use("/movies", moviesRouter);

app.use(errorHandler);
