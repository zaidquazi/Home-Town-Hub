import mongoose, { Schema, Document } from 'mongoose';

export interface ILike extends Document {
  user: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId;
  targetType: 'Post' | 'Comment';
  createdAt: Date;
  updatedAt: Date;
}

const LikeSchema = new Schema<ILike>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  targetId: { type: Schema.Types.ObjectId, required: true },
  targetType: { type: String, enum: ['Post', 'Comment'], required: true }
}, { timestamps: true });

LikeSchema.index({ user: 1, targetId: 1, targetType: 1 }, { unique: true });
LikeSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });

export const Like = mongoose.model<ILike>('Like', LikeSchema);
