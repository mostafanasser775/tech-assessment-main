import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TaskPriority, TaskStatus } from "@prisma/client";

export async function GET(
  req: Request,
  { params }: { params:Promise< { id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || !session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const {id} = (await params);
    
    const task = await prisma.task.findUnique({
      where: {
        id,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            userId: true,
          },
        },
        assignee: true,
      },
    });
    
    if (!task) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }
    
    // Check if task belongs to user's project
    if (task.project.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ task });
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params:Promise< { id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || !session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const {id} = (await params);
    const updateData = await req.json();
    
    // Validate input: if title is provided, it must not be empty
    if (updateData.title !== undefined && !updateData.title) {
      return NextResponse.json(
        { message: "Title is required" },
        { status: 400 }
      );
    }
    
    // Check if task exists and belongs to user's project
    const existingTask = await prisma.task.findUnique({
      where: {
        id,
      },
      include: {
        project: {
          select: {
            userId: true,
          },
        },
      },
    });
    
    if (!existingTask) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }
    
    if (existingTask.project.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // If assigneeId is provided, check if employee exists and belongs to user
    if (updateData.assigneeId !== undefined) {
      const employee = await prisma.employee.findUnique({
        where: {
          id: updateData.assigneeId,
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
    
    // Update task with only the provided fields
    const updatedTask = await prisma.task.update({
      where: {
        id,
      },
      data: {
        title: updateData.title !== undefined ? updateData.title : undefined,
        description: updateData.description !== undefined ? updateData.description : undefined,
        priority: updateData.priority !== undefined ? updateData.priority as TaskPriority : undefined,
        status: updateData.status !== undefined ? updateData.status as TaskStatus : undefined,
        assigneeId: updateData.assigneeId === null ? null : updateData.assigneeId !== undefined ? updateData.assigneeId : undefined,
      },
      include: {
        assignee: true,
      },
    });
    
    return NextResponse.json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params:Promise< { id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || !session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
      const {id} = (await params);
    
    // Check if task exists and belongs to user's project
    const existingTask = await prisma.task.findUnique({
      where: {
        id,
      },
      include: {
        project: {
          select: {
            userId: true,
          },
        },
      },
    });
    
    if (!existingTask) {
      return NextResponse.json(
        { message: "Task not found" },
        { status: 404 }
      );
    }
    
    if (existingTask.project.userId !== session.user.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    
    // Delete task
    await prisma.task.delete({
      where: {
        id,
      },
    });
    
    return NextResponse.json({
      message: "Task deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    );
  }
}