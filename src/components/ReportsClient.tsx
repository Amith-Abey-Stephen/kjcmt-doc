"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileSpreadsheet,
  Download,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
  FileText,
  ChevronDown,
  BarChart,
  PieChart,
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
  certificate1: { url: string };
  certificate2: { url: string };
  certificate3?: { url: string };
  submittedAt: string;
}

interface StudentListItem {
  _id: string;
  studentName: string;
  rollNumber: string;
}

interface ReportsClientProps {
  forms: FormOption[];
}

export default function ReportsClient({ forms }: ReportsClientProps) {
  const [selectedFormId, setSelectedFormId] = useState<string>(forms[0]?.id || "");
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [studentList, setStudentList] = useState<StudentListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState<"submission" | "missing">("submission");

  const fetchData = useCallback(async (formId: string) => {
    if (!formId) return;
    setLoading(true);
    try {
      const subRes = await fetch(`/api/submissions?formId=${formId}`);
      const subData = await subRes.json();
      if (subRes.ok) setSubmissions(subData);

      const listRes = await fetch(`/api/forms/${formId}/student-list`);
      const listData = await listRes.json();
      if (listRes.ok) setStudentList(listData);
    } catch (err) {
      console.error("Error fetching report raw data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(selectedFormId);
  }, [selectedFormId, fetchData]);

  // Compute reports in-memory for live preview & statistics
  const submissionMap = new Map<string, SubmissionItem>();
  submissions.forEach((s) => submissionMap.set(s.rollNumber.toUpperCase(), s));

  // 1. Submission status preview records
  const submissionPreviewRows = studentList.map((student) => {
    const sub = submissionMap.get(student.rollNumber.toUpperCase());
    return {
      rollNumber: student.rollNumber,
      studentName: student.studentName,
      status: sub ? "Submitted" : "Pending",
      date: sub ? new Date(sub.submittedAt).toLocaleDateString() : "—",
    };
  });

  // Include unregistered submissions in the list
  const masterRolls = new Set(studentList.map((s) => s.rollNumber.toUpperCase()));
  submissions.forEach((sub) => {
    const roll = sub.rollNumber.toUpperCase();
    if (!masterRolls.has(roll)) {
      submissionPreviewRows.push({
        rollNumber: sub.rollNumber,
        studentName: `${sub.studentName} (Unregistered)`,
        status: "Submitted",
        date: new Date(sub.submittedAt).toLocaleDateString(),
      });
    }
  });

  // 2. Missing files preview records
  const missingFilesRows = studentList.map((student) => {
    const sub = submissionMap.get(student.rollNumber.toUpperCase());
    return {
      rollNumber: student.rollNumber,
      studentName: student.studentName,
      cert1: sub ? "Uploaded" : "Missing",
      cert2: sub ? "Uploaded" : "Missing",
      cert3: sub ? (sub.certificate3?.url ? "Uploaded" : "Not Provided") : "Missing",
    };
  });

  submissions.forEach((sub) => {
    const roll = sub.rollNumber.toUpperCase();
    if (!masterRolls.has(roll)) {
      missingFilesRows.push({
        rollNumber: sub.rollNumber,
        studentName: `${sub.studentName} (Unregistered)`,
        cert1: "Uploaded",
        cert2: "Uploaded",
        cert3: sub.certificate3?.url ? "Uploaded" : "Not Provided",
      });
    }
  });

  // Calculate statistics
  const totalExpected = studentList.length;
  const submittedCount = submissions.length;
  const pendingCount = totalExpected - submittedCount > 0 ? totalExpected - submittedCount : 0;
  const completionRate = totalExpected > 0 ? Math.round((submittedCount / totalExpected) * 100) : 0;

  // Missing files counts
  let missingCert1Count = 0;
  let missingCert2Count = 0;
  let missingCert3Count = 0; // optional, but we check if not provided by those who submitted

  studentList.forEach((student) => {
    const sub = submissionMap.get(student.rollNumber.toUpperCase());
    if (!sub) {
      missingCert1Count++;
      missingCert2Count++;
      missingCert3Count++;
    } else {
      if (!sub.certificate1?.url) missingCert1Count++;
      if (!sub.certificate2?.url) missingCert2Count++;
      if (!sub.certificate3?.url) missingCert3Count++;
    }
  });

  const handleExportExcel = () => {
    if (!selectedFormId) return;
    window.open(`/api/export/excel?formId=${selectedFormId}&reportType=${reportType}`, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Reports Engine</h1>
          <p className="text-zinc-500 text-xs mt-1">
            Generate and export accreditation-ready Excel sheets.
          </p>
        </div>

        {/* Dropdown selector */}
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

          <button
            onClick={handleExportExcel}
            disabled={loading || !selectedFormId || studentList.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-xs font-semibold text-white rounded-xl transition shadow shadow-purple-600/10 active:scale-95"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Excel (.xlsx)</span>
            <Download className="h-3 w-3" />
          </button>
        </div>
      </div>

      {studentList.length === 0 && !loading && (
        <div className="p-4 rounded-xl bg-yellow-950/30 border border-yellow-500/20 text-yellow-300 text-xs flex gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
          <div>
            <p className="font-semibold">Student Master Register Empty</p>
            <p className="mt-1 text-[11px] text-yellow-500/80 leading-normal">
              Reports require a student list. Go to the **Forms** section and upload an Excel list for this campaign.
            </p>
          </div>
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      {selectedFormId && !loading && (
        <div className="grid gap-6 md:grid-cols-3">
          {/* Submission Rate Chart Card */}
          <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-xs font-semibold text-zinc-300">Campaign Overview</span>
              <PieChart className="h-4 w-4 text-purple-400" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Total Registered Class:</span>
              <span className="font-bold text-white">{totalExpected} students</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Bundles Collected:</span>
              <span className="font-bold text-green-400">{submittedCount} uploads</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500">Pending Submissions:</span>
              <span className="font-bold text-yellow-500">{pendingCount} remaining</span>
            </div>
            <div className="pt-2 border-t border-zinc-900/60 flex items-center justify-between text-xs font-semibold">
              <span className="text-zinc-400">Total Completion Rate:</span>
              <span className="text-purple-400">{completionRate}%</span>
            </div>
          </div>

          {/* Missing Files Stats Card */}
          <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 space-y-4 md:col-span-2">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
              <span className="text-xs font-semibold text-zinc-300">Missing Certificate Analysis</span>
              <BarChart className="h-4 w-4 text-purple-400" />
            </div>

            <div className="space-y-3.5 pt-1">
              {/* Progress 1 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Missing Certificate Page 1</span>
                  <span className="font-bold text-red-400">{missingCert1Count} students</span>
                </div>
                <div className="h-2 w-full bg-zinc-950 rounded-full border border-zinc-900 overflow-hidden">
                  <div
                    className="h-full bg-red-500/80 rounded-full"
                    style={{ width: `${totalExpected > 0 ? (missingCert1Count / totalExpected) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Progress 2 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Missing Certificate Page 2</span>
                  <span className="font-bold text-red-400">{missingCert2Count} students</span>
                </div>
                <div className="h-2 w-full bg-zinc-950 rounded-full border border-zinc-900 overflow-hidden">
                  <div
                    className="h-full bg-red-500/80 rounded-full"
                    style={{ width: `${totalExpected > 0 ? (missingCert2Count / totalExpected) * 100 : 0}%` }}
                  />
                </div>
              </div>

              {/* Progress 3 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Missing Company Certificate (Optional)</span>
                  <span className="font-bold text-zinc-500">{missingCert3Count} students</span>
                </div>
                <div className="h-2 w-full bg-zinc-950 rounded-full border border-zinc-900 overflow-hidden">
                  <div
                    className="h-full bg-zinc-700 rounded-full"
                    style={{ width: `${totalExpected > 0 ? (missingCert3Count / totalExpected) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REPORT SWITCHER TAB */}
      <div className="flex border-b border-zinc-900">
        <button
          onClick={() => setReportType("submission")}
          className={`px-5 py-3 text-xs font-semibold border-b-2 transition ${
            reportType === "submission"
              ? "border-purple-500 text-white bg-purple-500/[0.02]"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Submission Status Report Preview
        </button>
        <button
          onClick={() => setReportType("missing")}
          className={`px-5 py-3 text-xs font-semibold border-b-2 transition ${
            reportType === "missing"
              ? "border-purple-500 text-white bg-purple-500/[0.02]"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Missing Files Audit Preview
        </button>
      </div>

      {/* PREVIEW CONTAINER */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-purple-500" />
          <span className="text-xs text-zinc-500">Compiling report preview...</span>
        </div>
      ) : (
        <div className="glass-card rounded-2xl bg-zinc-900/20 border border-zinc-900 overflow-hidden">
          <div className="overflow-x-auto">
            {reportType === "submission" ? (
              /* SUBMISSION PREVIEW TABLE */
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950/40 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    <th className="py-4 px-6">Roll Number</th>
                    <th className="py-4 px-6">Student Name</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Submitted Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 text-xs text-zinc-300">
                  {submissionPreviewRows.length > 0 ? (
                    submissionPreviewRows.map((row, idx) => (
                      <tr key={`${row.rollNumber}-${idx}`} className="hover:bg-zinc-900/20 transition">
                        <td className="py-4 px-6 font-mono font-bold text-purple-400">{row.rollNumber}</td>
                        <td className="py-4 px-6 font-medium text-white">{row.studentName}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                              row.status === "Submitted"
                                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                                : "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"
                            }`}
                          >
                            {row.status === "Submitted" ? (
                              <>
                                <CheckCircle className="h-3 w-3" />
                                <span>Submitted</span>
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3" />
                                <span>Pending</span>
                              </>
                            )}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-zinc-500">{row.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-12 text-zinc-500 font-medium bg-zinc-900/10">
                        No students registry found to compile.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              /* MISSING FILES PREVIEW TABLE */
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-900 bg-zinc-950/40 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                    <th className="py-4 px-6">Roll Number</th>
                    <th className="py-4 px-6">Student Name</th>
                    <th className="py-4 px-6">Certificate Page 1</th>
                    <th className="py-4 px-6">Certificate Page 2</th>
                    <th className="py-4 px-6">Company Certificate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/60 text-xs text-zinc-300">
                  {missingFilesRows.length > 0 ? (
                    missingFilesRows.map((row, idx) => (
                      <tr key={`${row.rollNumber}-${idx}`} className="hover:bg-zinc-900/20 transition">
                        <td className="py-4 px-6 font-mono font-bold text-purple-400">{row.rollNumber}</td>
                        <td className="py-4 px-6 font-medium text-white">{row.studentName}</td>
                        <td className="py-4 px-6">
                          <span
                            className={`font-semibold ${
                              row.cert1 === "Uploaded" ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {row.cert1}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`font-semibold ${
                              row.cert2 === "Uploaded" ? "text-green-400" : "text-red-400"
                            }`}
                          >
                            {row.cert2}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className={`font-semibold ${
                              row.cert3 === "Uploaded"
                                ? "text-green-400"
                                : row.cert3 === "Not Provided"
                                ? "text-zinc-500"
                                : "text-red-400"
                            }`}
                          >
                            {row.cert3}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-zinc-500 font-medium bg-zinc-900/10">
                        No students registry found to compile.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
