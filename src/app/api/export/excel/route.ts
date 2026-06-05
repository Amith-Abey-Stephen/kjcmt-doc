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

    const user = session.user as any;
    const { searchParams } = new URL(req.url);
    const formId = searchParams.get("formId");
    const reportType = searchParams.get("reportType") || "submission"; // submission | missing | pending | naac

    if (!formId) {
      return new Response("formId is required", { status: 400 });
    }

    const form = await Form.findById(formId);
    if (!form) {
      return new Response("Form not found", { status: 404 });
    }
    if (user.role !== "admin" && form.createdBy?.toString() !== user.id) {
      return new Response("Unauthorized. You do not own this form.", { status: 403 });
    }

    const submissions = await Submission.find({ formId });
    const masterList = await StudentList.find({ formId }).sort({ rollNumber: 1 });

    const submissionMap = new Map<string, any>();
    submissions.forEach((sub) => {
      submissionMap.set(sub.rollNumber.toUpperCase(), sub);
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "KJCMT DOC Platform";
    workbook.created = new Date();

    const worksheet = workbook.addWorksheet(
      reportType === "submission" ? "Submission Report"
      : reportType === "pending" ? "Pending List"
      : "Missing File Report"
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
        { header: "Project Name", key: "projectName", width: 30 },
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
          projectName: sub ? (sub.projectName || "—") : "—",
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
            projectName: sub.projectName || "—",
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
    } else if (reportType === "pending") {
      // 2. PENDING LIST REPORT (only students who haven't submitted)
      worksheet.columns = [
        { header: "Roll Number", key: "rollNumber", width: 15 },
        { header: "Student Name", key: "studentName", width: 25 },
        { header: "Status", key: "status", width: 15 },
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
        if (submissionMap.has(roll)) return;

        const row = worksheet.addRow({
          rollNumber: student.rollNumber,
          studentName: student.studentName,
          status: "Pending",
        });

        row.eachCell((cell) => {
          cell.border = borderStyle;
          cell.alignment = { vertical: "middle" };
        });

        row.getCell("status").font = { color: { argb: "FFB45309" }, bold: true };
      });
    } else if (reportType === "naac") {
      // 3. NAAC SPECIFIC EXPORT
      const pName = searchParams.get("programmeName") || form.programmeName || form.department || "BCA";
      const pCode = searchParams.get("programmeCode") || form.programmeCode || "BCA";
      const projType = searchParams.get("projectType") || form.projectType || "Project/Field Work/Internship";
      const cCode = searchParams.get("courseCode") || form.courseCode || "BCA601";
      const yOffering = searchParams.get("yearOfOffering") || form.yearOfOffering || form.academicYear || "2025-2026";
      const plProject = searchParams.get("placeOfProject") || form.placeOfProject || "Kristu Jyoti College of Management and Technology";

      // Merging A1 to H2 for Title
      worksheet.mergeCells("A1:H2");
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "LIST OF STUDENTS UNDERTAKING THE FIELD PROJECTS/INTERNSHIP/PROGRAM-WISE IN THE LAST COMPLETED ACADEMIC YEAR ALONG WITH THE DETAILS OF TITLE, PLACE OF WORK ETC";
      titleCell.font = { name: "Arial", size: 10, bold: true };
      titleCell.alignment = { wrapText: true, horizontal: "center", vertical: "middle" };
      titleCell.border = {
        top: { style: "medium" },
        left: { style: "medium" },
        bottom: { style: "medium" },
        right: { style: "medium" },
      };

      // Empty separator row 3
      worksheet.addRow([]);

      // Define NAAC Columns
      worksheet.columns = [
        { header: "Programme Name", key: "programmeName", width: 25 },
        { header: "Programme Code", key: "programmeCode", width: 15 },
        { header: "Project/Field Work/Internship", key: "projectType", width: 25 },
        { header: "Course Code", key: "courseCode", width: 15 },
        { header: "Year of Offering", key: "yearOfOffering", width: 18 },
        { header: "Name of Student", key: "studentName", width: 28 },
        { header: "Title of Project", key: "projectName", width: 35 },
        { header: "Place of Project", key: "placeOfProject", width: 30 },
      ];

      // Format Table Headers at row 4
      const naacHeaderRow = worksheet.getRow(4);
      naacHeaderRow.height = 30;
      naacHeaderRow.eachCell((cell) => {
        cell.font = { name: "Arial", size: 10, bold: true };
        cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFF3F4F6" }, // Light grey background
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      // Populate NAAC rows
      const processedRolls = new Set<string>();

      masterList.forEach((student) => {
        const roll = student.rollNumber.toUpperCase();
        processedRolls.add(roll);
        const sub = submissionMap.get(roll);

        const row = worksheet.addRow({
          programmeName: sub?.programmeName || pName || "—",
          programmeCode: sub?.programmeCode || pCode || "—",
          projectType: sub?.projectType || projType || "Project Work",
          courseCode: sub?.courseCode || cCode || "—",
          yearOfOffering: sub?.yearOfOffering || yOffering || "—",
          studentName: student.studentName,
          projectName: sub ? (sub.projectName || "—") : "—",
          placeOfProject: sub?.placeOfProject || plProject || "—",
        });

        row.eachCell((cell) => {
          cell.border = {
            top: { style: "thin" },
            left: { style: "thin" },
            bottom: { style: "thin" },
            right: { style: "thin" },
          };
          cell.alignment = { vertical: "middle", wrapText: true };
        });
      });

      // Add unregistered submissions
      submissions.forEach((sub) => {
        const roll = sub.rollNumber.toUpperCase();
        if (!processedRolls.has(roll)) {
          const row = worksheet.addRow({
            programmeName: pName,
            programmeCode: pCode,
            projectType: projType,
            courseCode: cCode,
            yearOfOffering: yOffering,
            studentName: `${sub.studentName} (Unregistered)`,
            projectName: sub.projectName || "—",
            placeOfProject: plProject,
          });

          row.eachCell((cell) => {
            cell.border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
            cell.alignment = { vertical: "middle", wrapText: true };
          });
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
      session.user.email || "Faculty",
      user.id
    );

    const filename =
      reportType === "naac"
        ? `${form.title.replace(/\s+/g, "_")}_NAAC_Project_Report.xlsx`
        : reportType === "submission"
        ? `${form.title.replace(/\s+/g, "_")}_Submission_Report.xlsx`
        : reportType === "pending"
        ? `${form.title.replace(/\s+/g, "_")}_Pending_List.xlsx`
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
