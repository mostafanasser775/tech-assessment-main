import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user) {
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

    // Get the latest employee ID for this user
    const latestEmployee = await prisma.employee.findFirst({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        employeeId: 'desc',
      },
    });

    // Generate new employee ID
    let newEmployeeId = "EMP001";
    if (latestEmployee) {
      const lastNumber = parseInt(latestEmployee.employeeId.replace("EMP", ""));
      newEmployeeId = `EMP${String(lastNumber + 1).padStart(3, '0')}`;
    }
    
    // Create new employee
    const employee = await prisma.employee.create({
      data: {
        employeeId: newEmployeeId,
        name,
        joiningDate: new Date(joiningDate),
        basicSalary: parseFloat(basicSalary.toString()),
        userId: session.user.id,
      },
    });
    
    return NextResponse.json(
      { 
        message: "Employee created successfully",
        employee,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const employees = await prisma.employee.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json({ employees });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}