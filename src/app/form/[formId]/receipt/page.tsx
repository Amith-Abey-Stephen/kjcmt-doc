import React from "react";
import dbConnect from "@/lib/db";
import Form from "@/lib/models/Form";
import Submission from "@/lib/models/Submission";
import StudentReceipt from "@/components/StudentReceipt";
import { AlertTriangle, ChevronLeft } from "lucide-react";
import Link from "next/link";

interface ReceiptPageProps {
  params: Promise<{ formId: string }>;
  searchParams: Promise<{ rollNumber?: string }>;
}

async function getSubmissionReceipt(formId: string, rollNumber?: string) {
  if (!rollNumber) return null;
  await dbConnect();

  try {
    const form = await Form.findById(formId);
    if (!form) return null;

    const submission = await Submission.findOne({
      formId,
      rollNumber: rollNumber.trim().toUpperCase(),
    });
    if (!submission) return null;

    return {
      form: {
        id: form._id.toString(),
        title: form.title,
        department: form.department,
        batch: form.batch,
        academicYear: form.academicYear,
      },
      submission: {
        id: submission._id.toString(),
        studentName: submission.studentName,
        rollNumber: submission.rollNumber,
        submittedAt: submission.submittedAt.toISOString(),
        certificate1: { url: submission.certificate1.url },
        certificate2: { url: submission.certificate2.url },
        certificate3: submission.certificate3?.url ? { url: submission.certificate3.url } : null,
      },
    };
  } catch (e) {
    return null;
  }
}

export default async function ReceiptPage(props: ReceiptPageProps) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const data = await getSubmissionReceipt(params.formId, searchParams.rollNumber);

  if (!data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-md glass-card p-8 rounded-2xl border border-zinc-900 text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-yellow-500 mx-auto animate-pulse" />
          <h2 className="text-lg font-bold text-white">Receipt Not Found</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Could not retrieve any confirmation receipt for the requested Roll Number in this campaign. Please verify your roll number and try again.
          </p>
          <div className="pt-2">
            <Link
              href={`/form/${params.formId}`}
              className="inline-flex items-center gap-1.5 py-2 px-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 rounded-xl text-xs text-zinc-400 hover:text-white transition"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Back to submission form</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 py-12 px-4 flex items-center justify-center">
      {/* Glow overlays */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md">
        <StudentReceipt form={data.form} submission={data.submission} />
      </div>
    </div>
  );
}
