import mongoose, { Document, Schema } from "mongoose";



export interface IClient extends Document {
  userId: string;
  name: string;
  email: string;
  createdAt: Date;
}

const clientSchema = new Schema<IClient>({
  userId: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IClient>("Client", clientSchema);