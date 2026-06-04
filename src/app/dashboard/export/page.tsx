import React from "react";
import dbConnect from "@/lib/db";
import Form from "@/lib/models/Form";
import ExportCenterClient from "@/components/ExportCenterClient";

async function getFormsData() {
  await dbConnect();
  const forms = await Form.find({}).sort({ createdAt: -1 });

  return forms.map((f) => ({
    id: f._id.toString(),
    title: f.title,
    department: f.department,
    batch: f.batch,
  }));
}

export default async function ExportCenterPage() {
  const forms = await getFormsData();

  return (
    <div className="space-y-6">
      <ExportCenterClient forms={forms} />
    </div>
  );
}
