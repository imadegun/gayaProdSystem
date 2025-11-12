import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextRequest } from "next/server";

export type UserRole = "R&D" | "Sales" | "Forming" | "Glaze" | "QC" | "Admin";

export interface AuthUser {
  id: string;
  username: string;
  email?: string;
  role: UserRole;
  subRole?: string;
  employee?: {
    id: number;
    employeeCode: string;
    firstName: string;
    lastName: string;
    department?: string | null;
    position?: string | null;
    photoUrl?: string | null;
  };
}

/**
 * Get the current authenticated user from the session
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;

  return {
    id: session.user.id,
    username: session.user.username || "",
    email: session.user.email || undefined,
    role: session.user.role as UserRole,
    subRole: session.user.subRole || undefined,
    employee: session.user.employee || undefined,
  };
}

/**
 * Check if user has required role(s)
 */
export function hasRole(user: AuthUser | null, roles: UserRole | UserRole[]): boolean {
  if (!user) return false;

  const requiredRoles = Array.isArray(roles) ? roles : [roles];
  return requiredRoles.includes(user.role);
}

/**
 * Check if user has admin privileges
 */
export function isAdmin(user: AuthUser | null): boolean {
  return hasRole(user, "Admin");
}

/**
 * Check if user can access production data
 */
export function canAccessProduction(user: AuthUser | null): boolean {
  if (!user) return false;
  return ["Forming", "Glaze", "QC", "Admin"].includes(user.role);
}

/**
 * Check if user can manage products (R&D)
 */
export function canManageProducts(user: AuthUser | null): boolean {
  if (!user) return false;
  return ["R&D", "Admin"].includes(user.role);
}

/**
 * Check if user can manage clients and orders
 */
export function canManageClients(user: AuthUser | null): boolean {
  if (!user) return false;
  return ["Sales", "Admin"].includes(user.role);
}

/**
 * Check if user can perform quality control
 */
export function canPerformQC(user: AuthUser | null): boolean {
  if (!user) return false;
  return ["Glaze", "QC", "Admin"].includes(user.role);
}

/**
 * Middleware helper for API routes
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

/**
 * Middleware helper for role-based access
 */
export async function requireRole(request: NextRequest, roles: UserRole | UserRole[]): Promise<AuthUser> {
  const user = await requireAuth(request);
  if (!hasRole(user, roles)) {
    throw new Error("Insufficient permissions");
  }
  return user;
}

/**
 * Permission-based route guard for API routes
 */
export function withAuth(handler: Function, options: {
  requiredRoles?: UserRole | UserRole[];
  requireAuth?: boolean;
} = {}) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      let user: AuthUser | null = null;

      if (options.requireAuth !== false) {
        user = await requireAuth(request);
      }

      if (options.requiredRoles) {
        user = await requireRole(request, options.requiredRoles);
      }

      // Add user to request context
      (request as any).user = user;

      return await handler(request, ...args);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: error instanceof Error ? error.message : "Unauthorized" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  };
}