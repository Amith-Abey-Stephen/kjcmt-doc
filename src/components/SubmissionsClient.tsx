"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Trash2,
  Calendar,
  AlertTriangle,
  UserCheck,
  UserX,
  FileDown,
  Loader2,
  ArrowRightLeft,
  ChevronDown,
  Users,
  Grid,
} from "lucide-react";

interface FormOption {
  id: string;
  title: string;
  department: string;
  batch: string;
}

interface SubmissionItem {
  _id: string;
  studentName: string;
  rollNumber: string;
  certificate1: { url: string; publicId: string };
  certificate2: { url: string; publicId: string };
  certificate3?: { url: string; publicId: string };
  submittedAt: string;
}

interface StudentListItem {
  _id: string;
  studentName: string;
  rollNumber: string;
}

interface SubmissionsClientProps {
  forms: FormOption[];
}

export default function SubmissionsClient({ forms }: SubmissionsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formIdParam = searchParams.get("formId");

  const [selectedFormId, setSelectedFormId] = useState<string>(formIdParam || (forms[0]?.id ?? ""));
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [studentList, setStudentList] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"list" | "comparison">("list");
  
  // Deletion state
  const [subToDelete, setSubToDelete] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch submissions and student list
  const fetchData = useCallback(async (formId: string) => {
    if (!formId) return;
    setLoading(true);
    try {
      // Fetch submissions
      const subRes = await fetch(`/api/submissions?formId=${formId}`);
      const subData = await subRes.json();
      if (subRes.ok) setSubmissions(subData);

      // Fetch student list
      const listRes = await fetch(`/api/forms/${formId}/student-list`);
      const listData = await listRes.json();
      if (listRes.ok) setStudentList(listData);
    } catch (err) {
      console.error("Error fetching submissions:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedFormId);
    
    // Update URL query param to match state
    const params = new URLSearchParams(window.location.search);
    if (selectedFormId) {
      params.set("formId", selectedFormId);
    } else {
      params.delete("formId");
    }
    router.replace(`/dashboard/submissions?${params.toString()}`);
  }, [selectedFormId, fetchData, router]);

  const handleDelete = async () => {
    if (!subToDelete) return;
    setDeleting(true);

    try {
      const res = await fetch(`/api/submissions/${subToDelete}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete submission.");
      }

      setSubmissions((prev) => prev.filter((s) => s._id !== subToDelete));
      setSubToDelete(null);
    } catch (err: any) {
      alert(err.message || "An error occurred.");
    } finally {
      setDeleting(false);
    }
  };

  // Filter submissions by search query
  const filteredSubmissions = submissions.filter(
    (sub) =>
      sub.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Comparison Engine Logic
  const getComparisonData = () => {
    const submissionRolls = new Set(submissions.map((s) => s.rollNumber.toUpperCase()));

    const submitted: StudentListItem[] = [];
    const pending: StudentListItem[] = [];

    studentList.forEach((student) => {
      if (submissionRolls.has(student.rollNumber.toUpperCase())) {
        submitted.push(student);
      } else {
        pending.push(student);
      }
    });

    // Submissions that are NOT in the master list
    const masterRolls = new Set(studentList.map((s) => s.rollNumber.toUpperCase()));
    const unregistered = submissions.filter(
      (sub) => !masterRolls.has(sub.rollNumber.toUpperCase())
    );

    return { submitted, pending, unregistered };
  };

  const { submitted, pending, unregistered } = getComparisonData();

  return (
    <div className="space-y-6">
      {/* Selector and Search */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Submissions</h1>
          <p className="text-zinc-500 text-xs mt-1">
            Track student uploads and compare them against class registers.
          </p>
        </div>

        {/* Dropdown Form Campaign Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            <select
              value={selectedFormId}
              onChange={(e) => setSelectedFormId(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2.5 bg-zinc-900/60 border border-zinc-900 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition cursor-pointer"
            >
              {forms.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title} ({f.batch} - {f.department})
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 pl-9 pr-4 py-2.5 bg-zinc-900/40 border border-zinc-900 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition"
            />
          </div>
        </div>
      </div>

      {/* METRIC SUMMARIES */}
      {selectedFormId && (
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="glass-card p-5 rounded-2xl border border-zinc-900/80 bg-zinc-900/10 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Total Expected</span>
              <h4 className="text-xl font-bold text-white">{studentList.length}</h4>
            </div>
            <Users className="h-8 w-8 text-blue-500/20" />
          </div>

          <div className="glass-card p-5 rounded-2xl border border-zinc-900/80 bg-zinc-900/10 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Submitted Bundle</span>
              <h4 className="text-xl font-bold text-green-400">{submissions.length}</h4>
            </div>
            <UserCheck className="h-8 w-8 text-green-500/20" />
          </div>

          <div className="glass-card p-5 rounded-2xl border border-zinc-900/80 bg-zinc-900/10 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Pending List</span>
              <h4 className="text-xl font-bold text-yellow-500">{pending.length}</h4>
            </div>
            <UserX className="h-8 w-8 text-yellow-500/20" />
          </div>
        </div>
      )}

      {/* TAB SELECTOR */}
      <div className="flex border-b border-zinc-900">
        <button
          onClick={() => setActiveTab("list")}
          className={`px-5 py-3 text-xs font-semibold border-b-2 transition duration-200 ${
            activeTab === "list"
              ? "border-purple-500 text-white bg-purple-500/[0.02]"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Submissions List ({filteredSubmissions.length})
        </button>
        <button
          onClick={() => setActiveTab("comparison")}
          className={`px-5 py-3 text-xs font-semibold border-b-2 transition duration-200 flex items-center gap-1.5 ${
            activeTab === "comparison"
              ? "border-purple-500 text-white bg-purple-500/[0.02]"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <ArrowRightLeft className="h-3.5 w-3.5" />
          <span>Comparison Engine</span>
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-purple-500" />
          <span className="text-xs text-zinc-500">Querying submission database...</span>
        </div>
      ) : activeTab === "list" ? (
        /* TABLE LIST TAB */
        <div className="glass-card rounded-2xl bg-zinc-900/20 border border-zinc-900 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950/40 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                  <th className="py-4 px-6">Roll Number</th>
                  <th className="py-4 px-6">Student Name</th>
                  <th className="py-4 px-6">Submitted Date</th>
                  <th className="py-4 px-6">Certificates Uploaded</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60 text-xs text-zinc-300">
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((sub) => (
                    <tr key={sub._id} className="hover:bg-zinc-900/30 transition">
                      <td className="py-4 px-6 font-mono font-bold text-purple-400">
                        {sub.rollNumber}
                      </td>
                      <td className="py-4 px-6 font-medium text-white">{sub.studentName}</td>
                      <td className="py-4 px-6 text-zinc-500">
                        {new Date(sub.submittedAt).toLocaleDateString()} at{" "}
                        {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <a
                            href={sub.certificate1.url}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded text-[10px] font-semibold text-zinc-400 hover:text-white transition"
                          >
                            <FileText className="h-3 w-3 text-red-500" />
                            Page 1
                          </a>
                          <a
                            href={sub.certificate2.url}
                            target="_blank"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded text-[10px] font-semibold text-zinc-400 hover:text-white transition"
                          >
                            <FileText className="h-3 w-3 text-red-500" />
                            Page 2
                          </a>
                          {sub.certificate3?.url ? (
                            <a
                              href={sub.certificate3.url}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded text-[10px] font-semibold text-zinc-400 hover:text-white transition"
                            >
                              <FileText className="h-3 w-3 text-purple-400" />
                              Company
                            </a>
                          ) : (
                            <span className="text-[9px] text-zinc-600 font-semibold px-2">No Company Cert</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSubToDelete(sub._id)}
                          className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                          title="Delete submission"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-zinc-500 font-medium bg-zinc-900/10">
                      No matching student submissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* COMPARISON ENGINE TAB */
        <div className="space-y-6">
          {studentList.length === 0 && (
            <div className="p-4 rounded-xl bg-yellow-950/30 border border-yellow-500/20 text-yellow-300 text-xs flex gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
              <div>
                <p className="font-semibold">No Master Student List Uploaded</p>
                <p className="mt-1 text-[11px] text-yellow-500/80 leading-normal">
                  To view comparison stats, upload the class spreadsheet using the **Forms** list first.
                </p>
              </div>
            </div>
          )}

          {/* Warning for Unregistered Students */}
          {unregistered.length > 0 && (
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-500/20 text-red-200 text-xs space-y-2">
              <div className="flex gap-2 items-center font-bold">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span>Unregistered Submissions Detected ({unregistered.length})</span>
              </div>
              <p className="text-[10px] text-red-400/80 leading-normal">
                The following students submitted certificates but their Roll Numbers do not exist in the master Excel list. They may have typed wrong roll numbers.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {unregistered.map((un) => (
                  <span
                    key={un._id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-950 border border-zinc-900 text-[10px] rounded-lg font-mono"
                  >
                    <code className="text-red-400 font-bold">{un.rollNumber}</code>
                    <span className="text-zinc-400 font-medium">({un.studentName})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {/* SUBMITTED LIST PANEL */}
            <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                <UserCheck className="h-4.5 w-4.5 text-green-400" />
                <h3 className="text-sm font-semibold text-white">Submitted ({submitted.length})</h3>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {submitted.length > 0 ? (
                  submitted.map((item) => (
                    <div
                      key={item._id}
                      className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-900 flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-white">{item.studentName}</p>
                        <p className="text-[10px] font-mono text-purple-400 font-bold">{item.rollNumber}</p>
                      </div>
                      <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-600 text-center py-6">No students have submitted yet.</p>
                )}
              </div>
            </div>

            {/* PENDING LIST PANEL */}
            <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 space-y-4">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                <UserX className="h-4.5 w-4.5 text-yellow-500" />
                <h3 className="text-sm font-semibold text-white">Pending Submission ({pending.length})</h3>
              </div>

              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {pending.length > 0 ? (
                  pending.map((item) => (
                    <div
                      key={item._id}
                      className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-900 flex items-center justify-between"
                    >
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-white">{item.studentName}</p>
                        <p className="text-[10px] font-mono text-zinc-500 font-bold">{item.rollNumber}</p>
                      </div>
                      <span className="inline-flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-600 text-center py-6">All students have submitted!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      {subToDelete && (
        <div className="fixed inset-0 bg-zinc-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm glass-card rounded-2xl bg-zinc-900 border border-zinc-800 p-6 shadow-2xl relative">
            <div className="mb-4 text-center">
              <Trash2 className="h-10 w-10 text-red-500/80 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-white">Delete Student Submission?</h3>
              <p className="text-xs text-zinc-500 mt-1.5 leading-normal">
                Are you sure you want to delete this submission? This will purge the student's certificates from Cloudinary/local storage.
              </p>
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setSubToDelete(null)}
                className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 rounded-xl text-xs text-zinc-400 hover:text-white transition font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 rounded-xl text-xs text-white transition font-semibold flex items-center justify-center gap-1.5"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <span>Purge Submission</span>
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
