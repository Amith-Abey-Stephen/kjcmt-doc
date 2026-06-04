import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";
import { logAction } from "@/lib/audit";

export async function GET() {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const users = await User.find({}, { password: 0 }).sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error: any) {
    console.error("GET Users error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Missing name, email, or password" }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: "A user with this email already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || "faculty",
    });

    await logAction(
      "User Registered",
      `Faculty user "${name}" (${email}) registered with role "${role || "faculty"}" by admin ${session.user.email}`,
      session.user.email || "Admin"
    );

    // Return user without password
    const responseData = {
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };

    return NextResponse.json(responseData, { status: 201 });
  } catch (error: any) {
    console.error("POST User registration error:", error);
    return NextResponse.json({ error: error.message || "Failed to register user" }, { status: 500 });
  }
}
