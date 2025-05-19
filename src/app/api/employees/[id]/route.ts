import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request,{ params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    const {id} = await params;
    if (!session?.user || !session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    
    const employee = await prisma.employee.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });
    
    if (!employee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ employee });
  } catch (error) {
    console.error("Error fetching employee:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    if (!session?.user || !session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { name, joiningDate, basicSalary } = await req.json();
    
    // Validate input
    if (!name || !joiningDate || basicSalary === undefined) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }
    
    // Check if employee exists and belongs to user
    const existingEmployee = await prisma.employee.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });
    
    if (!existingEmployee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }
    
    // Update employee
    const updatedEmployee = await prisma.employee.update({
      where: {
        id,
      },
      data: {
        name,
        joiningDate: new Date(joiningDate),
        basicSalary: parseFloat(basicSalary.toString()),
      },
    });
    
    return NextResponse.json({
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    
    if (!session?.user || !session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Check if employee exists and belongs to user
    const existingEmployee = await prisma.employee.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });
    
    if (!existingEmployee) {
      return NextResponse.json(
        { message: "Employee not found" },
        { status: 404 }
      );
    }
    
    // Delete employee (will cascade delete salaries)
    await prisma.employee.delete({
      where: {
        id,
      },
    });
    
    return NextResponse.json({
      message: "Employee deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting employee:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}