import mongoose from "mongoose";

const FormSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
  batch: {
    type: String,
    required: true,
    trim: true,
  },
  academicYear: {
    type: String,
    required: true,
    trim: true,
  },
  deadline: {
    type: Date,
    required: false,
  },
  status: {
    type: String,
    enum: ["active", "expired"],
    default: "active",
  },
  programmeName: {
    type: String,
    trim: true,
  },
  programmeCode: {
    type: String,
    trim: true,
  },
  projectType: {
    type: String,
    trim: true,
  },
  courseCode: {
    type: String,
    trim: true,
  },
  yearOfOffering: {
    type: String,
    trim: true,
  },
  placeOfProject: {
    type: String,
    trim: true,
  },
  askProgrammeName: {
    type: Boolean,
    default: false,
  },
  askProgrammeCode: {
    type: Boolean,
    default: false,
  },
  askProjectType: {
    type: Boolean,
    default: false,
  },
  askCourseCode: {
    type: Boolean,
    default: false,
  },
  askYearOfOffering: {
    type: Boolean,
    default: false,
  },
  askPlaceOfProject: {
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to automatically mark expired forms when loading
FormSchema.post("find", function (docs) {
  const now = new Date();
  for (const doc of docs) {
    if (doc.deadline && new Date(doc.deadline) < now && doc.status !== "expired") {
      doc.status = "expired";
      doc.save().catch(() => {}); // silent save
    }
  }
});

FormSchema.post("findOne", function (doc) {
  if (doc) {
    const now = new Date();
    if (doc.deadline && new Date(doc.deadline) < now && doc.status !== "expired") {
      doc.status = "expired";
      doc.save().catch(() => {});
    }
  }
});

export default mongoose.models.Form || mongoose.model("Form", FormSchema);
