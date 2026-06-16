import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunity extends Document {
  name: string;
  slug: string;
  description: string;
  location: {
    city: string;
    state?: string;
    country: string;
  };
  coverPhoto?: string;
  category: string;
  owner: mongoose.Types.ObjectId;
  moderators: mongoose.Types.ObjectId[];
  members: mongoose.Types.ObjectId[];
  pendingMembers: mongoose.Types.ObjectId[];
  isPrivate: boolean;
  memberCount: number;
  rules: { title: string; description: string }[];
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const CommunitySchema = new Schema<ICommunity>({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  slug: { type: String, required: true, unique: true, lowercase: true, index: true },
  description: { type: String, required: true, maxlength: 1000 },
  location: {
    city: { type: String, required: true },
    state: { type: String },
    country: { type: String, required: true },
  },
  coverPhoto: { type: String },
  category: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  moderators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  pendingMembers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isPrivate: { type: Boolean, default: false },
  memberCount: { type: Number, default: 1 },
  rules: [{
    title: { type: String, required: true },
    description: { type: String, required: true }
  }],
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

CommunitySchema.index({ name: 'text', description: 'text', category: 'text' });
CommunitySchema.index({ category: 1 });
CommunitySchema.index({ members: 1 });
CommunitySchema.index({ 'location.city': 1 });

export const Community = mongoose.model<ICommunity>('Community', CommunitySchema);
