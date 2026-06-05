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
        <div className="w-full max-w-md glass-card p-8 rounded-2xl border border-zinc-900 text-center space-y-5 animate-in">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto">
            <AlertTriangle className="h-8 w-8 animate-float" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Invalid Form Link</h2>
            <p className="text-xs text-zinc-400 mt-2">This link could not be verified</p>
          </div>
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
        <div className="w-full max-w-md glass-card p-8 rounded-2xl border border-zinc-900 text-center space-y-5 animate-in">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto">
            <Calendar className="h-7 w-7 animate-float" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Campaign Closed</h2>
            <p className="text-xs text-zinc-400 mt-1.5">{form.title}</p>
          </div>
          <div className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900">
            <p className="text-xs text-zinc-500 leading-relaxed">
              The submission window closed on <strong className="text-zinc-300">{new Date(form.deadline).toLocaleString()}</strong>. Late uploads are locked.
            </p>
          </div>
          <p className="text-xs text-zinc-500">Please contact your administrator.</p>
          <div className="pt-2">
            <Link
              href="/login"
              className="group inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 font-semibold transition-colors"
            >
              <span>Faculty login portal</span>
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
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
