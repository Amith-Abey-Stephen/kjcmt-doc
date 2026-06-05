import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/db";
import Submission from "@/lib/models/Submission";
import Form from "@/lib/models/Form";
import { deleteCertificate } from "@/lib/cloudinary";
import { logAction } from "@/lib/audit";

export async function DELETE(req: Request, props: { params: Promise<{ submissionId: string }> }) {
  const params = await props.params;
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const submission = await Submission.findById(params.submissionId);
    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const form = await Form.findById(submission.formId);

    const user = session.user as any;
    if (user.role !== "admin" && form?.createdBy?.toString() !== user.id) {
      return NextResponse.json({ error: "Unauthorized. You do not own this form." }, { status: 403 });
    }

    // Delete files in Cloudinary or local storage
    if (submission.certificate1?.publicId) {
      await deleteCertificate(submission.certificate1.publicId, submission.certificate1.url);
    }
    if (submission.certificate2?.publicId) {
      await deleteCertificate(submission.certificate2.publicId, submission.certificate2.url);
    }
    if (submission.certificate3?.publicId) {
      await deleteCertificate(submission.certificate3.publicId, submission.certificate3.url);
    }

    // Delete submission from database
    await Submission.findByIdAndDelete(params.submissionId);

    await logAction(
      "Submission Deleted",
      `Submission from student "${submission.studentName}" (${submission.rollNumber}) deleted by ${session.user.email}`,
      session.user.email || "Faculty",
      (session.user as any).id
    );

    return NextResponse.json({ message: "Submission deleted successfully" });
  } catch (error: any) {
    console.error("DELETE Submission error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete submission" }, { status: 500 });
  }
}
