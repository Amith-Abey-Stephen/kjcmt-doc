import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/db";
import Form from "@/lib/models/Form";
import Submission from "@/lib/models/Submission";
import StudentList from "@/lib/models/StudentList";
import { uploadCertificate, deleteCertificate } from "@/lib/cloudinary";
import { logAction } from "@/lib/audit";

// GET handler to view submissions (for Faculty/Admin)
export async function GET(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const formId = searchParams.get("formId");
    const search = searchParams.get("search") || "";

    if (!formId) {
      return NextResponse.json({ error: "formId is required" }, { status: 400 });
    }

    // Verify form ownership
    const form = await Form.findById(formId);
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }
    const user = session.user as any;
    if (user.role !== "admin" && form.createdBy?.toString() !== user.id) {
      return NextResponse.json({ error: "Unauthorized. You do not own this form." }, { status: 403 });
    }

    // Build filter query
    const query: any = { formId };
    if (search) {
      query.$or = [
        { studentName: { $regex: search, $options: "i" } },
        { rollNumber: { $regex: search, $options: "i" } },
      ];
    }

    const submissions = await Submission.find(query).sort({ rollNumber: 1 });
    return NextResponse.json(submissions);
  } catch (error: any) {
    console.error("GET Submissions error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch submissions" }, { status: 500 });
  }
}

// POST handler for Student Submissions (Public)
export async function POST(req: Request) {
  try {
    await dbConnect();
    const formData = await req.formData();
    
    const formId = formData.get("formId") as string;
    const studentName = formData.get("studentName") as string;
    const rollNumber = formData.get("rollNumber") as string;
    const projectName = formData.get("projectName") as string | null;
    const programmeName = formData.get("programmeName") as string | null;
    const programmeCode = formData.get("programmeCode") as string | null;
    const projectType = formData.get("projectType") as string | null;
    const courseCode = formData.get("courseCode") as string | null;
    const yearOfOffering = formData.get("yearOfOffering") as string | null;
    const placeOfProject = formData.get("placeOfProject") as string | null;

    if (!formId || !studentName || !rollNumber) {
      return NextResponse.json({ error: "Missing formId, studentName, or rollNumber" }, { status: 400 });
    }

    // Check if form is active
    const form = await Form.findById(formId);
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const now = new Date();
    if (form.deadline && new Date(form.deadline) < now) {
      // Mark as expired if deadline passed
      if (form.status !== "expired") {
        form.status = "expired";
        await form.save();
      }
      return NextResponse.json({ error: "Submission deadline has passed. Form is closed." }, { status: 403 });
    }

    const file1 = formData.get("certificate1") as File | null;
    const file2 = formData.get("certificate2") as File | null;
    const file3 = formData.get("certificate3") as File | null; // Optional

    // Check if it is a resubmission or new submission
    const existingSubmission = await Submission.findOne({
      formId,
      rollNumber: rollNumber.trim().toUpperCase(),
    });

    // Check if required files are provided (only required if it's a new submission)
    if (!existingSubmission) {
      if (!file1 || !file2) {
        return NextResponse.json({ error: "Certificate Page 1 and Page 2 are required." }, { status: 400 });
      }
    }

    const maxFileSize = 10 * 1024 * 1024; // 10MB limit

    const validateFile = (file: File) => {
      const allowedMimes = ["application/pdf", "image/jpeg", "image/png"];
      const allowedExts = [".pdf", ".jpg", ".jpeg", ".png"];
      const hasAllowedMime = allowedMimes.includes(file.type);
      const hasAllowedExt = allowedExts.some((ext) => file.name.toLowerCase().endsWith(ext));

      if (!hasAllowedMime && !hasAllowedExt) {
        throw new Error(`File ${file.name} is not a valid PDF or image (JPEG/PNG).`);
      }
      if (file.size > maxFileSize) {
        throw new Error(`File ${file.name} exceeds the 10MB size limit.`);
      }
    };

    // Validate files if uploaded
    if (file1) validateFile(file1);
    if (file2) validateFile(file2);
    if (file3) validateFile(file3);

    // Upload helper closures
    const uploadFile = async (file: File, index: number) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      return uploadCertificate(buffer, formId, studentName, index);
    };

    let cert1Result = existingSubmission?.certificate1;
    let cert2Result = existingSubmission?.certificate2;
    let cert3Result = existingSubmission?.certificate3;

    // Delete old certificates in parallel
    await Promise.all([
      file1 && existingSubmission?.certificate1?.publicId
        ? deleteCertificate(existingSubmission.certificate1.publicId, existingSubmission.certificate1.url)
        : Promise.resolve(),
      file2 && existingSubmission?.certificate2?.publicId
        ? deleteCertificate(existingSubmission.certificate2.publicId, existingSubmission.certificate2.url)
        : Promise.resolve(),
      file3 && existingSubmission?.certificate3?.publicId
        ? deleteCertificate(existingSubmission.certificate3.publicId, existingSubmission.certificate3.url)
        : Promise.resolve(),
    ]);

    // Upload all new certificates in parallel
    const [up1, up2, up3] = await Promise.all([
      file1 ? uploadFile(file1, 1) : existingSubmission?.certificate1,
      file2 ? uploadFile(file2, 2) : existingSubmission?.certificate2,
      file3 ? uploadFile(file3, 3) : existingSubmission?.certificate3,
    ]);

    cert1Result = up1;
    cert2Result = up2;
    cert3Result = up3;

    let submission;
    if (existingSubmission) {
      // Update existing submission
      existingSubmission.studentName = studentName;
      existingSubmission.projectName = projectName ? projectName.trim() : undefined;
      existingSubmission.programmeName = programmeName ? programmeName.trim() : undefined;
      existingSubmission.programmeCode = programmeCode ? programmeCode.trim() : undefined;
      existingSubmission.projectType = projectType ? projectType.trim() : undefined;
      existingSubmission.courseCode = courseCode ? courseCode.trim() : undefined;
      existingSubmission.yearOfOffering = yearOfOffering ? yearOfOffering.trim() : undefined;
      existingSubmission.placeOfProject = placeOfProject ? placeOfProject.trim() : undefined;
      existingSubmission.certificate1 = cert1Result;
      existingSubmission.certificate2 = cert2Result;
      existingSubmission.certificate3 = cert3Result;
      existingSubmission.updatedAt = new Date();
      submission = await existingSubmission.save();

      await logAction(
        "Submission Received",
        `Student "${studentName}" (${rollNumber}) updated their submission for form "${form.title}"`,
        "Student (Public Form)"
      );
    } else {
      // Create new submission
      submission = await Submission.create({
        formId,
        studentName,
        rollNumber: rollNumber.trim().toUpperCase(),
        projectName: projectName ? projectName.trim() : undefined,
        programmeName: programmeName ? programmeName.trim() : undefined,
        programmeCode: programmeCode ? programmeCode.trim() : undefined,
        projectType: projectType ? projectType.trim() : undefined,
        courseCode: courseCode ? courseCode.trim() : undefined,
        yearOfOffering: yearOfOffering ? yearOfOffering.trim() : undefined,
        placeOfProject: placeOfProject ? placeOfProject.trim() : undefined,
        certificate1: cert1Result,
        certificate2: cert2Result,
        certificate3: cert3Result,
        submittedAt: new Date(),
        updatedAt: new Date(),
      });

      await logAction(
        "Submission Received",
        `Student "${studentName}" (${rollNumber}) submitted certificates for form "${form.title}"`,
        "Student (Public Form)"
      );
    }

    return NextResponse.json({
      message: "Submission successful",
      submission,
    }, { status: 201 });
  } catch (error: any) {
    console.error("POST Submission error:", error);
    return NextResponse.json({ error: error.message || "Failed to process submission" }, { status: 500 });
  }
}
