import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  admin: mongoose.Types.ObjectId;
  action: string;
  targetType: 'User' | 'Post' | 'Comment' | 'Community' | 'Event' | 'Report' | 'System';
  targetId?: mongoose.Types.ObjectId;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>({
  admin: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  action: { type: String, required: true },
  targetType: { 
    type: String, 
    enum: ['User', 'Post', 'Comment', 'Community', 'Event', 'Report', 'System'], 
    required: true 
  },
  targetId: { type: Schema.Types.ObjectId, index: true },
  details: { type: Schema.Types.Mixed },
  ipAddress: { type: String }
}, { timestamps: true });

AuditLogSchema.index({ action: 1 });
AuditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
