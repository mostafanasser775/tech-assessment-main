import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { KanbanBoard } from "@/components/dashboard/projects/kanban-board";
import { TaskTable } from "@/components/dashboard/projects/task-table";
import { use } from "react";

interface ProjectDetailPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectDetailPage({ params }:
  { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const project = await prisma.project.findUnique({
    where: {
      id: id,
      userId: session.user.id,
    },
    include: {
      tasks: {
        include: {
          assignee: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!project) {
    notFound();
  }

  // Get all employees for task assignment
  const employees = await prisma.employee.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
      employeeId: true,
    },
  });

  return (
    <div className="container p-6">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/projects">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          {project.description && (
            <p className="text-muted-foreground mt-1">{project.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/projects/${project.id}/edit`}>
            <Button variant="outline">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Project
            </Button>
          </Link>
          <Link href={`/dashboard/projects/${project.id}/tasks/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </Link>
        </div>
      </div>

      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="kanban">Kanban Board</TabsTrigger>
          <TabsTrigger value="backlog">Backlog</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-0">
          <KanbanBoard
            projectId={project.id}
            tasks={project.tasks}
            employees={employees}
          />
        </TabsContent>

        <TabsContent value="backlog" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Task Backlog</CardTitle>
              <CardDescription>
                All tasks in this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskTable
                projectId={project.id}
                tasks={project.tasks}
                employees={employees}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}