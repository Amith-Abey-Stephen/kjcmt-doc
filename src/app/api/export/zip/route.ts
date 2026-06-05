import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/db";
import Submission from "@/lib/models/Submission";
import StudentList from "@/lib/models/StudentList";
import Form from "@/lib/models/Form";
import { fetchPdfBuffer, getExtensionFromBuffer } from "@/lib/pdf";
import { logAction } from "@/lib/audit";
import archiver from "archiver";
import { PassThrough } from "stream";

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
    const exportType = searchParams.get("exportType") || "zip-bundle"; // zip-bundle | accreditation
    const sortMode = searchParams.get("sort") || "roll-asc"; // excel | roll-asc | roll-desc | name-asc

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
      return new Response("No submissions found to bundle.", { status: 400 });
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

    // Set up Archiver stream
    const archive = archiver("zip", { zlib: { level: 9 } });
    const passThrough = new PassThrough();
    archive.pipe(passThrough);

    // Run async zip appends in background, error will propagate to the stream
    (async () => {
      try {
        for (const sub of submissions) {
          const studentDirName = sub.studentName.replace(/[^a-zA-Z0-9\s-_]/g, "").trim();
          const rollNumber = sub.rollNumber.replace(/[^a-zA-Z0-9\s-_]/g, "").trim();

          // Define folder name in ZIP
          const folderName =
            exportType === "accreditation"
              ? `${rollNumber}_${studentDirName}`
              : studentDirName;

          // Certificate 1
          if (sub.certificate1?.url) {
            const buffer = await fetchPdfBuffer(sub.certificate1.url);
            const ext = getExtensionFromBuffer(buffer);
            const fileName =
              exportType === "accreditation"
                ? `Certificate_1.${ext}`
                : `${studentDirName.toLowerCase().replace(/\s+/g, "_")}_1.${ext}`;
            archive.append(buffer, { name: `${folderName}/${fileName}` });
          }

          // Certificate 2
          if (sub.certificate2?.url) {
            const buffer = await fetchPdfBuffer(sub.certificate2.url);
            const ext = getExtensionFromBuffer(buffer);
            const fileName =
              exportType === "accreditation"
                ? `Certificate_2.${ext}`
                : `${studentDirName.toLowerCase().replace(/\s+/g, "_")}_2.${ext}`;
            archive.append(buffer, { name: `${folderName}/${fileName}` });
          }

          // Certificate 3 (Optional)
          if (sub.certificate3?.url) {
            const buffer = await fetchPdfBuffer(sub.certificate3.url);
            const ext = getExtensionFromBuffer(buffer);
            const fileName =
              exportType === "accreditation"
                ? `Company.${ext}`
                : `${studentDirName.toLowerCase().replace(/\s+/g, "_")}_3.${ext}`;
            archive.append(buffer, { name: `${folderName}/${fileName}` });
          }
        }
        await archive.finalize();
      } catch (err) {
        console.error("ZIP building error:", err);
        archive.destroy(err as any);
      }
    })();

    await logAction(
      "ZIP Export Generated",
      `ZIP bundle (${exportType}) generated for form "${form.title}" (${submissions.length} students, sorted by: ${sortMode})`,
      session.user.email || "Faculty",
      user.id
    );

    return new Response(passThrough as any, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="Certificate_Bundle.zip"`,
      },
    });
  } catch (error: any) {
    console.error("ZIP bundle route error:", error);
    return new Response(`ZIP Generation Failed: ${error.message || error}`, { status: 500 });
  }
}
