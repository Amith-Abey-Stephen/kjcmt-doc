"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FileSpreadsheet,
  Download,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ChevronDown,
  BarChart,
  PieChart,
  Save,
} from "lucide-react";
import { StatsCardSkeleton, TableSkeleton } from "@/components/Skeleton";

interface FormOption {
  id: string;
  title: string;
  department: string;
  batch: string;
  academicYear?: string;
  programmeName?: string;
  programmeCode?: string;
  projectType?: string;
  courseCode?: string;
  yearOfOffering?: string;
  placeOfProject?: string;
}

interface SubmissionItem {
  _id: string;
  studentName: string;
  rollNumber: string;
  projectName?: string;
  programmeName?: string;
  programmeCode?: string;
  projectType?: string;
  courseCode?: string;
  yearOfOffering?: string;
  placeOfProject?: string;
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
  const [reportType, setReportType] = useState<"submission" | "missing" | "naac">("submission");
  const [showPendingOnly, setShowPendingOnly] = useState(false);

  // NAAC Form Fields
  const [programmeName, setProgrammeName] = useState("");
  const [programmeCode, setProgrammeCode] = useState("");
  const [projectType, setProjectType] = useState("Project Work");
  const [courseCode, setCourseCode] = useState("");
  const [yearOfOffering, setYearOfOffering] = useState("");
  const [placeOfProject, setPlaceOfProject] = useState("Kristu Jyoti College of Management and Technology");

  const selectedForm = forms.find((f) => f.id === selectedFormId);

  const [savingDefaults, setSavingDefaults] = useState(false);

  const handleSaveDefaults = async () => {
    if (!selectedFormId) return;
    setSavingDefaults(true);
    try {
      const res = await fetch(`/api/forms/${selectedFormId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          programmeName,
          programmeCode,
          projectType,
          courseCode,
          yearOfOffering,
          placeOfProject,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update template defaults");
      }

      alert("NAAC template defaults updated successfully in the database!");
      
      const fIdx = forms.findIndex(f => f.id === selectedFormId);
      if (fIdx > -1) {
        forms[fIdx].programmeName = programmeName;
        forms[fIdx].programmeCode = programmeCode;
        forms[fIdx].projectType = projectType;
        forms[fIdx].courseCode = courseCode;
        forms[fIdx].yearOfOffering = yearOfOffering;
        forms[fIdx].placeOfProject = placeOfProject;
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save defaults.");
    } finally {
      setSavingDefaults(false);
    }
  };

  useEffect(() => {
    if (selectedForm) {
      setProgrammeName(selectedForm.programmeName || selectedForm.department || "");
      setProgrammeCode(selectedForm.programmeCode || selectedForm.department || "");
      setProjectType(selectedForm.projectType || "Project Work");
      setCourseCode(selectedForm.courseCode || "");
      setYearOfOffering(selectedForm.yearOfOffering || selectedForm.academicYear || "");
      setPlaceOfProject(selectedForm.placeOfProject || "Kristu Jyoti College of Management and Technology");
    }
  }, [selectedFormId, selectedForm]);

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

  // Filtered submission rows (All or Pending Only)
  const filteredSubmissionRows = showPendingOnly
    ? submissionPreviewRows.filter((r) => r.status === "Pending")
    : submissionPreviewRows;

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

  // 3. NAAC specific preview records
  const naacPreviewRows = studentList.map((student) => {
    const sub = submissionMap.get(student.rollNumber.toUpperCase());
    return {
      programmeName: sub?.programmeName || programmeName || "—",
      programmeCode: sub?.programmeCode || programmeCode || "—",
      projectType: sub?.projectType || projectType || "—",
      courseCode: sub?.courseCode || courseCode || "—",
      yearOfOffering: sub?.yearOfOffering || yearOfOffering || "—",
      studentName: student.studentName,
      projectName: sub ? (sub.projectName || "—") : "—",
      placeOfProject: sub?.placeOfProject || placeOfProject || "—",
    };
  });

  submissions.forEach((sub) => {
    const roll = sub.rollNumber.toUpperCase();
    if (!masterRolls.has(roll)) {
      naacPreviewRows.push({
        programmeName: sub.programmeName || programmeName || "—",
        programmeCode: sub.programmeCode || programmeCode || "—",
        projectType: sub.projectType || projectType || "—",
        courseCode: sub.courseCode || courseCode || "—",
        yearOfOffering: sub.yearOfOffering || yearOfOffering || "—",
        studentName: `${sub.studentName} (Unregistered)`,
        projectName: sub.projectName || "—",
        placeOfProject: sub.placeOfProject || placeOfProject || "—",
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
    if (reportType === "naac") {
      const queryParams = new URLSearchParams({
        formId: selectedFormId,
        reportType: "naac",
        programmeName,
        programmeCode,
        projectType,
        courseCode,
        yearOfOffering,
        placeOfProject,
      });
      window.open(`/api/export/excel?${queryParams.toString()}`, "_blank");
    } else if (reportType === "submission" && showPendingOnly) {
      window.open(`/api/export/excel?formId=${selectedFormId}&reportType=pending`, "_blank");
    } else {
      window.open(`/api/export/excel?formId=${selectedFormId}&reportType=${reportType}`, "_blank");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Reports Engine</h1>
          <p className="text-zinc-500 text-xs mt-1">
            Preview and export campaign data.
          </p>
        </div>

        {/* Campaign selector */}
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
          Submission Status
        </button>
        <button
          onClick={() => setReportType("missing")}
          className={`px-5 py-3 text-xs font-semibold border-b-2 transition ${
            reportType === "missing"
              ? "border-purple-500 text-white bg-purple-500/[0.02]"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Missing Files
        </button>
        <button
          onClick={() => setReportType("naac")}
          className={`px-5 py-3 text-xs font-semibold border-b-2 transition ${
            reportType === "naac"
              ? "border-purple-500 text-white bg-purple-500/[0.02]"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          NAAC Report
        </button>
      </div>

      {/* TAB CONTENT */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <StatsCardSkeleton key={i} />
            ))}
          </div>
          <TableSkeleton rows={5} />
        </div>
      ) : (
        <>
          {/* SUBMISSION STATUS VIEW */}
          {reportType === "submission" && (
            <div className="space-y-5">
              {/* Campaign Overview */}
              <div className="glass-card p-5 rounded-2xl bg-zinc-900/40 border border-zinc-900">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
                  <span className="text-xs font-semibold text-zinc-300">Campaign Overview</span>
                  <PieChart className="h-4 w-4 text-purple-400" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-zinc-500">Total Class</span>
                    <p className="font-bold text-white">{totalExpected} students</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Submitted</span>
                    <p className="font-bold text-green-400">{submittedCount} uploads</p>
                  </div>
                  <div>
                    <span className="text-zinc-500">Pending</span>
                    <p className="font-bold text-yellow-500">{pendingCount} remaining</p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-900/60">
                  <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                    <span className="text-zinc-400">Completion Rate</span>
                    <span className="text-purple-400">{completionRate}%</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all duration-700"
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Filter + Export */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <button
                    onClick={() => setShowPendingOnly(false)}
                    className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition ${
                      !showPendingOnly
                        ? "bg-purple-600 text-white"
                        : "bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-900"
                    }`}
                  >
                    All Students
                  </button>
                  <button
                    onClick={() => setShowPendingOnly(true)}
                    className={`px-3 py-1.5 text-[11px] font-semibold rounded-lg transition ${
                      showPendingOnly
                        ? "bg-purple-600 text-white"
                        : "bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-900"
                    }`}
                  >
                    Pending Only
                  </button>
                </div>
                <button
                  onClick={handleExportExcel}
                  disabled={!selectedFormId || studentList.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-xs font-semibold text-white rounded-xl transition shadow shadow-purple-600/10 active:scale-95"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Export Excel (.xlsx)</span>
                  <Download className="h-3 w-3" />
                </button>
              </div>

              {/* Submission table */}
              <div className="glass-card rounded-2xl bg-zinc-900/20 border border-zinc-900 overflow-hidden">
                <div className="overflow-x-auto">
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
                      {filteredSubmissionRows.length > 0 ? (
                        filteredSubmissionRows.map((row, idx) => (
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
                            {showPendingOnly ? (
                              <span className="text-green-400"><CheckCircle className="h-5 w-5 inline-block mr-2" />All students have submitted!</span>
                            ) : (
                              "No students registry found to compile."
                            )}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MISSING FILES VIEW */}
          {reportType === "missing" && (
            <div className="space-y-5">
              {/* Missing Certificate Analysis Stats */}
              <div className="glass-card p-5 rounded-2xl bg-zinc-900/40 border border-zinc-900">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
                  <span className="text-xs font-semibold text-zinc-300">Missing Certificate Analysis</span>
                  <BarChart className="h-4 w-4 text-purple-400" />
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-sm bg-red-500 inline-block" />
                        Certificate Page 1
                      </span>
                      <span className="font-bold text-red-400">{missingCert1Count} students</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-950 rounded-full border border-zinc-900 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500/80 to-red-400 rounded-full transition-all duration-700"
                        style={{ width: `${totalExpected > 0 ? (missingCert1Count / totalExpected) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-sm bg-red-500 inline-block" />
                        Certificate Page 2
                      </span>
                      <span className="font-bold text-red-400">{missingCert2Count} students</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-950 rounded-full border border-zinc-900 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500/80 to-red-400 rounded-full transition-all duration-700"
                        style={{ width: `${totalExpected > 0 ? (missingCert2Count / totalExpected) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400 flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-sm bg-zinc-600 inline-block" />
                        Company Certificate (Optional)
                      </span>
                      <span className="font-bold text-zinc-500">{missingCert3Count} students</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-950 rounded-full border border-zinc-900 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-zinc-600 to-zinc-500 rounded-full transition-all duration-700"
                        style={{ width: `${totalExpected > 0 ? (missingCert3Count / totalExpected) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Export */}
              <div className="flex justify-end">
                <button
                  onClick={handleExportExcel}
                  disabled={!selectedFormId || studentList.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-xs font-semibold text-white rounded-xl transition shadow shadow-purple-600/10 active:scale-95"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Export Excel (.xlsx)</span>
                  <Download className="h-3 w-3" />
                </button>
              </div>

              {/* Missing files table */}
              <div className="glass-card rounded-2xl bg-zinc-900/20 border border-zinc-900 overflow-hidden">
                <div className="overflow-x-auto">
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
                              <span className={`font-semibold ${row.cert1 === "Uploaded" ? "text-green-400" : "text-red-400"}`}>{row.cert1}</span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`font-semibold ${row.cert2 === "Uploaded" ? "text-green-400" : "text-red-400"}`}>{row.cert2}</span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`font-semibold ${row.cert3 === "Uploaded" ? "text-green-400" : row.cert3 === "Not Provided" ? "text-zinc-500" : "text-red-400"}`}>{row.cert3}</span>
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
                </div>
              </div>
            </div>
          )}

          {/* NAAC VIEW */}
          {reportType === "naac" && (
            <div className="space-y-5">
              {/* NAAC Config */}
              <div className="glass-card p-5 rounded-2xl bg-zinc-900/40 border border-zinc-900">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-400">NAAC / Department Template Configuration</span>
                </div>
                <p className="text-[10px] text-zinc-500 mb-4">Configure program-wide static parameters. Student name and project title will dynamically map from individual submissions.</p>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400">Programme Name</label>
                    <input type="text" value={programmeName} onChange={(e) => setProgrammeName(e.target.value)} className="w-full px-3 py-2 bg-zinc-950/60 border border-zinc-900 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 transition" placeholder="e.g. Bachelor of Computer Applications" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400">Programme Code</label>
                    <input type="text" value={programmeCode} onChange={(e) => setProgrammeCode(e.target.value)} className="w-full px-3 py-2 bg-zinc-950/60 border border-zinc-900 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 transition" placeholder="e.g. BCA" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400">Project/Field Work/Internship</label>
                    <select value={projectType} onChange={(e) => setProjectType(e.target.value)} className="w-full px-3 py-2 bg-zinc-950/60 border border-zinc-900 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 transition cursor-pointer">
                      <option value="Project Work">Project Work</option>
                      <option value="Internship">Internship</option>
                      <option value="Field Work">Field Work</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400">Course Code</label>
                    <input type="text" value={courseCode} onChange={(e) => setCourseCode(e.target.value)} className="w-full px-3 py-2 bg-zinc-950/60 border border-zinc-900 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 transition" placeholder="e.g. BCA601" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400">Year of Offering</label>
                    <input type="text" value={yearOfOffering} onChange={(e) => setYearOfOffering(e.target.value)} className="w-full px-3 py-2 bg-zinc-950/60 border border-zinc-900 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 transition" placeholder="e.g. 2025-2026" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-400">Place of Project</label>
                    <input type="text" value={placeOfProject} onChange={(e) => setPlaceOfProject(e.target.value)} className="w-full px-3 py-2 bg-zinc-950/60 border border-zinc-900 rounded-lg text-xs text-white focus:outline-none focus:border-purple-500 transition" placeholder="e.g. Kristu Jyoti College" />
                  </div>
                </div>
                <div className="flex justify-end mt-4 pt-3 border-t border-zinc-900/60">
                  <button
                    onClick={handleSaveDefaults}
                    disabled={savingDefaults}
                    className="px-4 py-2 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 disabled:opacity-50 text-xs font-semibold text-purple-400 rounded-lg transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{savingDefaults ? "Saving..." : "Save Template Defaults"}</span>
                  </button>
                </div>
              </div>

              {/* Export */}
              <div className="flex justify-end">
                <button
                  onClick={handleExportExcel}
                  disabled={!selectedFormId || studentList.length === 0}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-xs font-semibold text-white rounded-xl transition shadow shadow-purple-600/10 active:scale-95"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  <span>Export Excel (.xlsx)</span>
                  <Download className="h-3 w-3" />
                </button>
              </div>

              {/* NAAC table */}
              <div className="glass-card rounded-2xl bg-zinc-900/20 border border-zinc-900 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-900 bg-zinc-950/40 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                        <th className="py-4 px-4">Programme Name</th>
                        <th className="py-4 px-4">Programme Code</th>
                        <th className="py-4 px-4">Project/Field Work/Internship</th>
                        <th className="py-4 px-4">Course Code</th>
                        <th className="py-4 px-4">Year of Offering</th>
                        <th className="py-4 px-4">Name of Student</th>
                        <th className="py-4 px-4">Title of Project</th>
                        <th className="py-4 px-4">Place of Project</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-900/60 text-xs text-zinc-300">
                      {naacPreviewRows.length > 0 ? (
                        naacPreviewRows.map((row, idx) => (
                          <tr key={`naac-${idx}`} className="hover:bg-zinc-900/20 transition">
                            <td className="py-4 px-4 font-medium text-white max-w-[150px] truncate" title={row.programmeName}>{row.programmeName}</td>
                            <td className="py-4 px-4 text-purple-400 font-bold">{row.programmeCode}</td>
                            <td className="py-4 px-4 text-zinc-400">{row.projectType}</td>
                            <td className="py-4 px-4 text-zinc-400 font-mono">{row.courseCode}</td>
                            <td className="py-4 px-4 text-zinc-500">{row.yearOfOffering}</td>
                            <td className="py-4 px-4 font-semibold text-white">{row.studentName}</td>
                            <td className="py-4 px-4 text-purple-300 font-medium max-w-[200px] truncate" title={row.projectName}>{row.projectName}</td>
                            <td className="py-4 px-4 text-zinc-400 max-w-[150px] truncate" title={row.placeOfProject}>{row.placeOfProject}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="text-center py-12 text-zinc-500 font-medium bg-zinc-900/10">
                            No student submissions found to compile.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
