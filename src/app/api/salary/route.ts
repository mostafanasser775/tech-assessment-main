import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || !session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const url = new URL(req.url);
    const month = parseInt(url.searchParams.get("month") || "0");
    const year = parseInt(url.searchParams.get("year") || "0");
    const employeeId = url.searchParams.get("employeeId");
    
    if (!month || !year) {
      return NextResponse.json(
        { message: "Month and year are required" },
        { status: 400 }
      );
    }
    
    const whereClause: any = {
      month,
      year,
      employee: {
        userId: session.user.id,
      },
    };
    
    if (employeeId) {
      whereClause.employeeId = employeeId;
    }
    
    const salaries = await prisma.salary.findMany({
      where: whereClause,
      include: {
        employee: {
          select: {
            employeeId: true,
            name: true,
          },
        },
      },
    });
    
    return NextResponse.json({ salaries });
  } catch (error) {
    console.error("Error fetching salaries:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || !session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { month, year, salaries } = await req.json();
    
    if (!month || !year || !salaries || !Array.isArray(salaries)) {
      return NextResponse.json(
        { message: "Invalid data format" },
        { status: 400 }
      );
    }
    
    // Process each salary record
    const results = await Promise.all(
      salaries.map(async (salary) => {
        const { employeeId, basicSalary, bonus, deduction, netSalary } = salary;
        
        // Verify employee belongs to user
        const employee = await prisma.employee.findUnique({
          where: {
            id: employeeId,
            userId: session.user.id,
          },
        });
        
        if (!employee) {
          return { error: `Employee not found: ${employeeId}` };
        }
        
        // Check if salary record already exists
        const existingSalary = await prisma.salary.findUnique({
          where: {
            employeeId_month_year: {
              employeeId,
              month,
              year,
            },
          },
        });
        
        if (existingSalary) {
          // Update existing record
          return prisma.salary.update({
            where: {
              id: existingSalary.id,
            },
            data: {
              basicSalary,
              bonus,
              deduction,
              netSalary,
            },
          });
        } else {
          // Create new record
          return prisma.salary.create({
            data: {
              month,
              year,
              employeeId,
              basicSalary,
              bonus,
              deduction,
              netSalary,
            },
          });
        }
      })
    );
    
    return NextResponse.json({
      message: "Salary records saved successfully",
      results,
    });
  } catch (error) {
    console.error("Error saving salaries:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}