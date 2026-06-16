import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  fullName: string;
  username: string;
  email: string;
  password?: string; // Optional for Google OAuth
  googleId?: string;
  profilePicture?: string;
  coverPhoto?: string;
  bio?: string;
  currentLocation?: {
    country: string;
    state: string;
    district?: string;
    city: string;
    area?: string;
    latitude?: number;
    longitude?: number;
  };
  hometown?: {
    country: string;
    state: string;
    district?: string;
    city: string;
    area?: string;
    latitude?: number;
    longitude?: number;
  };
  occupation?: string;
  education?: string;
  interests: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    github?: string;
    website?: string;
  };
  role: 'user' | 'moderator' | 'admin' | 'superadmin';
  permissions: string[];
  isActive: boolean;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  followersCount: number;
  followingCount: number;
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  fullName: { type: String, required: true, trim: true },
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, index: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  password: { type: String, select: false },
  googleId: { type: String, sparse: true, unique: true },
  profilePicture: { type: String },
  coverPhoto: { type: String },
  bio: { type: String, maxlength: 500 },
  currentLocation: {
    country: String,
    state: String,
    district: String,
    city: String,
    area: String,
    latitude: Number,
    longitude: Number
  },
  hometown: {
    country: String,
    state: String,
    district: String,
    city: String,
    area: String,
    latitude: Number,
    longitude: Number
  },
  occupation: { type: String, trim: true, maxlength: 100 },
  education: { type: String, trim: true, maxlength: 100 },
  interests: [{ type: String, trim: true }],
  socialLinks: {
    twitter: String,
    linkedin: String,
    instagram: String,
    github: String,
    website: String
  },
  role: { type: String, enum: ['user', 'moderator', 'admin', 'superadmin'], default: 'user' },
  permissions: [{ type: String }],
  isActive: { type: Boolean, default: true },
  followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  followersCount: { type: Number, default: 0 },
  followingCount: { type: Number, default: 0 }
}, { timestamps: true });

UserSchema.index({ fullName: 'text', username: 'text', bio: 'text' });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

// Cascade delete related records
UserSchema.pre('findOneAndDelete', async function(next: any) {
  try {
    const doc = await this.model.findOne(this.getQuery());
    if (doc) {
      const userId = doc._id;
      await mongoose.model('Follow').deleteMany({ $or: [{ follower: userId }, { following: userId }] });
      await mongoose.model('Like').deleteMany({ user: userId });
      await mongoose.model('CommunityMember').deleteMany({ user: userId });
      await mongoose.model('EventAttendee').deleteMany({ user: userId });
      await mongoose.model('Post').deleteMany({ author: userId });
      await mongoose.model('Comment').deleteMany({ author: userId });
    }
    next();
  } catch (err: any) {
    next(err);
  }
});

export const User = mongoose.model<IUser>('User', UserSchema);
