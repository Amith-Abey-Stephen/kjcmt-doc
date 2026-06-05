import React from "react";
import dbConnect from "@/lib/db";
import Form from "@/lib/models/Form";
import ReportsClient from "@/components/ReportsClient";

async function getFormsData() {
  await dbConnect();
  const forms = await Form.find({}).sort({ createdAt: -1 });

  return forms.map((f) => ({
    id: f._id.toString(),
    title: f.title,
    department: f.department,
    batch: f.batch,
    academicYear: f.academicYear,
    programmeName: f.programmeName || "",
    programmeCode: f.programmeCode || "",
    projectType: f.projectType || "",
    courseCode: f.courseCode || "",
    yearOfOffering: f.yearOfOffering || "",
    placeOfProject: f.placeOfProject || "",
  }));
}

export default async function ReportsPage() {
  const forms = await getFormsData();

  return (
    <div className="space-y-6">
      <ReportsClient forms={forms} />
    </div>
  );
}
