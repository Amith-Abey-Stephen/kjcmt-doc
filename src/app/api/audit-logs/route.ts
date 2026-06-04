import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/db";
import AuditLog from "@/lib/models/AuditLog";

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const logs = await AuditLog.find({}).sort({ timestamp: -1 }).limit(100);
    return NextResponse.json(logs);
  } catch (error: any) {
    console.error("GET Audit Logs error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch audit logs" }, { status: 500 });
  }
}
