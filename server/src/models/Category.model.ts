import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, trim: true, unique: true },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  description: { type: String, maxlength: 500 },
  icon: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export const Category = mongoose.model<ICategory>('Category', CategorySchema);
