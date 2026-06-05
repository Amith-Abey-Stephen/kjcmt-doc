import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/db";
import Form from "@/lib/models/Form";
import Submission from "@/lib/models/Submission";
import StudentList from "@/lib/models/StudentList";
import { deleteCertificate } from "@/lib/cloudinary";
import { logAction } from "@/lib/audit";

export async function GET(req: Request, props: { params: Promise<{ formId: string }> }) {
  const params = await props.params;
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    const form = await Form.findById(params.formId);
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // If authenticated, enforce ownership for non-admin users
    if (session?.user) {
      const user = session.user as any;
      if (user.role !== "admin" && form.createdBy?.toString() !== user.id) {
        return NextResponse.json({ error: "Unauthorized. You do not own this form." }, { status: 403 });
      }
    }

    return NextResponse.json(form);
  } catch (error: any) {
    console.error("GET Form error:", error);
    return NextResponse.json({ error: "Invalid form ID or fetch failed" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ formId: string }> }) {
  const params = await props.params;
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const form = await Form.findById(params.formId);
    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    const user = session.user as any;
    if (user.role !== "admin" && form.createdBy?.toString() !== user.id) {
      return NextResponse.json({ error: "Unauthorized. You do not own this form." }, { status: 403 });
    }

    // Find and delete all certificates uploaded for this form
    const submissions = await Submission.find({ formId: params.formId });
    for (const sub of submissions) {
      if (sub.certificate1?.publicId) {
        await deleteCertificate(sub.certificate1.publicId, sub.certificate1.url);
      }
      if (sub.certificate2?.publicId) {
        await deleteCertificate(sub.certificate2.publicId, sub.certificate2.url);
      }
      if (sub.certificate3?.publicId) {
        await deleteCertificate(sub.certificate3.publicId, sub.certificate3.url);
      }
    }

    // Delete submissions
    await Submission.deleteMany({ formId: params.formId });

    // Delete student master list
    await StudentList.deleteMany({ formId: params.formId });

    // Delete form itself
    await Form.findByIdAndDelete(params.formId);

    await logAction(
      "Form Deleted",
      `Form "${form.title}" and all its related submissions/files were deleted by ${session.user.email}`,
      session.user.email || "Faculty",
      (session.user as any).id
    );

    return NextResponse.json({ message: "Form deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Form error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete form" }, { status: 500 });
  }
}
