import { NextRequest } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/db";
import Form from "@/lib/models/Form";
import Submission from "@/lib/models/Submission";
import StudentList from "@/lib/models/StudentList";
import ExcelJS from "exceljs";
import { logAction } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const formId = searchParams.get("formId");
    const reportType = searchParams.get("reportType") || "submission"; // submission | missing

    if (!formId) {
      return new Response("formId is required", { status: 400 });
    }

    const form = await Form.findById(formId);
    if (!form) {
      return new Response("Form not found", { status: 404 });
    }

    const submissions = await Submission.find({ formId });
    const masterList = await StudentList.find({ formId }).sort({ rollNumber: 1 });

    const submissionMap = new Map<string, any>();
    submissions.forEach((sub) => {
      submissionMap.set(sub.rollNumber.toUpperCase(), sub);
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "CertSync Platform";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(
      reportType === "submission" ? "Submission Report" : "Missing File Report"
    );

    // Style helper definitions
    const headerStyle = {
      font: { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF4F46E5" }, // Indigo primary theme
      } as ExcelJS.Fill,
      alignment: { vertical: "middle", horizontal: "center" } as ExcelJS.Alignment,
      border: {
        bottom: { style: "medium", color: { argb: "FF1E1B4B" } },
      } as ExcelJS.Borders,
    };

    const borderStyle = {
      top: { style: "thin", color: { argb: "FFE2E8F0" } },
      left: { style: "thin", color: { argb: "FFE2E8F0" } },
      bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
      right: { style: "thin", color: { argb: "FFE2E8F0" } },
    } as ExcelJS.Borders;

    if (reportType === "submission") {
      // 1. SUBMISSION REPORT
      worksheet.columns = [
        { header: "Roll Number", key: "rollNumber", width: 15 },
        { header: "Student Name", key: "studentName", width: 25 },
        { header: "Status", key: "status", width: 15 },
        { header: "Submitted At", key: "submittedAt", width: 25 },
      ];

      // Format Header Row
      const headerRow = worksheet.getRow(1);
      headerRow.height = 25;
      headerRow.eachCell((cell) => {
        cell.font = headerStyle.font;
        cell.fill = headerStyle.fill;
        cell.alignment = headerStyle.alignment;
        cell.border = headerStyle.border;
      });

      // Populate Data Rows
      // Loop over master registry first, and fallback to remaining submissions that were unregistered
      const processedRolls = new Set<string>();

      masterList.forEach((student) => {
        const roll = student.rollNumber.toUpperCase();
        processedRolls.add(roll);
        const sub = submissionMap.get(roll);

        const row = worksheet.addRow({
          rollNumber: student.rollNumber,
          studentName: student.studentName,
          status: sub ? "Submitted" : "Pending",
          submittedAt: sub ? new Date(sub.submittedAt).toLocaleString() : "—",
        });

        row.eachCell((cell) => {
          cell.border = borderStyle;
          cell.alignment = { vertical: "middle" };
        });

        const statusCell = row.getCell("status");
        if (sub) {
          statusCell.font = { color: { argb: "FF15803D" }, bold: true }; // Green
        } else {
          statusCell.font = { color: { argb: "FFB45309" }, bold: true }; // Orange
        }
      });

      // Append unregistered student rows
      submissions.forEach((sub) => {
        const roll = sub.rollNumber.toUpperCase();
        if (!processedRolls.has(roll)) {
          const row = worksheet.addRow({
            rollNumber: sub.rollNumber,
            studentName: `${sub.studentName} (Unregistered)`,
            status: "Submitted",
            submittedAt: new Date(sub.submittedAt).toLocaleString(),
          });
          row.eachCell((cell) => {
            cell.border = borderStyle;
            cell.alignment = { vertical: "middle" };
          });
          row.getCell("status").font = { color: { argb: "FF15803D" }, bold: true };
        }
      });
    } else {
      // 2. MISSING FILE REPORT
      worksheet.columns = [
        { header: "Roll Number", key: "rollNumber", width: 15 },
        { header: "Student Name", key: "studentName", width: 25 },
        { header: "Certificate Page 1", key: "cert1", width: 22 },
        { header: "Certificate Page 2", key: "cert2", width: 22 },
        { header: "Company Certificate", key: "cert3", width: 22 },
      ];

      const headerRow = worksheet.getRow(1);
      headerRow.height = 25;
      headerRow.eachCell((cell) => {
        cell.font = headerStyle.font;
        cell.fill = headerStyle.fill;
        cell.alignment = headerStyle.alignment;
        cell.border = headerStyle.border;
      });

      masterList.forEach((student) => {
        const roll = student.rollNumber.toUpperCase();
        const sub = submissionMap.get(roll);

        const row = worksheet.addRow({
          rollNumber: student.rollNumber,
          studentName: student.studentName,
          cert1: sub ? "Uploaded" : "Missing Certificate",
          cert2: sub ? "Uploaded" : "Missing Certificate",
          cert3: sub ? (sub.certificate3?.url ? "Uploaded" : "Not Provided") : "Missing Certificate",
        });

        row.eachCell((cell, colNum) => {
          cell.border = borderStyle;
          cell.alignment = { vertical: "middle" };
          
          if (colNum > 2) {
            if (cell.value === "Uploaded") {
              cell.font = { color: { argb: "FF15803D" }, bold: true };
            } else if (cell.value === "Not Provided") {
              cell.font = { color: { argb: "FF64748B" } };
            } else {
              cell.font = { color: { argb: "FFB91C1C" }, bold: true };
            }
          }
        });
      });

      // Unregistered submissions
      submissions.forEach((sub) => {
        const roll = sub.rollNumber.toUpperCase();
        const isInMaster = masterList.some((s) => s.rollNumber.toUpperCase() === roll);
        if (!isInMaster) {
          const row = worksheet.addRow({
            rollNumber: sub.rollNumber,
            studentName: `${sub.studentName} (Unregistered)`,
            cert1: "Uploaded",
            cert2: "Uploaded",
            cert3: sub.certificate3?.url ? "Uploaded" : "Not Provided",
          });
          row.eachCell((cell, colNum) => {
            cell.border = borderStyle;
            cell.alignment = { vertical: "middle" };
            if (colNum > 2) {
              if (cell.value === "Uploaded") {
                cell.font = { color: { argb: "FF15803D" }, bold: true };
              } else {
                cell.font = { color: { argb: "FF64748B" } };
              }
            }
          });
        }
      });
    }

    // Write excel workbook into buffer stream
    const excelBuffer = await workbook.xlsx.writeBuffer();

    await logAction(
      "Report Generated",
      `Excel report (${reportType}) downloaded for campaign "${form.title}"`,
      session.user.email || "Faculty"
    );

    const filename =
      reportType === "submission"
        ? `${form.title.replace(/\s+/g, "_")}_Submission_Report.xlsx`
        : `${form.title.replace(/\s+/g, "_")}_Missing_Files_Report.xlsx`;

    return new Response(excelBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Excel generation error:", error);
    return new Response(`Excel Generation Failed: ${error.message || error}`, { status: 500 });
  }
}
