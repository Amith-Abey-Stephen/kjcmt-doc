import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/db";
import StudentList from "@/lib/models/StudentList";
import Form from "@/lib/models/Form";
import * as xlsx from "xlsx";
import { logAction } from "@/lib/audit";

export async function GET(req: Request, props: { params: Promise<{ formId: string }> }) {
  const params = await props.params;
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const students = await StudentList.find({ formId: params.formId }).sort({ rollNumber: 1 });
    return NextResponse.json(students);
  } catch (error: any) {
    console.error("GET StudentList error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch student list" }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ formId: string }> }) {
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

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = xlsx.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawData = xlsx.utils.sheet_to_json(worksheet) as any[];

    if (rawData.length === 0) {
      return NextResponse.json({ error: "Excel sheet is empty" }, { status: 400 });
    }

    // Dynamic column mapping helper
    let rollHeader = "";
    let nameHeader = "";

    const firstRow = rawData[0];
    const headers = Object.keys(firstRow);

    for (const h of headers) {
      const normalized = h.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (normalized.includes("roll") || normalized.includes("reg") || normalized.includes("adm") || normalized === "no") {
        rollHeader = h;
      }
      if (normalized.includes("name") || normalized.includes("student") || normalized.includes("full")) {
        nameHeader = h;
      }
    }

    // Fallback if smart matching fails
    if (!rollHeader && headers.length > 0) rollHeader = headers[0];
    if (!nameHeader && headers.length > 1) nameHeader = headers[1];

    if (!rollHeader || !nameHeader) {
      return NextResponse.json({ error: "Could not identify Roll Number or Student Name columns" }, { status: 400 });
    }

    const studentsToSave = rawData
      .map((row) => {
        const rollNumber = String(row[rollHeader] || "").trim().toUpperCase();
        const studentName = String(row[nameHeader] || "").trim();
        return { rollNumber, studentName };
      })
      .filter((s) => s.rollNumber && s.studentName);

    if (studentsToSave.length === 0) {
      return NextResponse.json({ error: "No valid rows found to parse" }, { status: 400 });
    }

    // Delete existing list for this form
    await StudentList.deleteMany({ formId: params.formId });

    // Bulk insert new student list
    const docs = studentsToSave.map((s) => ({
      formId: params.formId,
      studentName: s.studentName,
      rollNumber: s.rollNumber,
    }));
    await StudentList.insertMany(docs);

    await logAction(
      "Student List Uploaded",
      `Uploaded ${docs.length} students to form "${form.title}"`,
      session.user.email || "Faculty"
    );

    return NextResponse.json({
      message: `Successfully uploaded ${docs.length} students.`,
      count: docs.length,
    });
  } catch (error: any) {
    console.error("POST StudentList error:", error);
    return NextResponse.json({ error: error.message || "Failed to process Excel file" }, { status: 500 });
  }
}
