import dbConnect from "./db";
import AuditLog from "./models/AuditLog";

/**
 * Creates an entry in the system audit logs.
 * @param action Short name of the action (e.g. "Form Created")
 * @param details Detailed description of the event
 * @param performedBy Email of the user, or "Student (Public Form)"
 */
export async function logAction(action: string, details: string, performedBy: string) {
  try {
    await dbConnect();
    await AuditLog.create({
      action,
      details,
      performedBy: performedBy || "System",
      timestamp: new Date(),
    });
  } catch (error) {
    console.error("Failed to record audit log:", error);
  }
}
