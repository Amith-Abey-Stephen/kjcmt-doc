"use client";

import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";
import {
  CheckCircle,
  FileText,
  Clock,
  Printer,
  ChevronLeft,
  Calendar,
  Layers,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

interface FormMeta {
  id: string;
  title: string;
  department: string;
  batch: string;
  academicYear: string;
}

interface SubmissionReceipt {
  id: string;
  studentName: string;
  rollNumber: string;
  submittedAt: string;
  certificate1: { url: string };
  certificate2: { url: string };
  certificate3: { url: string } | null;
}

interface StudentReceiptProps {
  form: FormMeta;
  submission: SubmissionReceipt;
}

export default function StudentReceipt({ form, submission }: StudentReceiptProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const verificationUrl = `${origin}/form/${form.id}/receipt?rollNumber=${submission.rollNumber}`;
      
      QRCode.toCanvas(
        canvasRef.current,
        verificationUrl,
        {
          width: 120,
          margin: 1,
          color: {
            dark: "#09090b", // zinc-950 dark color
            light: "#ffffff", // clean white background
          },
        },
        (error) => {
          if (error) console.error("QR Code render error:", error);
        }
      );
    }
  }, [form.id, submission.rollNumber]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Main ticket card */}
      <div className="glass-card rounded-2xl bg-zinc-900/40 border border-zinc-900 overflow-hidden shadow-2xl relative print:bg-white print:text-black print:border-none print:shadow-none">
        {/* Confirmed Banner */}
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-b border-zinc-900/50 p-6 text-center space-y-2 print:bg-none print:border-b print:border-gray-200">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-green-400 print:text-green-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white print:text-black uppercase tracking-wider">
              Submission Confirmed
            </h2>
            <p className="text-[10px] text-zinc-500 print:text-gray-600">
              Receipt ID: <code className="font-mono text-purple-400 print:text-purple-600 font-bold">{submission.id.substring(0, 8)}</code>
            </p>
          </div>
        </div>

        {/* Info detail block */}
        <div className="p-6 space-y-4">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Campaign Name</span>
            <h3 className="text-xs font-semibold text-white print:text-black leading-snug">{form.title}</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-zinc-900/60 pt-4 print:border-gray-100">
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Student Name</span>
              <p className="text-xs font-bold text-white print:text-black">{submission.studentName}</p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Roll Number</span>
              <p className="text-xs font-mono font-bold text-purple-400 print:text-purple-600">
                {submission.rollNumber}
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Course / Batch</span>
              <p className="text-xs text-zinc-300 print:text-gray-700">
                {form.department} • Batch {form.batch}
              </p>
            </div>
            <div className="space-y-0.5">
              <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Submission Date</span>
              <p className="text-xs text-zinc-300 print:text-gray-700 flex items-center gap-1">
                <Clock className="h-3 w-3 text-zinc-500" />
                {new Date(submission.submittedAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Files grid */}
          <div className="space-y-2 border-t border-zinc-900/60 pt-4 print:border-gray-100">
            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider block mb-1">
              Verified Certificates Pages
            </span>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/40 border border-zinc-900/80 text-[10px] print:border-gray-200">
                <span className="text-zinc-300 print:text-gray-700 flex items-center gap-1.5 font-medium">
                  <FileText className="h-3.5 w-3.5 text-red-500" />
                  Certificate Page 1
                </span>
                <span className="text-green-500 font-bold uppercase tracking-wider text-[8px]">Verified</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/40 border border-zinc-900/80 text-[10px] print:border-gray-200">
                <span className="text-zinc-300 print:text-gray-700 flex items-center gap-1.5 font-medium">
                  <FileText className="h-3.5 w-3.5 text-red-500" />
                  Certificate Page 2
                </span>
                <span className="text-green-500 font-bold uppercase tracking-wider text-[8px]">Verified</span>
              </div>
              {submission.certificate3 && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/40 border border-zinc-900/80 text-[10px] print:border-gray-200">
                  <span className="text-zinc-300 print:text-gray-700 flex items-center gap-1.5 font-medium">
                    <FileText className="h-3.5 w-3.5 text-purple-400" />
                    Company Certificate
                  </span>
                  <span className="text-green-500 font-bold uppercase tracking-wider text-[8px]">Verified</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ticket dashed divider decoration */}
        <div className="relative h-px border-t border-dashed border-zinc-800/80 my-2 print:border-gray-200">
          <div className="absolute -left-3 -top-2.5 h-5 w-5 bg-zinc-950 rounded-full border-r border-zinc-900/30 print:hidden" />
          <div className="absolute -right-3 -top-2.5 h-5 w-5 bg-zinc-950 rounded-full border-l border-zinc-900/30 print:hidden" />
        </div>

        {/* Ticket Footer (QR Section) */}
        <div className="p-6 bg-zinc-950/30 flex items-center justify-between gap-6 print:bg-white print:border-none">
          <div className="space-y-1">
            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider">Verification Sign</span>
            <p className="text-[9px] text-zinc-500 leading-normal">
              Scan this QR code to load the verification receipt details.
            </p>
          </div>
          <div className="bg-white p-1.5 rounded-lg flex-shrink-0 border border-zinc-900/80 print:border-gray-200">
            <canvas ref={canvasRef} />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 print:hidden">
        <Link
          href={`/form/${form.id}`}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-xs font-semibold text-zinc-400 hover:text-white rounded-xl transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>New Upload</span>
        </Link>
        <button
          onClick={handlePrint}
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 bg-purple-600 hover:bg-purple-700 text-xs font-semibold text-white rounded-xl transition active:scale-95 shadow shadow-purple-600/10"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>Print Receipt</span>
        </button>
      </div>
    </div>
  );
}
