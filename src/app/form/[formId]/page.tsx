import React from "react";
import dbConnect from "@/lib/db";
import Form from "@/lib/models/Form";
import StudentForm from "@/components/StudentForm";
import { AlertTriangle, Calendar, ArrowRight } from "lucide-react";
import Link from "next/link";

interface StudentFormPageProps {
  params: Promise<{ formId: string }>;
}

async function getFormData(formId: string) {
  await dbConnect();
  try {
    const form = await Form.findById(formId);
    if (!form) return null;
    
    return {
      id: form._id.toString(),
      title: form.title,
      description: form.description || "",
      department: form.department,
      batch: form.batch,
      academicYear: form.academicYear,
      deadline: form.deadline.toISOString(),
      status: form.status,
    };
  } catch (e) {
    return null;
  }
}

export default async function StudentFormPage(props: StudentFormPageProps) {
  const params = await props.params;
  const form = await getFormData(params.formId);

  if (!form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-md glass-card p-8 rounded-2xl border border-zinc-900 text-center space-y-4">
          <AlertTriangle className="h-10 w-10 text-red-500 mx-auto animate-pulse" />
          <h2 className="text-lg font-bold text-white">Invalid Form Link</h2>
          <p className="text-xs text-zinc-500 leading-relaxed">
            The collection form link you are trying to access is invalid, broken, or has been removed by the faculty. Please check with your class tutor.
          </p>
        </div>
      </div>
    );
  }

  const isExpired = new Date(form.deadline) < new Date();

  if (isExpired || form.status === "expired") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <div className="w-full max-w-md glass-card p-8 rounded-2xl border border-zinc-900 text-center space-y-5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Campaign Closed</h2>
            <p className="text-xs text-zinc-400 mt-1.5">{form.title}</p>
          </div>
          <p className="text-xs text-zinc-500 leading-relaxed">
            The submission window closed on <strong className="text-zinc-300">{new Date(form.deadline).toLocaleString()}</strong>. Late uploads are locked. Please contact your administrator.
          </p>
          <div className="pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 font-semibold"
            >
              <span>Faculty login portal</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-zinc-950 py-12 px-4 flex items-center justify-center">
      {/* Decorative gradient glow backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-xl">
        <StudentForm form={form} />
      </div>
    </div>
  );
}
