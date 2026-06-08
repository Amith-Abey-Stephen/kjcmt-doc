"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ArrowLeft, Loader2, Save, FileText, Calendar, Layers, Sparkles } from "lucide-react";
import Link from "next/link";

const formSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters long"),
  description: z.string().optional(),
  department: z.string().min(2, "Department is required (e.g. BCA)"),
  batch: z.string().min(2, "Batch is required (e.g. 2026)"),
  academicYear: z.string().min(4, "Academic Year is required (e.g. 2023-2026)"),
  deadline: z.string().optional().refine((val) => !val || !isNaN(Date.parse(val)), {
    message: "Must be a valid date and time",
  }),
  programmeName: z.string().optional(),
  programmeCode: z.string().optional(),
  projectType: z.string().optional(),
  customProjectType: z.string().optional(),
  courseCode: z.string().optional(),
  yearOfOffering: z.string().optional(),
  placeOfProject: z.string().optional(),
  askProgrammeName: z.boolean().optional(),
  askProgrammeCode: z.boolean().optional(),
  askProjectType: z.boolean().optional(),
  askCourseCode: z.boolean().optional(),
  askYearOfOffering: z.boolean().optional(),
  askPlaceOfProject: z.boolean().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateFormPage() {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNaacFields, setShowNaacFields] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
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
      programmeName: "",
      programmeCode: "",
      projectType: "Project Work",
      customProjectType: "",
      courseCode: "",
      yearOfOffering: "",
      placeOfProject: "Kristu Jyoti College of Management and Technology",
      askProgrammeName: false,
      askProgrammeCode: false,
      askProjectType: false,
      askCourseCode: false,
      askYearOfOffering: false,
      askPlaceOfProject: false,
    },
  });

  const projectTypeValue = watch("projectType");

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setSubmitError("");

    const submissionData = {
      ...data,
      projectType: data.projectType === "Custom" ? data.customProjectType : data.projectType,
    };

    try {
      const res = await fetch("/api/forms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      let json;
      const text = await res.text();
      try {
        json = JSON.parse(text);
      } catch {
        if (res.status === 413) {
          throw new Error("Failed to create campaign: The request payload is too large.");
        }
        throw new Error(text || `Request failed with status code ${res.status}`);
      }

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
    <div className="max-w-2xl mx-auto space-y-6 pb-12 animate-in">
      {/* Back CTA */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/forms"
          className="p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-900 border border-zinc-900/60 bg-zinc-950 transition-all duration-200 hover:border-zinc-700"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="h-4 w-1 bg-purple-500 rounded-full" />
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Forms Manager</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Create Collection Campaign</h1>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 px-1">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white">1</div>
          <span className="text-[10px] font-semibold text-purple-400">Campaign Details</span>
        </div>
        <div className="h-px flex-1 bg-zinc-800 mx-2" />
        <div className="flex items-center gap-2 opacity-40">
          <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">2</div>
          <span className="text-[10px] font-semibold text-zinc-500">Upload Student List</span>
        </div>
        <div className="h-px flex-1 bg-zinc-800 mx-2" />
        <div className="flex items-center gap-2 opacity-40">
          <div className="h-6 w-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-500">3</div>
          <span className="text-[10px] font-semibold text-zinc-500">Collect Certificates</span>
        </div>
      </div>

      {/* Main card form */}
      <div className="glass-card p-8 rounded-2xl bg-zinc-900/40 border border-zinc-900 shadow-2xl backdrop-blur-xl animate-in animate-in-delay-1">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {submitError && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/20 text-red-200 text-xs text-center">
              {submitError}
            </div>
          )}

          {/* Quick Guide Banner for Old Teachers/Non-Techies */}
          <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-900/40 text-xs text-purple-200 space-y-1.5">
            <h4 className="font-bold flex items-center gap-1.5 text-purple-400">
              <Sparkles className="h-4 w-4" />
              Quick Guide for Teachers
            </h4>
            <p className="text-zinc-400 leading-relaxed text-[11px]">
              Fill out this form to publish a new collection window. After saving, you will get a link to share with students and options to upload a class roster.
            </p>
          </div>

          {/* Form Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-bold text-zinc-300">
              Form Campaign Title *
            </label>
            <div className="relative">
              <FileText className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
              <input
                id="title"
                type="text"
                placeholder="e.g. NPTEL Certificate Submission - BCA 2026"
                {...register("title")}
                className="w-full pl-11 pr-4 py-3 bg-zinc-950/60 border border-zinc-900 rounded-xl text-base text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200"
              />
            </div>
            <p className="text-xs text-zinc-550 leading-normal pl-1">Give it a descriptive name (e.g. &quot;Software Project Submissions - BCA 2026&quot;).</p>
            {errors.title && (
              <p className="text-[10px] text-red-400 font-medium pl-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-bold text-zinc-300">
              Instruction / Description (Optional)
            </label>
            <textarea
              id="description"
              rows={3}
              placeholder="Provide guidelines for students. E.g. Upload PDF files under 10MB only. Verify roll numbers before submitting."
              {...register("description")}
              className="w-full px-4 py-3 bg-zinc-950/60 border border-zinc-900 rounded-xl text-base text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200 resize-none"
            />
            <p className="text-xs text-zinc-550 leading-normal pl-1">Add details like instructions on file formatting or required certificates.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Department */}
            <div className="space-y-2">
              <label htmlFor="department" className="text-sm font-bold text-zinc-300">
                Department / Program *
              </label>
              <div className="relative">
                <Layers className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <input
                  id="department"
                  type="text"
                  placeholder="e.g. BCA, BSc, BBA"
                  {...register("department")}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-950/60 border border-zinc-900 rounded-xl text-base text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200"
                />
              </div>
              <p className="text-xs text-zinc-550 leading-normal pl-1">Course branch acronym (e.g. &quot;BCA&quot;, &quot;MCA&quot;).</p>
              {errors.department && (
                <p className="text-[10px] text-red-400 font-medium pl-1">{errors.department.message}</p>
              )}
            </div>

            {/* Batch */}
            <div className="space-y-2">
              <label htmlFor="batch" className="text-sm font-bold text-zinc-300">
                Student Batch (Graduation Year) *
              </label>
              <input
                id="batch"
                type="text"
                placeholder="e.g. 2026"
                {...register("batch")}
                className="w-full px-4 py-3 bg-zinc-950/60 border border-zinc-900 rounded-xl text-base text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200"
              />
              <p className="text-xs text-zinc-550 leading-normal pl-1">The year the student batch finishes graduation.</p>
              {errors.batch && (
                <p className="text-[10px] text-red-400 font-medium pl-1">{errors.batch.message}</p>
              )}
            </div>

            {/* Academic Year */}
            <div className="space-y-2">
              <label htmlFor="academicYear" className="text-sm font-bold text-zinc-300">
                Academic Year *
              </label>
              <input
                id="academicYear"
                type="text"
                placeholder="e.g. 2023-2026"
                {...register("academicYear")}
                className="w-full px-4 py-3 bg-zinc-950/60 border border-zinc-900 rounded-xl text-base text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200"
              />
              <p className="text-xs text-zinc-550 leading-normal pl-1">The registration period for NAAC alignment.</p>
              {errors.academicYear && (
                <p className="text-[10px] text-red-400 font-medium pl-1">{errors.academicYear.message}</p>
              )}
            </div>

            {/* Submission Deadline */}
            <div className="space-y-2">
              <label htmlFor="deadline" className="text-sm font-bold text-zinc-300">
                Submission Deadline (Optional)
              </label>
              <div className="relative">
                <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
                <input
                  id="deadline"
                  type="datetime-local"
                  {...register("deadline")}
                  className="w-full pl-11 pr-4 py-3 bg-zinc-950/60 border border-zinc-900 rounded-xl text-base text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200"
                />
              </div>
              <p className="text-xs text-zinc-550 leading-normal pl-1">Optional. The date and time after which student submissions will lock.</p>
              {errors.deadline && (
                <p className="text-[10px] text-red-400 font-medium pl-1">{errors.deadline.message}</p>
              )}
            </div>
          </div>

          {/* Accordion for NAAC settings */}
          <div className="border border-zinc-900 rounded-xl overflow-hidden bg-zinc-950/20">
            <button
              type="button"
              onClick={() => setShowNaacFields(!showNaacFields)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left text-xs font-semibold text-zinc-300 hover:text-white bg-zinc-900/30 hover:bg-zinc-900/50 transition duration-200"
            >
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-500" />
                <span>NAAC / Curriculum Project Details (Optional)</span>
              </div>
              <span className="text-zinc-500 font-mono text-[10px]">
                {showNaacFields ? "Hide [−]" : "Configure Program Defaults [+]"}
              </span>
            </button>

            {showNaacFields && (
              <div className="p-5 border-t border-zinc-900/60 grid gap-4 sm:grid-cols-2 animate-in">
                {/* Programme Name */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="programmeName" className="text-xs font-semibold text-zinc-400">
                      Programme Name
                    </label>
                    <label className="flex items-center gap-1.5 text-[10px] text-zinc-500 cursor-pointer hover:text-zinc-300">
                      <input
                        type="checkbox"
                        {...register("askProgrammeName")}
                        className="rounded border-zinc-800 bg-zinc-950 text-purple-600 focus:ring-purple-500/30 h-3 w-3 cursor-pointer"
                      />
                      <span>Ask student to fill</span>
                    </label>
                  </div>
                  <input
                    id="programmeName"
                    type="text"
                    placeholder="e.g. Bachelor of Computer Applications"
                    {...register("programmeName")}
                    className="w-full px-4 py-2.5 bg-zinc-950/60 border border-zinc-900 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200"
                  />
                </div>

                {/* Programme Code */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="programmeCode" className="text-xs font-semibold text-zinc-400">
                      Programme Code
                    </label>
                    <label className="flex items-center gap-1.5 text-[10px] text-zinc-500 cursor-pointer hover:text-zinc-300">
                      <input
                        type="checkbox"
                        {...register("askProgrammeCode")}
                        className="rounded border-zinc-800 bg-zinc-950 text-purple-600 focus:ring-purple-500/30 h-3 w-3 cursor-pointer"
                      />
                      <span>Ask student to fill</span>
                    </label>
                  </div>
                  <input
                    id="programmeCode"
                    type="text"
                    placeholder="e.g. BCA"
                    {...register("programmeCode")}
                    className="w-full px-4 py-2.5 bg-zinc-950/60 border border-zinc-900 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200"
                  />
                </div>

                {/* Project/Field Work/Internship Type */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="projectType" className="text-xs font-semibold text-zinc-400">
                      Project/Field Work/Internship
                    </label>
                    <label className="flex items-center gap-1.5 text-[10px] text-zinc-500 cursor-pointer hover:text-zinc-300">
                      <input
                        type="checkbox"
                        {...register("askProjectType")}
                        className="rounded border-zinc-800 bg-zinc-950 text-purple-600 focus:ring-purple-500/30 h-3 w-3 cursor-pointer"
                      />
                      <span>Ask student to fill</span>
                    </label>
                  </div>
                  <select
                    id="projectType"
                    {...register("projectType")}
                    className="w-full px-4 py-2.5 bg-zinc-950/60 border border-zinc-900 rounded-xl text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200 cursor-pointer"
                  >
                    <option value="Project Work">Project Work</option>
                    <option value="Internship">Internship</option>
                    <option value="Field Work">Field Work</option>
                    <option value="Custom">Other (Specify...)</option>
                  </select>
                  {projectTypeValue === "Custom" && (
                    <input
                      type="text"
                      placeholder="e.g. Skill Development Project"
                      {...register("customProjectType")}
                      className="mt-2 w-full px-4 py-2.5 bg-zinc-950/60 border border-zinc-900 rounded-xl text-sm text-white placeholder-zinc-650 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200 animate-in fade-in slide-in-from-top-1"
                    />
                  )}
                </div>

                {/* Course Code */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="courseCode" className="text-xs font-semibold text-zinc-400">
                      Course Code
                    </label>
                    <label className="flex items-center gap-1.5 text-[10px] text-zinc-500 cursor-pointer hover:text-zinc-300">
                      <input
                        type="checkbox"
                        {...register("askCourseCode")}
                        className="rounded border-zinc-800 bg-zinc-950 text-purple-600 focus:ring-purple-500/30 h-3 w-3 cursor-pointer"
                      />
                      <span>Ask student to fill</span>
                    </label>
                  </div>
                  <input
                    id="courseCode"
                    type="text"
                    placeholder="e.g. BCA601"
                    {...register("courseCode")}
                    className="w-full px-4 py-2.5 bg-zinc-950/60 border border-zinc-900 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200"
                  />
                </div>

                {/* Year of Offering */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="yearOfOffering" className="text-xs font-semibold text-zinc-400">
                      Year of Offering
                    </label>
                    <label className="flex items-center gap-1.5 text-[10px] text-zinc-500 cursor-pointer hover:text-zinc-300">
                      <input
                        type="checkbox"
                        {...register("askYearOfOffering")}
                        className="rounded border-zinc-800 bg-zinc-950 text-purple-600 focus:ring-purple-500/30 h-3 w-3 cursor-pointer"
                      />
                      <span>Ask student to fill</span>
                    </label>
                  </div>
                  <input
                    id="yearOfOffering"
                    type="text"
                    placeholder="e.g. 2025-2026"
                    {...register("yearOfOffering")}
                    className="w-full px-4 py-2.5 bg-zinc-950/60 border border-zinc-900 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200"
                  />
                </div>

                {/* Place of Project */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="placeOfProject" className="text-xs font-semibold text-zinc-400">
                      Place of Project
                    </label>
                    <label className="flex items-center gap-1.5 text-[10px] text-zinc-500 cursor-pointer hover:text-zinc-300">
                      <input
                        type="checkbox"
                        {...register("askPlaceOfProject")}
                        className="rounded border-zinc-800 bg-zinc-950 text-purple-600 focus:ring-purple-500/30 h-3 w-3 cursor-pointer"
                      />
                      <span>Ask student to fill</span>
                    </label>
                  </div>
                  <input
                    id="placeOfProject"
                    type="text"
                    placeholder="e.g. Kristu Jyoti College"
                    {...register("placeOfProject")}
                    className="w-full px-4 py-2.5 bg-zinc-950/60 border border-zinc-900 rounded-xl text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition duration-200"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-zinc-900/60">
            <Link
              href="/dashboard/forms"
              className="py-3.5 px-6 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-xl text-base text-zinc-300 hover:text-white transition duration-200 font-bold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 py-3.5 px-8 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed rounded-xl text-base font-extrabold text-white transition duration-200 shadow-lg shadow-purple-600/15 active:translate-y-0.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Creating Campaign...</span>
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
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
