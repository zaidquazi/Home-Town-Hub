import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender?: mongoose.Types.ObjectId;
  type: 'LIKE' | 'COMMENT' | 'FOLLOW' | 'EVENT' | 'SYSTEM';
  content: string;
  read: boolean;
  relatedId?: mongoose.Types.ObjectId; // E.g., postId, eventId, etc.
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: ['LIKE', 'COMMENT', 'FOLLOW', 'EVENT', 'SYSTEM'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
    },
  },
  { timestamps: true }
);

// Indexes to speed up queries
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ recipient: 1, read: 1, createdAt: -1 }); // Unread count query

// Automatically delete notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
