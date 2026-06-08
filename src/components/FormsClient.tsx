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
  AlertTriangle,
  Sparkles,
} from "lucide-react";

interface FormItem {
  id: string;
  title: string;
  description: string;
  department: string;
  batch: string;
  academicYear: string;
  deadline?: string | null;
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
  const [showGuide, setShowGuide] = useState(false);

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

      let data;
      const text = await res.text();
      try {
        data = JSON.parse(text);
      } catch {
        if (res.status === 413) {
          throw new Error("Upload failed: The spreadsheet file is too large.");
        }
        throw new Error(text || `Request failed with status code ${res.status}`);
      }

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
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-5 w-1 bg-purple-500 rounded-full" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Form Campaigns</span>
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input
              type="text"
              placeholder="Filter forms by course, title, or batch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-900/40 border border-zinc-900 rounded-xl text-base text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/35 transition"
            />
          </div>
        </div>

        <Link
          href="/dashboard/forms/create"
          className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl transition-all duration-200 shadow-lg shadow-purple-600/20 active:scale-95 whitespace-nowrap"
        >
          <Plus className="h-5 w-5 transition-transform group-hover:rotate-90" />
          <span>Create Form</span>
        </Link>
      </div>

      {/* Expandable Guide for non-techies/teachers */}
      <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-900/10">
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="w-full flex items-center justify-between px-6 py-4.5 text-left text-sm font-bold text-purple-400 hover:text-purple-350 bg-zinc-900/20 hover:bg-zinc-900/40 transition duration-200"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <span>New to the platform? Quick 4-Step Guide for Teachers & Faculty</span>
          </div>
          <span className="text-zinc-500 font-mono text-xs">
            {showGuide ? "Hide Guide [−]" : "Show Guide [+]"}
          </span>
        </button>

        {showGuide && (
          <div className="p-6 border-t border-zinc-900/60 bg-zinc-950/10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-in">
            <div className="space-y-1.5">
              <div className="h-6 w-6 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-[10px] font-black text-purple-400">1</div>
              <h4 className="text-sm font-bold text-white">1. Create a Form</h4>
              <p className="text-xs text-zinc-500 leading-normal">
                Click <strong>&quot;Create Form&quot;</strong> and fill in the details. This gives you a public link for students to submit certificates.
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="h-6 w-6 rounded-lg bg-green-500/10 border border-green-500/30 flex items-center justify-center text-[10px] font-black text-green-400">2</div>
              <h4 className="text-sm font-bold text-white">2. Upload Student Register</h4>
              <p className="text-xs text-zinc-500 leading-normal">
                Click <strong>&quot;Upload Excel&quot;</strong> on your form card. Upload a class list to track who has or hasn&apos;t submitted.
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="h-6 w-6 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-[10px] font-black text-blue-400">3</div>
              <h4 className="text-sm font-bold text-white">3. Share the Link</h4>
              <p className="text-xs text-zinc-500 leading-normal">
                Click <strong>&quot;Copy Link&quot;</strong> on the form and share it in your student group (WhatsApp/Email) for them to upload.
              </p>
            </div>
            <div className="space-y-1.5">
              <div className="h-6 w-6 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-400">4</div>
              <h4 className="text-sm font-bold text-white">4. View Submissions & Export</h4>
              <p className="text-xs text-zinc-500 leading-normal">
                Click <strong>&quot;View Submissions&quot;</strong> to view uploaded PDFs, track pending uploads, or download compiled spreadsheets/ZIPs.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Forms Listing Grid */}
      {filteredForms.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredForms.map((form, idx) => {
            const isExpired = form.deadline ? new Date(form.deadline) < new Date() : false;
            const expected = form.studentListCount;
            const progress = expected > 0 ? Math.round((form.submissionCount / expected) * 100) : 0;

            return (
              <div
                key={form.id}
                className="glass-card flex flex-col justify-between p-7 rounded-2xl bg-zinc-900/40 border border-zinc-900 hover:shadow-xl hover:shadow-purple-500/[0.03] transition-all duration-300 group animate-in"
                style={{ animationDelay: `${idx * 0.05}s` }}
              >
                {/* Meta Head */}
                <div className="space-y-1">
                  <div className="flex items-start justify-between">
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        isExpired
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : "bg-green-500/10 text-green-400 border border-green-500/20"
                      }`}
                    >
                      {isExpired ? "Expired" : "Active"}
                    </span>
                    <span className="text-xs text-zinc-400 font-semibold">{form.academicYear}</span>
                  </div>
                  <h3 className="text-base font-bold text-white pt-1 line-clamp-2 group-hover:text-purple-400 transition-colors">{form.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                    <Layers className="h-3.5 w-3.5 text-purple-400" />
                    <span>
                      {form.department} • Batch {form.batch}
                    </span>
                  </div>
                </div>

                {/* Submissions Stats and Progress bar */}
                <div className="my-6 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-500 font-medium">Submissions gathered:</span>
                    <span className="text-zinc-300 font-semibold">
                      {form.submissionCount} / {expected > 0 ? expected : "—"}
                    </span>
                  </div>

                  <div className="h-3 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        progress >= 100
                          ? "bg-green-500"
                          : "bg-gradient-to-r from-purple-500 to-indigo-500"
                      }`}
                      style={{ width: `${expected > 0 ? progress : 0}%` }}
                    />
                  </div>
                  {expected === 0 && (
                    <p className="text-xs text-yellow-500/80 font-semibold flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      No master student list uploaded
                    </p>
                  )}
                </div>

                {/* Deadline Info */}
                <div className="flex items-center gap-2 text-xs text-zinc-400 border-t border-zinc-900/60 pt-3 mb-4 font-semibold">
                  <Calendar className="h-4 w-4 text-zinc-500" />
                  <span>Deadline: {form.deadline ? new Date(form.deadline).toLocaleString() : "No deadline set"}</span>
                </div>

                {/* Interactive Action Triggers */}
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => handleCopyLink(form.id)}
                    className="group/btn inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-zinc-950 text-xs font-bold text-zinc-400 hover:text-white rounded-lg border border-zinc-900 transition-all hover:bg-zinc-900 hover:border-zinc-700 cursor-pointer"
                  >
                    {copiedId === form.id ? (
                      <>
                        <Check className="h-4 w-4 text-green-400" />
                        <span className="text-green-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveUploadFormId(form.id)}
                    className="group/btn inline-flex items-center justify-center gap-1.5 py-2.5 px-3 bg-zinc-950 text-xs font-bold text-zinc-400 hover:text-white rounded-lg border border-zinc-900 transition-all hover:bg-zinc-900 hover:border-zinc-700 cursor-pointer"
                  >
                    <FileSpreadsheet className="h-4 w-4 text-green-500/80" />
                    <span>Upload Excel</span>
                  </button>

                  <Link
                    href={`/dashboard/submissions?formId=${form.id}`}
                    className="col-span-2 group/btn inline-flex items-center justify-center gap-1.5 py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-xs font-extrabold text-white rounded-lg transition-all duration-200 active:scale-[0.98] shadow-md shadow-purple-600/15"
                  >
                    <FileText className="h-4 w-4" />
                    <span>View Submissions</span>
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
                  </Link>

                  <button
                    onClick={() => setActiveDeleteFormId(form.id)}
                    className="col-span-2 inline-flex items-center justify-center gap-1 py-2 text-[11px] font-bold text-zinc-600 hover:text-red-400 transition-colors hover:bg-red-500/5 rounded-lg cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-0.5" />
                    <span>Delete Collection Form</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card text-center p-12 rounded-2xl bg-zinc-900/10 border border-dashed border-zinc-800 group hover:border-purple-500/20 transition-all duration-300">
          <div className="h-14 w-14 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4 group-hover:border-purple-500/30 group-hover:bg-purple-500/5 transition-all duration-300">
            <FileText className="h-6 w-6 text-zinc-600 group-hover:text-purple-400 transition-colors" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-300">No collection forms found</h3>
          <p className="text-xs text-zinc-500 max-w-md mx-auto mt-1.5">
            Create a new form campaign or adjust your search filter to find existing collections.
          </p>
        </div>
      )}

      {/* EXCEL UPLOAD DIALOG SHEET */}
      {activeUploadFormId && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in">
          <div className="w-full max-w-md glass-card rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl relative animate-scale-in">
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
