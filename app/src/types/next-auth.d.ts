import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      email?: string | null;
      role: string;
      subRole?: string | null;
      employee?: {
        id: number;
        employeeCode: string;
        firstName: string;
        lastName: string;
        department?: string | null;
        position?: string | null;
        photoUrl?: string | null;
      } | null;
    };
  }

  interface User {
    id: string;
    username: string;
    email?: string | null;
    role: string;
    subRole?: string | null;
    employee?: {
      id: number;
      employeeCode: string;
      firstName: string;
      lastName: string;
      department?: string | null;
      position?: string | null;
      photoUrl?: string | null;
    } | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    subRole?: string | null;
    employee?: {
      id: number;
      employeeCode: string;
      firstName: string;
      lastName: string;
      department?: string | null;
      position?: string | null;
      photoUrl?: string | null;
    } | null;
  }
}