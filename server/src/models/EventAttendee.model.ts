import mongoose, { Schema, Document } from 'mongoose';

export interface IEventAttendee extends Document {
  event: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  status: 'attending' | 'waitlist' | 'cancelled';
  joinedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EventAttendeeSchema = new Schema<IEventAttendee>({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['attending', 'waitlist', 'cancelled'], default: 'attending' },
  joinedAt: { type: Date, default: Date.now }
}, { timestamps: true });

EventAttendeeSchema.index({ event: 1, user: 1 }, { unique: true });
EventAttendeeSchema.index({ event: 1, status: 1, joinedAt: 1 });

export const EventAttendee = mongoose.model<IEventAttendee>('EventAttendee', EventAttendeeSchema);
