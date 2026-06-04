import mongoose from "mongoose";

const AuditLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
    trim: true,
  },
  details: {
    type: String,
    required: true,
    trim: true,
  },
  performedBy: {
    type: String,
    required: true,
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.AuditLog || mongoose.model("AuditLog", AuditLogSchema);
