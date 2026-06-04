import React from "react";
import dbConnect from "@/lib/db";
import Form from "@/lib/models/Form";
import Submission from "@/lib/models/Submission";
import StudentList from "@/lib/models/StudentList";
import FormsClient from "@/components/FormsClient";

async function getFormsData() {
  await dbConnect();

  const forms = await Form.find({}).sort({ createdAt: -1 });

  const enrichedForms = await Promise.all(
    forms.map(async (form) => {
      const submissionCount = await Submission.countDocuments({ formId: form._id });
      const studentListCount = await StudentList.countDocuments({ formId: form._id });
      
      return {
        id: form._id.toString(),
        title: form.title,
        description: form.description || "",
        department: form.department,
        batch: form.batch,
        academicYear: form.academicYear,
        deadline: form.deadline.toISOString(),
        status: form.status,
        createdAt: form.createdAt.toISOString(),
        submissionCount,
        studentListCount,
      };
    })
  );

  return enrichedForms;
}

export default async function FormsPage() {
  const forms = await getFormsData();

  return (
    <div className="space-y-6">
      <FormsClient initialForms={forms} />
    </div>
  );
}
