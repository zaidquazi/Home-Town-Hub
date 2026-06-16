import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  description: string;
  date: Date;
  venue: string;
  community: mongoose.Types.ObjectId;
  organizer: mongoose.Types.ObjectId;
  coverPhoto?: string;
  category: string;
  attendees: mongoose.Types.ObjectId[];
  attendeeCount: number;
  maxAttendees?: number;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 2000 },
  date: { type: Date, required: true },
  venue: { type: String, required: true },
  community: { type: Schema.Types.ObjectId, ref: 'Community', required: true, index: true },
  organizer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  coverPhoto: { type: String },
  category: { type: String, required: true, default: 'General' },
  attendees: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  attendeeCount: { type: Number, default: 0 },
  maxAttendees: { type: Number }
}, { timestamps: true });

EventSchema.index({ title: 'text', description: 'text', venue: 'text', category: 'text' });
EventSchema.index({ date: 1 });
EventSchema.index({ attendees: 1 });
EventSchema.index({ community: 1, date: 1 });

export const Event = mongoose.model<IEvent>('Event', EventSchema);
