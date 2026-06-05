"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileCheck,
  Loader2,
  Send,
  AlertTriangle,
  GraduationCap,
  Calendar,
  Sparkles,
  UploadCloud,
  CheckCircle,
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
  const [projectName, setProjectName] = useState("");

  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [file3, setFile3] = useState<File | null>(null);

  // Drag states
  const [dragOver1, setDragOver1] = useState(false);
  const [dragOver2, setDragOver2] = useState(false);
  const [dragOver3, setDragOver3] = useState(false);

  // Status states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const validateFile = (file: File): string | null => {
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const allowedExts = [".pdf", ".jpg", ".jpeg", ".png"];
    const hasValidType = allowedTypes.includes(file.type);
    const hasValidExt = allowedExts.some((ext) => file.name.toLowerCase().endsWith(ext));

    if (!hasValidType && !hasValidExt) {
      return `Invalid file type for ${file.name}. Only PDF and images (JPEG/PNG) are accepted.`;
    }

    if (file.size > 10 * 1024 * 1024) {
      return `File ${file.name} is too large. Max file size is 10MB.`;
    }

    return null;
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setFile(null);
      e.target.value = "";
      return;
    }

    setFile(file);
  };

  const handleMultiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((f) => !validateFile(f));
    const invalidFile = files.find((f) => validateFile(f));
    if (invalidFile) {
      setError(validateFile(invalidFile) || "Invalid file");
      e.target.value = "";
      return;
    }

    if (validFiles.length >= 1) setFile1(validFiles[0]);
    if (validFiles.length >= 2) setFile2(validFiles[1]);
    if (validFiles.length >= 3) setFile3(validFiles[2]);
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
    setFile: React.Dispatch<React.SetStateAction<File | null>>,
    setDragOver: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    setError("");

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setFile(file);
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    setDragOver: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const handleDragLeave = (
    e: React.DragEvent<HTMLDivElement>,
    setDragOver: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
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
    if (projectName.trim()) {
      formData.append("projectName", projectName.trim());
    }
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

      setSubmitted(true);
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
        {submitted ? (
          <div className="text-center space-y-5 py-8">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 mx-auto">
              <CheckCircle className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Submission Successful!</h2>
              <p className="text-sm text-zinc-400 mt-1">
                Your certificates have been uploaded successfully for <strong className="text-zinc-200">{form.title}</strong>.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-900 text-left space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Student</span>
                <span className="text-white font-medium">{studentName}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Roll Number</span>
                <span className="text-purple-400 font-mono font-bold">{rollNumber.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-500">Campaign</span>
                <span className="text-zinc-300">{form.title}</span>
              </div>
            </div>
            <button
              onClick={() => {
                setSubmitted(false);
                setStudentName("");
                setRollNumber("");
                setProjectName("");
                setFile1(null);
                setFile2(null);
                setFile3(null);
                setError("");
              }}
              className="inline-flex items-center gap-2 py-2.5 px-6 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-semibold text-zinc-300 hover:text-white rounded-xl transition-all duration-200"
            >
              <Send className="h-3.5 w-3.5" />
              Submit Another
            </button>
          </div>
        ) : (
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

          {/* Project Name (Optional) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-400 flex items-center justify-between">
              <span>Project Name</span>
              <span className="text-[10px] text-zinc-500 font-medium">Optional</span>
            </label>
            <input
              type="text"
              placeholder="e.g. CertSync Certificate Tracking System"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-950/60 border border-zinc-900 rounded-xl text-sm text-white placeholder-zinc-700 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition"
            />
          </div>

          {/* FILE UPLOAD GRID */}
          <div className="space-y-5 pt-3">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Upload Certificates (PDF or Image format, max 10MB)
              </h3>
              <div className="relative">
                <input
                  type="file"
                  id="multi-upload"
                  multiple
                  accept=".pdf,image/jpeg,image/png,image/jpg"
                  onChange={handleMultiFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('multi-upload')?.click()}
                  className="text-[10px] font-semibold text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors"
                >
                  Upload All 3 at once
                </button>
              </div>
            </div>

            {/* Cert 1 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400">Certificate Page 1 *</label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 bg-zinc-950/30 transition-all duration-200 cursor-pointer ${
                  dragOver1 ? "drop-zone-active border-purple-500 bg-purple-500/5" : "border-zinc-800 hover:border-zinc-700"
                } ${file1 ? "border-green-500/30 bg-green-500/5" : ""}`}
                onDrop={(e) => handleDrop(e, setFile1, setDragOver1)}
                onDragOver={(e) => handleDragOver(e, setDragOver1)}
                onDragLeave={(e) => handleDragLeave(e, setDragOver1)}
                onClick={(e) => {
                  if (e.target === e.currentTarget || (e.target as HTMLElement).tagName !== 'LABEL') {
                    document.getElementById('cert-1')?.click();
                  }
                }}
              >
                <input
                  type="file"
                  id="cert-1"
                  accept=".pdf,image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleFileChange(e, setFile1)}
                  className="hidden"
                />
                {file1 ? (
                  <>
                    <FileCheck className="h-10 w-10 text-green-500" />
                    <div className="text-center">
                      <p className="text-xs font-semibold text-white truncate max-w-[250px]">{file1.name}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{Math.round(file1.size / 1024)} KB</p>
                    </div>
                    <label htmlFor="cert-1" className="py-1 px-3 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white cursor-pointer transition select-none">
                      Change File
                    </label>
                  </>
                ) : (
                  <>
                    <UploadCloud className={`h-10 w-10 ${dragOver1 ? 'text-purple-400' : 'text-zinc-700'}`} />
                    <div className="text-center">
                      <p className="text-xs font-semibold text-white">{dragOver1 ? 'Drop file here' : 'Drag & drop or click to upload'}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">PDF or image file required (max 10MB)</p>
                    </div>
                    <label htmlFor="cert-1" className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 hover:border-zinc-700 text-[10px] font-bold text-zinc-400 hover:text-white cursor-pointer transition select-none">
                      Choose File
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Cert 2 */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400">Certificate Page 2 *</label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 bg-zinc-950/30 transition-all duration-200 cursor-pointer ${
                  dragOver2 ? "drop-zone-active border-purple-500 bg-purple-500/5" : "border-zinc-800 hover:border-zinc-700"
                } ${file2 ? "border-green-500/30 bg-green-500/5" : ""}`}
                onDrop={(e) => handleDrop(e, setFile2, setDragOver2)}
                onDragOver={(e) => handleDragOver(e, setDragOver2)}
                onDragLeave={(e) => handleDragLeave(e, setDragOver2)}
                onClick={(e) => {
                  if (e.target === e.currentTarget || (e.target as HTMLElement).tagName !== 'LABEL') {
                    document.getElementById('cert-2')?.click();
                  }
                }}
              >
                <input
                  type="file"
                  id="cert-2"
                  accept=".pdf,image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleFileChange(e, setFile2)}
                  className="hidden"
                />
                {file2 ? (
                  <>
                    <FileCheck className="h-10 w-10 text-green-500" />
                    <div className="text-center">
                      <p className="text-xs font-semibold text-white truncate max-w-[250px]">{file2.name}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{Math.round(file2.size / 1024)} KB</p>
                    </div>
                    <label htmlFor="cert-2" className="py-1 px-3 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white cursor-pointer transition select-none">
                      Change File
                    </label>
                  </>
                ) : (
                  <>
                    <UploadCloud className={`h-10 w-10 ${dragOver2 ? 'text-purple-400' : 'text-zinc-700'}`} />
                    <div className="text-center">
                      <p className="text-xs font-semibold text-white">{dragOver2 ? 'Drop file here' : 'Drag & drop or click to upload'}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">PDF or image file required (max 10MB)</p>
                    </div>
                    <label htmlFor="cert-2" className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 hover:border-zinc-700 text-[10px] font-bold text-zinc-400 hover:text-white cursor-pointer transition select-none">
                      Choose File
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Cert 3 (Optional) */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400">
                Company Certificate <span className="text-zinc-500 font-medium">(Optional)</span>
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 bg-zinc-950/30 transition-all duration-200 cursor-pointer ${
                  dragOver3 ? "drop-zone-active border-purple-500 bg-purple-500/5" : "border-zinc-800 hover:border-zinc-700"
                } ${file3 ? "border-purple-500/30 bg-purple-500/5" : ""}`}
                onDrop={(e) => handleDrop(e, setFile3, setDragOver3)}
                onDragOver={(e) => handleDragOver(e, setDragOver3)}
                onDragLeave={(e) => handleDragLeave(e, setDragOver3)}
                onClick={(e) => {
                  if (e.target === e.currentTarget || (e.target as HTMLElement).tagName !== 'LABEL') {
                    document.getElementById('cert-3')?.click();
                  }
                }}
              >
                <input
                  type="file"
                  id="cert-3"
                  accept=".pdf,image/jpeg,image/png,image/jpg"
                  onChange={(e) => handleFileChange(e, setFile3)}
                  className="hidden"
                />
                {file3 ? (
                  <>
                    <FileCheck className="h-10 w-10 text-purple-400" />
                    <div className="text-center">
                      <p className="text-xs font-semibold text-white truncate max-w-[250px]">{file3.name}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">{Math.round(file3.size / 1024)} KB</p>
                    </div>
                    <label htmlFor="cert-3" className="py-1 px-3 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white cursor-pointer transition select-none">
                      Change File
                    </label>
                  </>
                ) : (
                  <>
                    <UploadCloud className={`h-10 w-10 ${dragOver3 ? 'text-purple-400' : 'text-zinc-700'}`} />
                    <div className="text-center">
                      <p className="text-xs font-semibold text-white">{dragOver3 ? 'Drop file here' : 'Drag & drop or click to upload'}</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">PDF or image optional (max 10MB)</p>
                    </div>
                    <label htmlFor="cert-3" className="py-1.5 px-3 bg-zinc-900 hover:bg-zinc-800 rounded-lg border border-zinc-800 hover:border-zinc-700 text-[10px] font-bold text-zinc-400 hover:text-white cursor-pointer transition select-none">
                      Choose File
                    </label>
                  </>
                )}
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
        )}
      </div>

      <p className="text-center text-[10px] text-zinc-600">
        Developed for Kristu Jyoti College by INOVUS LABS IEDC
      </p>
    </div>
  );
}
