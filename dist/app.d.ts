import mongoose from "mongoose";
declare const app: import("express-serve-static-core").Express;
export declare function connectToDatabase(): Promise<typeof mongoose>;
export declare function disconnectFromDatabase(): Promise<void>;
export { app };
//# sourceMappingURL=app.d.ts.map