import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";
import { TaskStatus, TaskPriority } from "@prisma/client";

const priorityColors: Record<TaskPriority, string> = {
  LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  URGENT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const priorityIcons: Record<TaskPriority, React.ReactNode> = {
  LOW: null,
  MEDIUM: <Clock className="w-4 h-4" />,
  HIGH: <AlertCircle className="w-4 h-4" />,
  URGENT: <AlertCircle className="w-4 h-4" />,
};

const statusColors: Record<TaskStatus, string> = {
  BACKLOG: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  TODO: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  REVIEW: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  DONE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
};

export default async function EmployeeTasksPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/login");
  }

  const employee = await prisma.employee.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
  });

  if (!employee) {
    redirect("/dashboard/employees");
  }

  const tasks = await prisma.task.findMany({
    where: {
      assigneeId: employee.id,
    },
    include: {
      project: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Group tasks by status
  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<TaskStatus, typeof tasks>);

  return (
    <div className="p-6 container">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard/employees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="font-bold text-3xl">{employee.name}'s Tasks</h1>
          <p className="text-muted-foreground">Employee ID: {employee.employeeId}</p>
        </div>
      </div>

      <div className="gap-6 grid md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(tasksByStatus).map(([status, statusTasks]) => (
          <Card key={status}>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">{status.replace(/_/g, " ")}</CardTitle>
                <Badge variant="secondary">{statusTasks.length}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusTasks.map((task) => (
                  <Card key={task.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{task.title}</h3>
                        <Badge className={priorityColors[task.priority]} variant="outline">
                          {priorityIcons[task.priority]}
                          <span className="ml-1">{task.priority}</span>
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-muted-foreground text-sm">
                        <span>Project: {task.project.name}</span>
                        <Badge className={statusColors[task.status]} variant="outline">
                          {task.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-muted-foreground text-sm">{task.description}</p>
                      )}
                      <div className="text-muted-foreground text-xs">
                        Created: {format(task.createdAt, "PPP")}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 