import { NextAuthOptions, DefaultSession, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "./db";
import User from "@/models/User";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: "student" | "management" | "maintenance";
      isVerified?: boolean;
      studentId?: string;
      college?: string;
      hostel?: string;
      block?: string;
      floor?: string;
      room?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    role: "student" | "management" | "maintenance";
    isVerified?: boolean;
    studentId?: string;
    college?: string;
    hostel?: string;
    block?: string;
    floor?: string;
    room?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "student" | "management" | "maintenance";
    isVerified?: boolean;
    studentId?: string;
    college?: string;
    hostel?: string;
    block?: string;
    floor?: string;
    room?: string;
  }
}

export const authOptions: NextAuthOptions = {
  useSecureCookies: false,
  cookies: {
    sessionToken: {
      name: "hostelhub.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
    callbackUrl: {
      name: "hostelhub.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
    csrfToken: {
      name: "hostelhub.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter email and password");
        }

        const normalizedEmail = credentials.email.toLowerCase();
        const wardenPassword = "Srijit@12345";
        const wardenEmails = new Set([
          "srijitdas028@gmail.com",
          "srijitdas038@gmail.com",
          "srijitdas038@gmial.com",
        ]);

        await dbConnect();

        if (wardenEmails.has(normalizedEmail) && credentials.password === wardenPassword) {
          const wardenUser = await User.findOne({ email: normalizedEmail });
          const hashedPassword = await bcrypt.hash(wardenPassword, 10);

          const ensuredUser = wardenUser
            ? await User.findByIdAndUpdate(
                wardenUser._id,
                { role: "management", password: hashedPassword, isActive: true },
                { new: true }
              )
            : await User.create({
                email: normalizedEmail,
                password: hashedPassword,
                name: "Warden",
                role: "management",
                isVerified: true,
              });

          if (!ensuredUser) {
            throw new Error("Failed to create warden account");
          }

          return {
            id: ensuredUser._id.toString(),
            email: ensuredUser.email,
            name: ensuredUser.name,
            role: ensuredUser.role,
            isVerified: ensuredUser.isVerified,
            studentId: ensuredUser.studentId,
            college: ensuredUser.college,
            hostel: ensuredUser.hostel,
            block: ensuredUser.block,
            floor: ensuredUser.floor,
            room: ensuredUser.room,
          } as NextAuthUser;
        }

        const user = await User.findOne({ email: normalizedEmail }).select(
          "+password"
        );

        if (!user) {
          throw new Error("Invalid email or password");
        }

        if (!user.isActive) {
          throw new Error("Your account has been deactivated");
        }

        if (!user.password) {
          throw new Error("Invalid email or password");
        }

        const isMatch = await bcrypt.compare(credentials.password, user.password);

        if (!isMatch) {
          throw new Error("Invalid email or password");
        }

        // Update last login
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          isVerified: user.isVerified,
          studentId: user.studentId,
          college: user.college,
          hostel: user.hostel,
          block: user.block,
          floor: user.floor,
          room: user.room,
        } as NextAuthUser;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
        token.studentId = user.studentId;
        token.college = user.college;
        token.hostel = user.hostel;
        token.block = user.block;
        token.floor = user.floor;
        token.room = user.room;
      }

      if ("picture" in token) {
        delete (token as { picture?: string }).picture;
      }

      // Handle session update (whitelist fields only)
      if (trigger === "update" && session?.user) {
        token.id = session.user.id ?? token.id;
        token.role = session.user.role ?? token.role;
        token.isVerified = session.user.isVerified ?? token.isVerified;
        token.studentId = session.user.studentId ?? token.studentId;
        token.college = session.user.college ?? token.college;
        token.hostel = session.user.hostel ?? token.hostel;
        token.block = session.user.block ?? token.block;
        token.floor = session.user.floor ?? token.floor;
        token.room = session.user.room ?? token.room;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isVerified = token.isVerified;
        session.user.studentId = token.studentId;
        session.user.college = token.college;
        session.user.hostel = token.hostel;
        session.user.block = token.block;
        session.user.floor = token.floor;
        session.user.room = token.room;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};
