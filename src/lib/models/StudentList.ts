import mongoose from "mongoose";

const StudentListSchema = new mongoose.Schema({
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
});

// Compound index to ensure student roll numbers are unique per form
StudentListSchema.index({ formId: 1, rollNumber: 1 }, { unique: true });

export default mongoose.models.StudentList || mongoose.model("StudentList", StudentListSchema);
