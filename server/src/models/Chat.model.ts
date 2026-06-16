import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  type: 'direct' | 'group';
  participants: mongoose.Types.ObjectId[];
  community?: mongoose.Types.ObjectId;
  lastMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema = new Schema<IChat>({
  type: { type: String, enum: ['direct', 'group'], required: true },
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  community: { type: Schema.Types.ObjectId, ref: 'Community' },
  lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' }
}, { timestamps: true });

// Ensure direct chats are unique between two users
ChatSchema.index({ type: 1, participants: 1 });

export const Chat = mongoose.model<IChat>('Chat', ChatSchema);
