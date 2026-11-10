import watchlistRouter from "./routers/watchlist.js";
import supportRouter from "./routers/support.js";
import { csrf, issueCsrf } from "./middlewares/csrf.js";
import { avatarDirectory } from "./services/files.js";
import cors from "cors";
import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import MongoStore from "connect-mongo";
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
import authRouter from "./routers/auth.js";
import usersRouter from "./routers/users.js";
import adminRouter from "./routers/admin.js";

export const app = express();
app.set("trust proxy", env.trustProxy);

app.use(requestLogger);
app.use(helmet());

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
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

// Bölüm 19–20: Oturum kaydı MongoDB'de tutulur.
const isProduction = env.nodeEnv === "production";
app.use(session({
  name: isProduction ? "__Host-sid" : "sid",
  secret: env.sessionSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ client: (await import("mongoose")).default.connection.getClient() }),
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: 1000 * 60 * 60 * 8,
  },
}));

app.use(cookieParser());
app.get("/auth/csrf", issueCsrf);
app.use(csrf);
app.use("/uploads/avatars", express.static(avatarDirectory));
app.use("/movies", moviesRouter);
app.use("/watchlist", watchlistRouter);
app.use("/support", supportRouter);



app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/admin", adminRouter);

app.use((req, res) => res.status(404).json({ message: "Yol bulunamadı." }));
app.use(errorHandler);
