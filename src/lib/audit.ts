import dbConnect from "./db";
import AuditLog from "./models/AuditLog";

export async function logAction(action: string, details: string, performedBy: string, userId?: string) {
  try {
    await dbConnect();
    await AuditLog.create({
      action,
      details,
      performedBy: performedBy || "System",
      userId: userId || undefined,
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Failed to record audit log:", error);
  }
}
