import { initMongoConnection } from "./db/initMongoConnection.js";
import { env } from "./config/env.js";
await initMongoConnection();
const { app } = await import("./server.js");
const server = app.listen(env.port, () => console.log(`Movie API: http://localhost:${env.port}`));
for (const signal of ["SIGINT", "SIGTERM"]) process.on(signal, () => server.close(async () => { await (await import("mongoose")).default.disconnect(); process.exit(0); }));
