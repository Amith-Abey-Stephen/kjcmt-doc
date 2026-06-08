import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/db";
import Form from "@/lib/models/Form";
import { logAction } from "@/lib/audit";

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);

    let forms;
    if (session?.user) {
      const user = session.user as any;
      if (user.role === "admin") {
        // Admin sees all forms
        forms = await Form.find({}).sort({ createdAt: -1 });
      } else {
        // Faculty sees only their own forms
        forms = await Form.find({ createdBy: user.id }).sort({ createdAt: -1 });
      }
    } else {
      // Unauthenticated sees active forms only
      forms = await Form.find({ status: "active" }).sort({ createdAt: -1 });
    }

    return NextResponse.json(forms);
  } catch (error: any) {
    console.error("GET Forms error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch forms" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      description,
      department,
      batch,
      academicYear,
      deadline,
      programmeName,
      programmeCode,
      projectType,
      courseCode,
      yearOfOffering,
      placeOfProject,
      askProgrammeName,
      askProgrammeCode,
      askProjectType,
      askCourseCode,
      askYearOfOffering,
      askPlaceOfProject,
    } = body;

    if (!title || !department || !batch || !academicYear) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const form = await Form.create({
      title,
      description,
      department,
      batch,
      academicYear,
      deadline: deadline ? new Date(deadline) : undefined,
      createdBy: (session.user as any).id,
      status: (deadline && new Date(deadline) < new Date()) ? "expired" : "active",
      programmeName: programmeName || undefined,
      programmeCode: programmeCode || undefined,
      projectType: projectType || undefined,
      courseCode: courseCode || undefined,
      yearOfOffering: yearOfOffering || undefined,
      placeOfProject: placeOfProject || undefined,
      askProgrammeName: !!askProgrammeName,
      askProgrammeCode: !!askProgrammeCode,
      askProjectType: !!askProjectType,
      askCourseCode: !!askCourseCode,
      askYearOfOffering: !!askYearOfOffering,
      askPlaceOfProject: !!askPlaceOfProject,
    });

    await logAction(
      "Form Created",
      `Form "${title}" (${batch} - ${department}) created by ${session.user.email}`,
      session.user.email || "Faculty",
      (session.user as any).id
    );

    return NextResponse.json(form, { status: 201 });
  } catch (error: any) {
    console.error("POST Form error:", error);
    return NextResponse.json({ error: error.message || "Failed to create form" }, { status: 500 });
  }
}
