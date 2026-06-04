"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Plus,
  Copy,
  Check,
  FileSpreadsheet,
  Trash2,
  Calendar,
  Layers,
  FileText,
  UploadCloud,
  X,
  Loader2,
  ExternalLink,
  ChevronRight,
} from "lucide-react";

interface FormItem {
  id: string;
  title: string;
  description: string;
  department: string;
  batch: string;
  academicYear: string;
  deadline: string;
  status: string;
  createdAt: string;
  submissionCount: number;
  studentListCount: number;
}

interface FormsClientProps {
  initialForms: FormItem[];
}

export default function FormsClient({ initialForms }: FormsClientProps) {
  const router = useRouter();
  const [forms, setForms] = useState<FormItem[]>(initialForms);
  const [searchTerm, setSearchTerm] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [activeUploadFormId, setActiveUploadFormId] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const [activeDeleteFormId, setActiveDeleteFormId] = useState<string | null>(null);
  const [deletingForm, setDeletingForm] = useState(false);

  // Copy share URL link to clipboard
  const handleCopyLink = (formId: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const publicUrl = `${origin}/form/${formId}`;
    navigator.clipboard.writeText(publicUrl);
    setCopiedId(formId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Excel file upload
  const handleExcelUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!activeUploadFormId) return;

    const formData = new FormData(e.currentTarget);
    const file = formData.get("file") as File;
    if (!file || file.size === 0) {
      setUploadError("Please select a valid Excel spreadsheet (.xlsx, .xls).");
      return;
    }

    setUploadingFile(true);
    setUploadError("");
    setUploadSuccess("");

    try {
      const res = await fetch(`/api/forms/${activeUploadFormId}/student-list`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to process spreadsheet.");
      }

      setUploadSuccess(data.message || `Successfully uploaded ${data.count} students.`);
      
      // Update form listing student count state locally
      setForms((prev) =>
        prev.map((f) =>
          f.id === activeUploadFormId ? { ...f, studentListCount: data.count } : f
        )
      );

      setTimeout(() => {
        setActiveUploadFormId(null);
        setUploadSuccess("");
      }, 1500);
    } catch (err: any) {
      setUploadError(err.message || "Spreadsheet upload failed.");
    } finally {
      setUploadingFile(false);
    }
  };

  // Form deletion
  const handleDeleteForm = async () => {
    if (!activeDeleteFormId) return;
    setDeletingForm(true);

    try {
      const res = await fetch(`/api/forms/${activeDeleteFormId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete form.");
      }

      setForms((prev) => prev.filter((f) => f.id !== activeDeleteFormId));
      setActiveDeleteFormId(null);
    } catch (err: any) {
      alert(err.message || "An error occurred during form deletion.");
    } finally {
      setDeletingForm(false);
    }
  };

  // Filter forms list
  const filteredForms = forms.filter(
    (form) =>
      form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      form.batch.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header and Search Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Filter forms by course, title, or batch..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900/40 border border-zinc-900 rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/35 transition"
          />
        </div>

        <Link
          href="/dashboard/forms/create"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition shadow-md shadow-purple-600/10 active:scale-95 whitespace-nowrap"
        >
          <Plus className="h-4 w-4" />
          <span>Create Form</span>
        </Link>
      </div>

      {/* Forms Listing Grid */}
      {filteredForms.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredForms.map((form) => {
            const isExpired = new Date(form.deadline) < new Date();
            const expected = form.studentListCount;
            const progress = expected > 0 ? Math.round((form.submissionCount / expected) * 100) : 0;

            return (
              <div
                key={form.id}
                className="glass-card flex flex-col justify-between p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 hover:shadow-xl hover:shadow-purple-500/[0.02]"
              >
                {/* Meta Head */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                        isExpired
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-green-500/10 text-green-400 border border-green-500/20"
                      }`}
                    >
                      {isExpired ? "Expired" : "Active"}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-semibold">{form.academicYear}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-white pt-1 line-clamp-1">{form.title}</h3>
                  <div className="flex items-center gap-1 text-[10px] text-zinc-400">
                    <Layers className="h-3 w-3 text-purple-400" />
                    <span>
                      {form.department} • Batch {form.batch}
                    </span>
                  </div>
                </div>

                {/* Submissions Stats and Progress bar */}
                <div className="my-5 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-medium">Submissions gathered:</span>
                    <span className="text-zinc-300 font-semibold">
                      {form.submissionCount} / {expected > 0 ? expected : "—"}
                    </span>
                  </div>

                  <div className="h-1.5 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        progress >= 100
                          ? "bg-green-500"
                          : "bg-gradient-to-r from-purple-500 to-indigo-500"
                      }`}
                      style={{ width: `${expected > 0 ? progress : 0}%` }}
                    />
                  </div>
                  {expected === 0 && (
                    <p className="text-[9px] text-yellow-500/80 font-medium">
                      ⚠️ No master student list uploaded.
                    </p>
                  )}
                </div>

                {/* Deadline Info */}
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 border-t border-zinc-900/60 pt-3 mb-4">
                  <Calendar className="h-3.5 w-3.5 text-zinc-600" />
                  <span>Deadline: {new Date(form.deadline).toLocaleString()}</span>
                </div>

                {/* Interactive Action Triggers */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleCopyLink(form.id)}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-950 text-[10px] font-semibold text-zinc-400 hover:text-white rounded-lg border border-zinc-900 transition hover:bg-zinc-900"
                  >
                    {copiedId === form.id ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-green-400" />
                        <span className="text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveUploadFormId(form.id)}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-zinc-950 text-[10px] font-semibold text-zinc-400 hover:text-white rounded-lg border border-zinc-900 transition hover:bg-zinc-900"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-green-500/80" />
                    <span>Upload Excel</span>
                  </button>

                  <Link
                    href={`/dashboard/submissions?formId=${form.id}`}
                    className="col-span-2 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-[10px] font-semibold text-white rounded-lg transition active:scale-98 shadow shadow-purple-600/10"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    <span>View Submissions</span>
                    <ChevronRight className="h-3 w-3" />
                  </Link>

                  <button
                    onClick={() => setActiveDeleteFormId(form.id)}
                    className="col-span-2 inline-flex items-center justify-center gap-1 py-1.5 text-[9px] text-zinc-600 hover:text-red-400 transition"
                  >
                    <Trash2 className="h-3 w-3 mr-0.5" />
                    <span>Delete Collection Form</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card text-center p-12 rounded-2xl bg-zinc-900/10 border border-dashed border-zinc-800">
          <FileText className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-300">No collection forms found</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1.5">
            Create a new form campaign or adjust your search filter to find existing collections.
          </p>
        </div>
      )}

      {/* EXCEL UPLOAD DIALOG SHEET */}
      {activeUploadFormId && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-card rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setActiveUploadFormId(null);
                setUploadError("");
                setUploadSuccess("");
              }}
              className="absolute right-4 top-4 p-1.5 text-zinc-500 hover:text-white rounded-lg hover:bg-zinc-800 transition"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="mb-5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <FileSpreadsheet className="h-4.5 w-4.5 text-green-500" />
                Upload Student Master List
              </h3>
              <p className="text-xs text-zinc-500 mt-1">
                Upload an Excel sheet to check student submission comparison details.
              </p>
            </div>

            <form onSubmit={handleExcelUpload} className="space-y-4">
              {uploadError && (
                <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/20 text-red-200 text-xs text-center">
                  {uploadError}
                </div>
              )}
              {uploadSuccess && (
                <div className="p-2.5 rounded-lg bg-green-950/40 border border-green-500/20 text-green-200 text-xs text-center">
                  {uploadSuccess}
                </div>
              )}

              <div className="border border-dashed border-zinc-800 rounded-xl p-6 text-center hover:border-purple-500/30 transition bg-zinc-950/40">
                <UploadCloud className="h-8 w-8 text-zinc-600 mx-auto mb-2" />
                <input
                  type="file"
                  name="file"
                  id="excel-file"
                  required
                  accept=".xlsx, .xls"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setUploadError("");
                      setUploadSuccess(`Selected: ${f.name}`);
                    }
                  }}
                />
                <label
                  htmlFor="excel-file"
                  className="text-xs text-zinc-400 font-semibold hover:text-white cursor-pointer hover:underline"
                >
                  Click to select spreadsheet (.xlsx)
                </label>
                <p className="text-[10px] text-zinc-600 mt-1">
                  Expected Columns: <code className="text-purple-400">Roll Number</code> | <code className="text-purple-400">Student Name</code>
                </p>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setActiveUploadFormId(null);
                    setUploadError("");
                    setUploadSuccess("");
                  }}
                  className="py-2 px-4 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-xl text-xs text-zinc-400 hover:text-white transition font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadingFile}
                  className="inline-flex items-center gap-1.5 py-2 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed rounded-xl text-xs text-white transition font-semibold"
                >
                  {uploadingFile ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      <span>Parsing spreadsheet...</span>
                    </>
                  ) : (
                    <>
                      <span>Upload & Map List</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETION CONFIRMATION DIALOG */}
      {activeDeleteFormId && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-card rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl relative">
            <div className="mb-4 text-center">
              <Trash2 className="h-10 w-10 text-red-500/80 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-white">Delete Collection Form?</h3>
              <p className="text-xs text-zinc-500 mt-1.5 leading-normal">
                This action is permanent. Deleting this form will delete the master student register, all student submissions, and purge all uploaded PDFs from storage.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={deletingForm}
                onClick={() => setActiveDeleteFormId(null)}
                className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-xl text-xs text-zinc-400 hover:text-white transition font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deletingForm}
                onClick={handleDeleteForm}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 rounded-xl text-xs text-white transition font-semibold flex items-center justify-center gap-1.5"
              >
                {deletingForm ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
