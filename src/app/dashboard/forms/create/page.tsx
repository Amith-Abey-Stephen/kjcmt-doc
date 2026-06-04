"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2, Save, FileText, Calendar, Layers } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().optional(),
  department: z.string().min(2, "Department is required (e.g. BCA)"),
  batch: z.string().min(2, "Batch is required (e.g. 2026)"),
  academicYear: z.string().min(4, "Academic Year is required (e.g. 2023-2026)"),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Must be a valid date and time",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateFormPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      department: "",
      batch: "",
      academicYear: "",
      deadline: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to create form.");
      }

      router.push("/dashboard/forms");
      router.refresh();
    } catch (err: any) {
      setSubmitError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Back CTA */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/forms"
          className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900 border border-zinc-900/60 bg-zinc-950 transition duration-200"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Forms Manager</span>
          <h1 className="text-xl font-bold tracking-tight text-white">Create Collection Campaign</h1>
        </div>
      </div>

      {/* Main card form */}
      <div className="glass-card p-8 rounded-2xl bg-zinc-900/40 border border-zinc-900 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {submitError && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/20 text-red-200 text-xs text-center">
              {submitError}
            </div>
          )}

          {/* Form Title */}
          <div className="space-y-1.5">
            <label htmlFor="title" className="text-xs font-semibold text-zinc-400">
              Form Campaign Title *
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                id="title"
                type="text"
                placeholder="e.g. NPTEL Certificate Submission - BCA 2026"
                {...register("title")}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-900 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200"
              />
            </div>
            {errors.title && (
              <p className="text-[10px] text-red-400 font-medium pl-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label htmlFor="description" className="text-xs font-semibold text-zinc-400">
              Instruction / Description (Optional)
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Provide guidelines for students. E.g. Upload PDF files under 10MB only. Verify roll numbers before submitting."
              {...register("description")}
              className="w-full px-4 py-2.5 bg-zinc-950/60 border border-zinc-900 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200 resize-none"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Department */}
            <div className="space-y-1.5">
              <label htmlFor="department" className="text-xs font-semibold text-zinc-400">
                Department / Program *
              </label>
              <div className="relative">
                <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  id="department"
                  type="text"
                  placeholder="e.g. BCA, BSc, BBA"
                  {...register("department")}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-900 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200"
                />
              </div>
              {errors.department && (
                <p className="text-[10px] text-red-400 font-medium pl-1">{errors.department.message}</p>
              )}
            </div>

            {/* Batch */}
            <div className="space-y-1.5">
              <label htmlFor="batch" className="text-xs font-semibold text-zinc-400">
                Student Batch (Graduation Year) *
              </label>
              <input
                id="batch"
                type="text"
                placeholder="e.g. 2026"
                {...register("batch")}
                className="w-full px-4 py-2.5 bg-zinc-950/60 border border-zinc-900 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200"
              />
              {errors.batch && (
                <p className="text-[10px] text-red-400 font-medium pl-1">{errors.batch.message}</p>
              )}
            </div>

            {/* Academic Year */}
            <div className="space-y-1.5">
              <label htmlFor="academicYear" className="text-xs font-semibold text-zinc-400">
                Academic Year *
              </label>
              <input
                id="academicYear"
                type="text"
                placeholder="e.g. 2023-2026"
                {...register("academicYear")}
                className="w-full px-4 py-2.5 bg-zinc-950/60 border border-zinc-900 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200"
              />
              {errors.academicYear && (
                <p className="text-[10px] text-red-400 font-medium pl-1">{errors.academicYear.message}</p>
              )}
            </div>

            {/* Submission Deadline */}
            <div className="space-y-1.5">
              <label htmlFor="deadline" className="text-xs font-semibold text-zinc-400">
                Submission Deadline *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  id="deadline"
                  type="datetime-local"
                  {...register("deadline")}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-900 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200"
                />
              </div>
              {errors.deadline && (
                <p className="text-[10px] text-red-400 font-medium pl-1">{errors.deadline.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-900/60">
            <Link
              href="/dashboard/forms"
              className="py-2.5 px-5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-xl text-sm text-zinc-400 hover:text-white transition duration-200 font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 py-2.5 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed rounded-xl text-sm font-semibold text-white transition duration-200 shadow-lg shadow-purple-600/10 active:translate-y-0.5"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Creating Campaign...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Publish Form</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
