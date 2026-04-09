import { app, connectToDatabase } from "../src/app.js";

export default async function handler(req: any, res: any) {
  await connectToDatabase();
  return app(req, res);
}

export { app };
