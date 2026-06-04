"use client";

import React, { useState } from "react";
import {
  FileText,
  FolderArchive,
  GraduationCap,
  ArrowRightLeft,
  Sliders,
  DownloadCloud,
  ChevronDown,
  Loader2,
  CheckCircle,
  HelpCircle,
} from "lucide-react";

interface FormOption {
  id: string;
  title: string;
  department: string;
  batch: string;
}

interface ExportCenterClientProps {
  forms: FormOption[];
}

export default function ExportCenterClient({ forms }: ExportCenterClientProps) {
  const [selectedFormId, setSelectedFormId] = useState<string>(forms[0]?.id || "");
  const [exportMode, setExportMode] = useState<"pdf" | "zip" | "accreditation">("pdf");
  const [sortMode, setSortMode] = useState<"excel" | "roll-asc" | "roll-desc" | "name-asc">("roll-asc");
  const [compression, setCompression] = useState<"low" | "medium" | "high">("medium");
  const [compiling, setCompiling] = useState(false);

  const handleExport = () => {
    if (!selectedFormId) return;

    setCompiling(true);
    let downloadUrl = "";

    if (exportMode === "pdf") {
      downloadUrl = `/api/export/merge-pdf?formId=${selectedFormId}&sort=${sortMode}&compression=${compression}`;
    } else {
      const type = exportMode === "accreditation" ? "accreditation" : "zip-bundle";
      downloadUrl = `/api/export/zip?formId=${selectedFormId}&exportType=${type}&sort=${sortMode}`;
    }

    // Direct browser redirect trigger
    window.location.href = downloadUrl;

    // Simulate completion spinner reset after a few seconds
    setTimeout(() => {
      setCompiling(false);
    }, 4000);
  };

  const selectedForm = forms.find((f) => f.id === selectedFormId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="border-b border-zinc-900 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-white">Export Center</h1>
        <p className="text-zinc-500 text-xs mt-1">
          Compile and compress collected student certificates into accreditation-ready archives.
        </p>
      </div>

      {forms.length === 0 ? (
        <div className="glass-card text-center p-12 rounded-2xl bg-zinc-900/10 border border-dashed border-zinc-800">
          <DownloadCloud className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-zinc-300">No campaigns available</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-1.5">
            You must create a form campaign and collect submissions before utilizing the Export Center.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-3">
          {/* CONTROL PANELS */}
          <div className="md:col-span-2 space-y-6">
            {/* Step 1: Form Selection */}
            <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] font-bold text-purple-400">
                  1
                </span>
                Select Collection Campaign
              </h3>

              <div className="relative">
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                <select
                  value={selectedFormId}
                  onChange={(e) => setSelectedFormId(e.target.value)}
                  className="w-full appearance-none pl-4 pr-10 py-3 bg-zinc-950 border border-zinc-900 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 transition cursor-pointer"
                >
                  {forms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.title} ({f.batch} - {f.department})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Step 2: Choose Export Mode */}
            <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] font-bold text-purple-400">
                  2
                </span>
                Choose Export Layout Format
              </h3>

              <div className="grid gap-3 sm:grid-cols-3">
                {/* PDF Card */}
                <button
                  type="button"
                  onClick={() => setExportMode("pdf")}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between h-36 ${
                    exportMode === "pdf"
                      ? "bg-purple-600/10 border-purple-500 text-white shadow-lg shadow-purple-600/5"
                      : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-white"
                  }`}
                >
                  <FileText className={`h-5 w-5 ${exportMode === "pdf" ? "text-purple-400" : "text-zinc-500"}`} />
                  <div>
                    <p className="text-xs font-bold text-white leading-normal">Merged PDF</p>
                    <p className="text-[9px] text-zinc-500 mt-1 leading-normal">
                      One single large PDF arranged in student sequence.
                    </p>
                  </div>
                </button>

                {/* ZIP Folder Card */}
                <button
                  type="button"
                  onClick={() => setExportMode("zip")}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between h-36 ${
                    exportMode === "zip"
                      ? "bg-purple-600/10 border-purple-500 text-white shadow-lg shadow-purple-600/5"
                      : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-white"
                  }`}
                >
                  <FolderArchive className={`h-5 w-5 ${exportMode === "zip" ? "text-purple-400" : "text-zinc-500"}`} />
                  <div>
                    <p className="text-xs font-bold text-white leading-normal">ZIP Bundle</p>
                    <p className="text-[9px] text-zinc-500 mt-1 leading-normal">
                      Zipped folders containing renamed student files.
                    </p>
                  </div>
                </button>

                {/* Accreditation ZIP Mode Card */}
                <button
                  type="button"
                  onClick={() => setExportMode("accreditation")}
                  className={`p-4 rounded-xl border text-left transition flex flex-col justify-between h-36 ${
                    exportMode === "accreditation"
                      ? "bg-purple-600/10 border-purple-500 text-white shadow-lg shadow-purple-600/5"
                      : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:border-zinc-800 hover:text-white"
                  }`}
                >
                  <GraduationCap
                    className={`h-5 w-5 ${exportMode === "accreditation" ? "text-purple-400" : "text-zinc-500"}`}
                  />
                  <div>
                    <p className="text-xs font-bold text-white leading-normal">Accreditation (NAAC)</p>
                    <p className="text-[9px] text-zinc-500 mt-1 leading-normal">
                      Organized by RollNo_Name subfolders with unified filenames.
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Step 3: Choose Sorting Engine */}
            <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 space-y-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] font-bold text-purple-400">
                  3
                </span>
                Configure Sorting Sequence
              </h3>

              <div className="grid gap-2 sm:grid-cols-4">
                {[
                  { id: "excel", label: "Excel Registry Order" },
                  { id: "roll-asc", label: "Roll Number Asc" },
                  { id: "roll-desc", label: "Roll Number Desc" },
                  { id: "name-asc", label: "Student Name Asc" },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setSortMode(option.id as any)}
                    className={`py-2 px-3 border rounded-xl text-center text-[10px] font-semibold transition ${
                      sortMode === option.id
                        ? "bg-purple-600/10 border-purple-500 text-purple-400 shadow shadow-purple-500/5"
                        : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4 (Conditional): PDF Compression */}
            {exportMode === "pdf" && (
              <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] font-bold text-purple-400">
                    4
                  </span>
                  Set PDF Compression Level
                </h3>

                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      id: "low",
                      title: "Low Compression",
                      desc: "Fast build, normal quality.",
                    },
                    {
                      id: "medium",
                      title: "Medium Compression",
                      desc: "Object stream groupings.",
                    },
                    {
                      id: "high",
                      title: "High Compression",
                      desc: "Gzip stream compression.",
                    },
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => setCompression(lvl.id as any)}
                      className={`p-3 border rounded-xl text-left transition flex flex-col justify-between ${
                        compression === lvl.id
                          ? "bg-purple-600/10 border-purple-500 text-white shadow shadow-purple-500/5"
                          : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span className="text-[10px] font-bold text-white block">{lvl.title}</span>
                      <span className="text-[8px] text-zinc-500 mt-1 leading-normal">{lvl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* SIDE COMPILATION PROGRESS CARD */}
          <div className="space-y-6">
            <div className="glass-card p-6 rounded-2xl bg-zinc-900/45 border border-zinc-900 space-y-5 h-full flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white">Compilation Overview</h3>
                <p className="text-[10px] text-zinc-500 mt-1 leading-relaxed">
                  Ready to compile certificates. Verify parameters before exporting.
                </p>

                <div className="mt-4 pt-4 border-t border-zinc-900/80 space-y-2.5">
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-500">Form Campaign:</span>
                    <span className="font-semibold text-white truncate max-w-[120px]">
                      {selectedForm?.title}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-500">Output Type:</span>
                    <span className="font-bold text-purple-400 uppercase">
                      {exportMode === "pdf" ? "Merged PDF" : exportMode === "zip" ? "ZIP Archive" : "NAAC ZIP Folder"}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px]">
                    <span className="text-zinc-500">Sorting Engine:</span>
                    <span className="font-semibold text-white">
                      {sortMode === "excel"
                        ? "Excel order"
                        : sortMode === "roll-asc"
                        ? "Roll No Asc"
                        : sortMode === "roll-desc"
                        ? "Roll No Desc"
                        : "Name Asc"}
                    </span>
                  </div>
                  {exportMode === "pdf" && (
                    <div className="flex justify-between text-[10px]">
                      <span className="text-zinc-500">Compression Mode:</span>
                      <span className="font-semibold text-white uppercase">{compression}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-900/80 space-y-3">
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={compiling || !selectedFormId}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white font-semibold rounded-xl text-xs transition duration-200 shadow-lg shadow-purple-600/10 active:scale-98"
                >
                  {compiling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Compiling Archive...</span>
                    </>
                  ) : (
                    <>
                      <DownloadCloud className="h-4 w-4" />
                      <span>Compile & Download</span>
                    </>
                  )}
                </button>

                <p className="text-[8px] text-zinc-600 leading-normal text-center">
                  * Merged bundles with hundreds of students can take up to 10 seconds to generate. Please keep the window active.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
