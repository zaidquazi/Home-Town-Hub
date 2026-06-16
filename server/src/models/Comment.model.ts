import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  post: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
  content: { type: String, required: true, maxlength: 1000 },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
}, { timestamps: true });

CommentSchema.index({ post: 1, createdAt: -1 });

export const Comment = mongoose.model<IComment>('Comment', CommentSchema);
