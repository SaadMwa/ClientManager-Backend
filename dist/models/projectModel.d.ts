import mongoose, { Document } from "mongoose";
export interface IProject extends Document {
    userId: string;
    clientId: string;
    name: string;
    estimatedHours: number;
    agreedPrice: number;
    status: "active" | "completed";
    createdAt: Date;
    updatedAt: Date;
    completedAt: Date;
}
declare const _default: mongoose.Model<IProject, {}, {}, {}, mongoose.Document<unknown, {}, IProject, {}, mongoose.DefaultSchemaOptions> & IProject & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProject>;
export default _default;
//# sourceMappingURL=projectModel.d.ts.map