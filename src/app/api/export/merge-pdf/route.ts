import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/db";
import Submission from "@/lib/models/Submission";
import StudentList from "@/lib/models/StudentList";
import Form from "@/lib/models/Form";
import { mergeAndCompressPdfs } from "@/lib/pdf";
import { logAction } from "@/lib/audit";

export async function GET(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const user = session.user as any;
    const { searchParams } = new URL(req.url);
    const formId = searchParams.get("formId");
    const sortMode = searchParams.get("sort") || "roll-asc"; // excel | roll-asc | roll-desc | name-asc
    const compression = (searchParams.get("compression") || "medium") as "low" | "medium" | "high";

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
    if (submissions.length === 0) {
      return new Response("No submissions found to merge.", { status: 400 });
    }

    // Apply Sorting Engine
    if (sortMode === "excel") {
      const masterList = await StudentList.find({ formId }).sort({ _id: 1 });
      const rollMap = new Map<string, number>();
      masterList.forEach((student, index) => {
        rollMap.set(student.rollNumber.toUpperCase(), index);
      });

      submissions.sort((a, b) => {
        const indexA = rollMap.has(a.rollNumber) ? rollMap.get(a.rollNumber)! : 999999;
        const indexB = rollMap.has(b.rollNumber) ? rollMap.get(b.rollNumber)! : 999999;
        if (indexA === indexB) {
          return a.rollNumber.localeCompare(b.rollNumber);
        }
        return indexA - indexB;
      });
    } else if (sortMode === "roll-asc") {
      submissions.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
    } else if (sortMode === "roll-desc") {
      submissions.sort((a, b) => b.rollNumber.localeCompare(a.rollNumber));
    } else if (sortMode === "name-asc") {
      submissions.sort((a, b) => a.studentName.localeCompare(b.studentName));
    }

    // Gather all PDF paths in order: certificate1 -> certificate2 -> certificate3 (if exists)
    const pdfPaths: string[] = [];
    submissions.forEach((sub) => {
      if (sub.certificate1?.url) pdfPaths.push(sub.certificate1.url);
      if (sub.certificate2?.url) pdfPaths.push(sub.certificate2.url);
      if (sub.certificate3?.url) pdfPaths.push(sub.certificate3.url);
    });

    if (pdfPaths.length === 0) {
      return new Response("No certificate file paths found to merge.", { status: 400 });
    }

    // Process PDF merging and compression
    const mergedPdfBuffer = await mergeAndCompressPdfs(pdfPaths, { compressionMode: compression });

    await logAction(
      "PDF Export Generated",
      `Merged PDF bundle generated for form "${form.title}" (${submissions.length} students, sorted by: ${sortMode}, compression: ${compression})`,
      session.user.email || "Faculty",
      user.id
    );

    // Return the response as a downloadable PDF stream
    return new Response(mergedPdfBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="Final_Certificate_Bundle.pdf"`,
        "Content-Length": String(mergedPdfBuffer.length),
      },
    });
  } catch (error: any) {
    console.error("PDF Merge endpoint error:", error);
    return new Response(`PDF Export Failed: ${error.message || error}`, { status: 500 });
  }
}
