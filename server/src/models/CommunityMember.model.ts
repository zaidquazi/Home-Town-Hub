import mongoose, { Schema, Document } from 'mongoose';

export interface ICommunityMember extends Document {
  user: mongoose.Types.ObjectId;
  community: mongoose.Types.ObjectId;
  role: 'member' | 'moderator' | 'admin';
  status: 'pending' | 'approved' | 'rejected' | 'blocked';
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityMemberSchema = new Schema<ICommunityMember>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  community: { type: Schema.Types.ObjectId, ref: 'Community', required: true },
  role: { type: String, enum: ['member', 'moderator', 'admin'], default: 'member' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'blocked'], default: 'approved' },
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

CommunityMemberSchema.index({ user: 1, community: 1 }, { unique: true });
CommunityMemberSchema.index({ community: 1, status: 1, joinedAt: -1 });

export const CommunityMember = mongoose.model<ICommunityMember>('CommunityMember', CommunityMemberSchema);
