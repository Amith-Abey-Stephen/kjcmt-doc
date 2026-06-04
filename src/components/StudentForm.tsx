"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  UploadCloud,
  FileCheck,
  Loader2,
  Send,
  AlertTriangle,
  GraduationCap,
  Calendar,
  Sparkles,
} from "lucide-react";

interface FormDetails {
  id: string;
  title: string;
  description: string;
  department: string;
  batch: string;
  academicYear: string;
  deadline: string;
}

interface StudentFormProps {
  form: FormDetails;
}

export default function StudentForm({ form }: StudentFormProps) {
  const router = useRouter();

  // Input states
  const [studentName, setStudentName] = useState("");
  const [rollNumber, setRollNumber] = useState("");

  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [file3, setFile3] = useState<File | null>(null);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type (PDF, JPEG, JPG, PNG)
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const allowedExts = [".pdf", ".jpg", ".jpeg", ".png"];
    const hasValidType = allowedTypes.includes(file.type);
    const hasValidExt = allowedExts.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidType && !hasValidExt) {
      setError(`Invalid file type for ${file.name}. Only PDF and images (JPEG/PNG) are accepted.`);
      setFile(null);
      e.target.value = "";
      return;
    }

    // Check file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError(`File ${file.name} is too large. Max file size is 10MB.`);
      setFile(null);
      e.target.value = "";
      return;
    }

    setFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!studentName.trim()) {
      setError("Please enter your Student Name.");
      return;
    }
    if (!rollNumber.trim()) {
      setError("Please enter your Roll Number.");
      return;
    }
    if (!file1 || !file2) {
      setError("Certificate Page 1 and Certificate Page 2 are required files.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("formId", form.id);
    formData.append("studentName", studentName.trim());
    formData.append("rollNumber", rollNumber.trim().toUpperCase());
    formData.append("certificate1", file1);
    formData.append("certificate2", file2);
    if (file3) {
      formData.append("certificate3", file3);
    }

    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Submission failed. Please try again.");
      }

      // Redirect to receipt
      router.push(`/form/${form.id}/receipt?rollNumber=${rollNumber.trim().toUpperCase()}`);
    } catch (err: any) {
      setError(err.message || "An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Branding and form info */}
      <div className="text-center space-y-2 mb-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-400 font-bold tracking-wide uppercase shadow shadow-purple-600/5">
          <Sparkles className="h-3.5 w-3.5 text-purple-400" />
          <span>Kristu Jyoti College Form Portal</span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight leading-tight pt-1">
          {form.title}
        </h1>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-zinc-500 font-medium">
          <span>Dept: {form.department}</span>
          <span>Batch: {form.batch}</span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 text-zinc-600" />
            Deadline: {new Date(form.deadline).toLocaleString()}
          </span>
        </div>
        {form.description && (
          <p className="text-zinc-500 text-xs leading-normal max-w-lg mx-auto pt-2">
            {form.description}
          </p>
        )}
      </div>

      {/* Main Form container */}
      <div className="glass-card p-8 rounded-2xl bg-zinc-900/40 border border-zinc-900 shadow-2xl backdrop-blur-xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-950/40 border border-red-500/20 text-red-200 text-xs text-center flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Info Warning Banner */}
          <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-900/35 text-[10px] text-purple-300 leading-normal flex gap-2">
            <AlertTriangle className="h-4.5 w-4.5 text-purple-400 flex-shrink-0" />
            <p>
              <strong>Resubmission Note:</strong> If you have already uploaded certificates, submitting again with the same Roll Number will replace your previously uploaded files.
            </p>
          </div>

          {/* Identity fields */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Student Name *</label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Amith Jose"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/60 border border-zinc-900 rounded-xl text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-400">Roll Number *</label>
              <input
                type="text"
                required
                placeholder="e.g. BCA001"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-950/60 border border-zinc-900 rounded-xl text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition"
              />
            </div>
          </div>

          {/* FILE UPLOAD GRID */}
          <div className="space-y-5 pt-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 border-b border-zinc-900 pb-2">
              Upload Certificates (PDF or Image format, max 10MB)
            </h3>

            {/* Cert 1 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400">Certificate Page 1 *</label>
              <div className="relative border border-dashed border-zinc-800 rounded-xl p-4 flex items-center justify-between bg-zinc-950/30 hover:border-zinc-700 transition">
                <div className="flex items-center gap-3">
                  {file1 ? (
                    <FileCheck className="h-8 w-8 text-green-500" />
                  ) : (
                    <FileText className="h-8 w-8 text-zinc-700" />
                  )}
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-[300px]">
                      {file1 ? file1.name : "Select certificate page 1"}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {file1 ? `${Math.round(file1.size / 1024)} KB` : "PDF or image file required"}
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  id="cert-1"
                  required
                  accept=".pdf,image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleFileChange(e, setFile1)}
                  className="hidden"
                />
                <label
                  htmlFor="cert-1"
                  className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 hover:border-zinc-700 text-[10px] font-bold text-zinc-400 hover:text-white cursor-pointer transition select-none"
                >
                  Choose File
                </label>
              </div>
            </div>

            {/* Cert 2 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400">Certificate Page 2 *</label>
              <div className="relative border border-dashed border-zinc-800 rounded-xl p-4 flex items-center justify-between bg-zinc-950/30 hover:border-zinc-700 transition">
                <div className="flex items-center gap-3">
                  {file2 ? (
                    <FileCheck className="h-8 w-8 text-green-500" />
                  ) : (
                    <FileText className="h-8 w-8 text-zinc-700" />
                  )}
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-[300px]">
                      {file2 ? file2.name : "Select certificate page 2"}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {file2 ? `${Math.round(file2.size / 1024)} KB` : "PDF or image file required"}
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  id="cert-2"
                  required
                  accept=".pdf,image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleFileChange(e, setFile2)}
                  className="hidden"
                />
                <label
                  htmlFor="cert-2"
                  className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 hover:border-zinc-700 text-[10px] font-bold text-zinc-400 hover:text-white cursor-pointer transition select-none"
                >
                  Choose File
                </label>
              </div>
            </div>

            {/* Cert 3 (Optional) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400">
                Company Certificate <span className="text-zinc-500 font-medium">(Optional)</span>
              </label>
              <div className="relative border border-dashed border-zinc-800 rounded-xl p-4 flex items-center justify-between bg-zinc-950/30 hover:border-zinc-700 transition">
                <div className="flex items-center gap-3">
                  {file3 ? (
                    <FileCheck className="h-8 w-8 text-purple-400" />
                  ) : (
                    <UploadCloud className="h-8 w-8 text-zinc-700" />
                  )}
                  <div className="text-left">
                    <p className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-[300px]">
                      {file3 ? file3.name : "Select company certificate"}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                      {file3 ? `${Math.round(file3.size / 1024)} KB` : "PDF or image optional"}
                    </p>
                  </div>
                </div>

                <input
                  type="file"
                  id="cert-3"
                  accept=".pdf,image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleFileChange(e, setFile3)}
                  className="hidden"
                />
                <label
                  htmlFor="cert-3"
                  className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 hover:border-zinc-700 text-[10px] font-bold text-zinc-400 hover:text-white cursor-pointer transition select-none"
                >
                  Choose File
                </label>
              </div>
            </div>
          </div>

          {/* Submit action */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition duration-200 shadow-lg shadow-purple-600/10 active:translate-y-0.5"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Uploading certificates...</span>
              </>
            ) : (
              <>
                <span>Submit Certificates</span>
                <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>

      <p className="text-center text-[10px] text-zinc-600">
        Developed for Kristu Jyoti College by INOVUS LABS IEDC
      </p>
    </div>
  );
}
