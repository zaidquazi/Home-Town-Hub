import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  community: mongoose.Types.ObjectId;
  media: string[];
  likes: mongoose.Types.ObjectId[];
  likeCount: number;
  commentCount: number;
  moderation?: {
    riskScore: number;
    status: 'safe' | 'warning' | 'review' | 'blocked';
    reasons: string[];
  };
  isPinned: boolean;
  type: 'default' | 'announcement';
  sharedFrom?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>({
  content: { type: String, required: true, maxlength: 5000 },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  community: { type: Schema.Types.ObjectId, ref: 'Community', index: true },
  media: [{ type: String }], // Array of Cloudinary URLs
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  moderation: {
    riskScore: { type: Number, default: 0 },
    status: { type: String, enum: ['safe', 'warning', 'review', 'blocked'], default: 'safe' },
    reasons: [{ type: String }]
  },
  isPinned: { type: Boolean, default: false },
  type: { type: String, enum: ['default', 'announcement'], default: 'default' },
  sharedFrom: { type: Schema.Types.ObjectId, ref: 'Post' }
}, { timestamps: true });

PostSchema.index({ content: 'text' });
PostSchema.index({ community: 1, createdAt: -1 });
PostSchema.index({ author: 1, createdAt: -1 }); // Profile feed queries
PostSchema.index({ createdAt: -1 }); // Global feed sorting

export const Post = mongoose.model<IPost>('Post', PostSchema);
