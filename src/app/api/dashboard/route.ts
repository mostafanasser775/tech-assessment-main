import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Fetch all required data
    const [employees, projects, tasks] = await Promise.all([
      prisma.employee.findMany({
        where: { userId: session.user.id },
        include: {
          _count: {
            select: { tasks: true }
          }
        }
      }),
      prisma.project.findMany({
        where: { userId: session.user.id },
        include: {
          _count: {
            select: { tasks: true }
          },
          tasks: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
              assignee: true
            }
          }
        }
      }),
      prisma.task.findMany({
        where: { 
          project: { userId: session.user.id }
        },
        include: {
          assignee: true,
          project: true
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    return NextResponse.json({
      employees,
      projects,
      tasks
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
} 