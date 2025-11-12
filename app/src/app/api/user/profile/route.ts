import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        subRole: user.subRole,
        employee: user.employee ? {
          id: user.employee.id,
          employeeCode: user.employee.employeeCode,
          firstName: user.employee.firstName,
          lastName: user.employee.lastName,
          department: user.employee.department,
          position: user.employee.position,
          photoUrl: user.employee.photoUrl,
        } : null,
      },
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}