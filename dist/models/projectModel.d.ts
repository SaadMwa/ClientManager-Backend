import mongoose, { Document, Types } from "mongoose";
export interface IProject extends Document {
    userId: string;
    clientId: Types.ObjectId;
    name: string;
    estimatedHours: number;
    agreedPrice: number;
    status: "active" | "completed";
    deadline?: Date | null;
    createdAt: Date;
    updatedAt: Date;
    completedAt?: Date | null;
}
declare const _default: mongoose.Model<IProject, {}, {}, {}, mongoose.Document<unknown, {}, IProject, {}, mongoose.DefaultSchemaOptions> & IProject & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProject>;
export default _default;
//# sourceMappingURL=projectModel.d.ts.map