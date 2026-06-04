import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  publicId: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
  },
  fileSize: {
    type: Number,
  }
});

const SubmissionSchema = new mongoose.Schema({
  formId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Form",
    required: true,
  },
  studentName: {
    type: String,
    required: true,
    trim: true,
  },
  rollNumber: {
    type: String,
    required: true,
    trim: true,
    uppercase: true,
  },
  certificate1: {
    type: FileSchema,
    required: true,
  },
  certificate2: {
    type: FileSchema,
    required: true,
  },
  certificate3: {
    type: FileSchema,
    required: false, // Optional company certificate
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);
