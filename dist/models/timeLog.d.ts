import mongoose, { Document } from "mongoose";
export interface ITimeLog extends Document {
    userId: string;
    projectId: string;
    hoursWorked: number;
    description?: string;
    date: Date;
    createdAt: Date;
}
declare const _default: mongoose.Model<ITimeLog, {}, {}, {}, mongoose.Document<unknown, {}, ITimeLog, {}, mongoose.DefaultSchemaOptions> & ITimeLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, ITimeLog>;
export default _default;
//# sourceMappingURL=timeLog.d.ts.map