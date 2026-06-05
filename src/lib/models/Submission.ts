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
  projectName: {
    type: String,
    required: false,
    trim: true,
  },
  programmeName: {
    type: String,
    required: false,
    trim: true,
  },
  programmeCode: {
    type: String,
    required: false,
    trim: true,
  },
  projectType: {
    type: String,
    required: false,
    trim: true,
  },
  courseCode: {
    type: String,
    required: false,
    trim: true,
  },
  yearOfOffering: {
    type: String,
    required: false,
    trim: true,
  },
  placeOfProject: {
    type: String,
    required: false,
    trim: true,
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
