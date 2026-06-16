import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  reporter: mongoose.Types.ObjectId;
  targetType: 'User' | 'Post' | 'Comment' | 'Community' | 'Event';
  targetId: mongoose.Types.ObjectId;
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  actionTaken?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReport>({
  reporter: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  targetType: { 
    type: String, 
    enum: ['User', 'Post', 'Comment', 'Community', 'Event'], 
    required: true 
  },
  targetId: { type: Schema.Types.ObjectId, required: true, index: true },
  reason: { type: String, required: true },
  details: { type: String, maxlength: 1000 },
  status: { 
    type: String, 
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'], 
    default: 'pending' 
  },
  actionTaken: { type: String },
  reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

ReportSchema.index({ status: 1 });
ReportSchema.index({ targetType: 1, targetId: 1 });

export const Report = mongoose.model<IReport>('Report', ReportSchema);
