import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TaskPriority, TaskStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const session = await auth();
    
    if (!session?.user || !session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const { title, description, priority, status, projectId, assigneeId } = await req.json();
    
    // Validate input
    if (!title || !projectId) {
      return NextResponse.json(
        { message: "Title and project ID are required" },
        { status: 400 }
      );
    }
    
    // Check if project exists and belongs to user
    const project = await prisma.project.findUnique({
      where: {
        id: projectId,
        userId: session.user.id,
      },
    });
    
    if (!project) {
      return NextResponse.json(
        { message: "Project not found" },
        { status: 404 }
      );
    }
    
    // If assigneeId is provided, check if employee exists and belongs to user
    if (assigneeId) {
      const employee = await prisma.employee.findUnique({
        where: {
          id: assigneeId,
          userId: session.user.id,
        },
      });
      
      if (!employee) {
        return NextResponse.json(
          { message: "Employee not found" },
          { status: 404 }
        );
      }
    }
    
    // Create new task
    const task = await prisma.task.create({
      data: {
        title,
        description: description || "",
        priority: priority as TaskPriority || "MEDIUM",
        status: status as TaskStatus || "BACKLOG",
        projectId,
        assigneeId: assigneeId || null,
      },
      include: {
        assignee: true,
      },
    });
    
    return NextResponse.json(
      { 
        message: "Task created successfully",
        task,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

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
    const projectId = url.searchParams.get("projectId");
    const status = url.searchParams.get("status");
    
    const whereClause: any = {
      project: {
        userId: session.user.id,
      },
    };
    
    if (projectId) {
      whereClause.projectId = projectId;
    }
    
    if (status) {
      whereClause.status = status;
    }
    
    const tasks = await prisma.task.findMany({
      where: whereClause,
      include: {
        project: {
          select: {
            name: true,
          },
        },
        assignee: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}