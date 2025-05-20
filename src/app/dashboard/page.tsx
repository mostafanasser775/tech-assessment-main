import { auth } from "@/auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { Users, FolderKanban, Clock, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await auth();

  // Fetch all required data
  const [employees, projects, tasks] = await Promise.all([
    prisma.employee.findMany({
      where: { userId: session?.user?.id },
      include: {
        _count: {
          select: { tasks: true }
        }
      }
    }),
    prisma.project.findMany({
      where: { userId: session?.user?.id },
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
        project: { userId: session?.user?.id }
      },
      include: {
        assignee: true,
        project: true
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    })
  ]);

  // Calculate statistics
  const totalEmployees = employees.length;
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const totalSalary = employees.reduce((sum, emp) => sum + emp.basicSalary, 0);
  
  // Task status counts
  const taskStatusCounts = {
    backlog: tasks.filter(t => t.status === 'BACKLOG').length,
    todo: tasks.filter(t => t.status === 'TODO').length,
    inProgress: tasks.filter(t => t.status === 'IN_PROGRESS').length,
    review: tasks.filter(t => t.status === 'REVIEW').length,
    done: tasks.filter(t => t.status === 'DONE').length,
  };

  return (
    <div className="space-y-6 p-6 container">
      <div className="flex justify-between items-center">
        <h1 className="font-bold text-3xl">Dashboard Overview</h1>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/employees/new">Add Employee</Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/projects/new">New Project</Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Employees</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{totalEmployees}</div>
            <p className="text-muted-foreground text-xs">
              Total monthly salary: {formatCurrency(totalSalary)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Active Projects</CardTitle>
            <FolderKanban className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{totalProjects}</div>
            <p className="text-muted-foreground text-xs">
              {projects.filter(p => p._count.tasks > 0).length} projects with tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Total Tasks</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="font-bold text-2xl">{totalTasks}</div>
            <p className="text-muted-foreground text-xs">
              {taskStatusCounts.done} tasks completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
            <CardTitle className="font-medium text-sm">Task Status</CardTitle>
            <AlertCircle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Backlog</span>
                <span className="font-medium text-sm">{taskStatusCounts.backlog}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">In Progress</span>
                <span className="font-medium text-sm">{taskStatusCounts.inProgress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Review</span>
                <span className="font-medium text-sm">{taskStatusCounts.review}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity and Projects */}
      <div className="gap-6 grid grid-cols-1 lg:grid-cols-2">
        {/* Recent Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Latest task updates across all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tasks.map((task) => (
                <div key={task.id} className="flex justify-between items-center">
                  <div className="space-y-1">
                    <p className="font-medium text-sm leading-none">{task.title}</p>
                    <p className="text-muted-foreground text-sm">
                      {task.project.name} • {task.assignee?.name || 'Unassigned'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {task.status === 'DONE' ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : task.status === 'IN_PROGRESS' ? (
                      <Clock className="w-4 h-4 text-blue-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Project Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
            <CardDescription>Active projects and their progress</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{project.name}</p>
                      <p className="text-muted-foreground text-sm">
                        {project._count.tasks} tasks
                      </p>
                    </div>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/dashboard/projects/${project.id}`}>
                        View Project
                      </Link>
                    </Button>
                  </div>
                  {project.tasks.length > 0 && (
                    <div className="space-y-1">
                      {project.tasks.map((task) => (
                        <div key={task.id} className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">{task.title}</span>
                          <span className="text-xs">{task.assignee?.name || 'Unassigned'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 