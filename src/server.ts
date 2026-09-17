import { app, connectToDatabase, disconnectFromDatabase } from "./app.js";

const port = Number(process.env.PORT || 5000);

if (process.env.NODE_ENV !== "test") {
  connectToDatabase()
    .then(() => {
      app.listen(port, () => {
        console.log(`Backend running on port ${port}`);
      });
    })
    .catch((error) => {
      console.error("Failed to connect to MongoDB", error);
      process.exit(1);
    });
}

const shutdown = async () => {
  await disconnectFromDatabase().catch(() => undefined);
  process.exit(0);
};

process.once("SIGINT", () => {
  void shutdown();
});

process.once("SIGTERM", () => {
  void shutdown();
});

export default app;
