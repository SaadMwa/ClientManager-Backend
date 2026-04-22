import mongoose, { Document } from "mongoose";
export interface IClient extends Document {
    userId: string;
    name: string;
    email: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IClient, {}, {}, {}, mongoose.Document<unknown, {}, IClient, {}, mongoose.DefaultSchemaOptions> & IClient & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IClient>;
export default _default;
//# sourceMappingURL=clientModel.d.ts.map