import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "./db";
import User from "./models/User";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        await dbConnect();

        // Automatically seed default admin user if none exist in the database
        const userCount = await User.countDocuments();
        if (userCount === 0) {
          const hashedPassword = await bcrypt.hash("admin123", 10);
          await User.create({
            name: "Admin Faculty",
            email: "admin@certsync.com",
            password: hashedPassword,
            role: "admin",
          });
        }

        const user = await User.findOne({ email: credentials.email.toLowerCase() });
        if (!user) {
          throw new Error("No user found with this email");
        }

        const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordCorrect) {
          throw new Error("Incorrect password");
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "certsync_secret_secret_123456_key",
};
export default authOptions;
