import React from "react";
import dbConnect from "@/lib/db";
import Form from "@/lib/models/Form";
import Submission from "@/lib/models/Submission";
import StudentList from "@/lib/models/StudentList";
import AuditLog from "@/lib/models/AuditLog";
import {
  Users,
  CheckCircle2,
  Clock,
  Percent,
  Plus,
  Calendar,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

async function getAnalyticsData() {
  await dbConnect();

  // Basic counts
  const totalForms = await Form.countDocuments();
  const totalSubmissions = await Submission.countDocuments();
  const totalMasterStudents = await StudentList.countDocuments();

  // If no master student list is uploaded yet, total expected is simply the submissions count
  const expectedTotal = totalMasterStudents > 0 ? totalMasterStudents : totalSubmissions;
  const pendingCount = expectedTotal - totalSubmissions > 0 ? expectedTotal - totalSubmissions : 0;
  const submissionPercentage = expectedTotal > 0 ? Math.round((totalSubmissions / expectedTotal) * 100) : 0;

  // Department statistics aggregation
  const deptStatsRaw = await Submission.aggregate([
    {
      $lookup: {
        from: "forms",
        localField: "formId",
        foreignField: "_id",
        as: "form",
      },
    },
    { $unwind: { path: "$form", preserveNullAndEmptyArrays: true } },
    {
      $group: {
        _id: "$form.department",
        count: { $sum: 1 },
      },
    },
  ]);

  const departmentStats = deptStatsRaw
    .map((item) => ({
      name: item._id || "Uncategorized",
      count: item.count,
    }))
    .filter((i) => i.name !== "Uncategorized");

  // Fetch recent forms
  const recentForms = await Form.find({}).sort({ createdAt: -1 }).limit(3);

  // Fetch recent audit logs for the timeline
  const recentLogs = await AuditLog.find({}).sort({ timestamp: -1 }).limit(5);

  return {
    totalForms,
    totalSubmissions,
    pendingCount,
    expectedTotal,
    submissionPercentage,
    departmentStats,
    recentForms,
    recentLogs,
  };
}

export default async function DashboardPage() {
  const data = await getAnalyticsData();

  // Fallback for departments if empty
  const displayDepts =
    data.departmentStats.length > 0
      ? data.departmentStats
      : [
          { name: "BCA", count: 0 },
          { name: "BBA", count: 0 },
          { name: "BSc", count: 0 },
          { name: "MCom", count: 0 },
        ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-900 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Dashboard</h1>
          <p className="text-zinc-500 text-xs mt-1">
            Real-time certificate collection progress for Kristu Jyoti College.
          </p>
        </div>
        <Link
          href="/dashboard/forms/create"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition duration-200 shadow-md shadow-purple-600/10 self-start md:self-auto active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Collection Form</span>
        </Link>
      </div>

      {/* METRIC CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Expected Students */}
        <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Total Registered</span>
            <h3 className="text-3xl font-extrabold text-white">{data.expectedTotal}</h3>
            <p className="text-[10px] text-zinc-600">Students across forms</p>
          </div>
          <div className="h-10 w-10 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        {/* Total Submissions */}
        <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Submitted</span>
            <h3 className="text-3xl font-extrabold text-white text-green-400">{data.totalSubmissions}</h3>
            <p className="text-[10px] text-zinc-600">Uploaded bundles</p>
          </div>
          <div className="h-10 w-10 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        {/* Pending Submissions */}
        <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Pending</span>
            <h3 className="text-3xl font-extrabold text-white text-yellow-500">{data.pendingCount}</h3>
            <p className="text-[10px] text-zinc-600">Awaiting certificates</p>
          </div>
          <div className="h-10 w-10 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
        </div>

        {/* Submission Percentage */}
        <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Submission Rate</span>
            <h3 className="text-3xl font-extrabold text-white text-purple-400">{data.submissionPercentage}%</h3>
            <p className="text-[10px] text-zinc-600">Completion ratio</p>
          </div>
          <div className="h-10 w-10 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center">
            <Percent className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* MID-GRID: CHARTS & DEPARTMENTS */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Department Stats */}
        <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Department Statistics</h3>
            <p className="text-[10px] text-zinc-500">Distribution of collected certificates by course</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {displayDepts.map((dept) => {
              const maxCount = Math.max(...displayDepts.map((d) => d.count), 1);
              const percentage = Math.round((dept.count / maxCount) * 100);

              return (
                <div key={dept.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-zinc-300">{dept.name}</span>
                    <span className="text-zinc-500 font-semibold">{dept.count} Submissions</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-950 rounded-full overflow-hidden border border-zinc-900">
                    <div
                      className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full transition-all duration-500"
                      style={{ width: `${dept.count === 0 ? 0 : Math.max(percentage, 5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submission Progress Chart Widget */}
        <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-white">Submission Progress</h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full">
                <TrendingUp className="h-3 w-3" />
                Active Campaigns
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 mb-4">Form collection progress rate overview</p>

            <div className="flex items-center justify-center py-6">
              <div className="relative h-32 w-32 flex items-center justify-center">
                {/* SVG circular progress ring */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="#18181b"
                    strokeWidth="10"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="52"
                    stroke="url(#purpleGrad)"
                    strokeWidth="10"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 52}
                    strokeDashoffset={2 * Math.PI * 52 * (1 - data.submissionPercentage / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <span className="text-2xl font-black text-white">{data.submissionPercentage}%</span>
                  <p className="text-[8px] uppercase tracking-wider text-zinc-500 mt-0.5">Complete</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-center text-[10px] text-zinc-500 border-t border-zinc-900 pt-3">
            {data.totalSubmissions} of {data.expectedTotal} expected certificates gathered
          </div>
        </div>
      </div>

      {/* LOWER GRID: RECENT FORMS & TIMELINE */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Forms */}
        <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Active Forms</h3>
              <p className="text-[10px] text-zinc-500">Recently published certificate collection forms</p>
            </div>
            <Link href="/dashboard/forms" className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="divide-y divide-zinc-900">
            {data.recentForms.length > 0 ? (
              data.recentForms.map((form) => (
                <div key={form._id.toString()} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-white hover:text-purple-400 transition">
                      <Link href={`/form/${form._id.toString()}`} target="_blank">{form.title}</Link>
                    </p>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                      <span>{form.department} | {form.batch}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-zinc-600" />
                        Deadline: {new Date(form.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${
                      form.status === "active"
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {form.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-zinc-500">
                No collection forms created yet. Click "New Collection Form" to start.
              </div>
            )}
          </div>
        </div>

        {/* Recent Audit timeline */}
        <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Activity Timeline</h3>
            <p className="text-[10px] text-zinc-500">System audit trails and recent actions</p>
          </div>

          <div className="space-y-4 relative before:absolute before:left-2 top-0 before:top-2 before:bottom-2 before:w-[1px] before:bg-zinc-800">
            {data.recentLogs.length > 0 ? (
              data.recentLogs.map((log) => (
                <div key={log._id.toString()} className="flex items-start gap-3 pl-6 relative">
                  {/* Timeline dot */}
                  <div className="absolute left-[3px] top-1.5 h-2 w-2 rounded-full bg-purple-500 ring-4 ring-zinc-950" />
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-white">{log.action}</p>
                    <p className="text-[10px] text-zinc-500 leading-normal">{log.details}</p>
                    <span className="text-[8px] text-zinc-600 block mt-0.5">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-zinc-500 pl-0 before:hidden">
                No system activity recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
