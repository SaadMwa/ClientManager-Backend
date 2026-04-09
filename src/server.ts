import { app, connectToDatabase } from "./app.js";

// Database connection and server start
const Port = process.env.PORT || 5000;

// connectToDatabase()
//   .then(() => {
//     console.log("âœ… Connected to MongoDB");
//     app.listen(Port, () => {
//       console.log(`ðŸš€ Server is running on port ${Port}`);
//     });
//   })
//   .catch((err) => {
//     console.error("âŒ Failed to connect to MongoDB", err);
//   });
  export default app;
