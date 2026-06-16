import mongoose, { Schema, Document } from 'mongoose';

export interface ITag extends Document {
  name: string;
  slug: string;
  category?: mongoose.Types.ObjectId;
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TagSchema = new Schema<ITag>({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, required: true, lowercase: true, unique: true, index: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category' },
  usageCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

TagSchema.index({ name: 'text' });

export const Tag = mongoose.model<ITag>('Tag', TagSchema);
