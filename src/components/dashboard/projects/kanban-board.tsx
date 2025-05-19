"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { AlertCircle, Clock, Edit, Trash2 } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assigneeId: string | null;
  assignee: {
    id: string;
    name: string;
    employeeId: string;
  } | null;
}

interface Employee {
  id: string;
  name: string;
  employeeId: string;
}

interface KanbanBoardProps {
  tasks: Task[];
  employees: Employee[];
}

const statusColumns: { status: TaskStatus; label: string }[] = [
  { status: "BACKLOG", label: "Backlog" },
  { status: "TODO", label: "To Do" },
  { status: "IN_PROGRESS", label: "In Progress" },
  { status: "REVIEW", label: "Review" },
  { status: "DONE", label: "Done" },
];

const priorityColors: Record<TaskPriority, string> = {
  LOW: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  URGENT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const priorityIcons: Record<TaskPriority, React.ReactNode> = {
  LOW: null,
  MEDIUM: <Clock className="w-3 h-3" />,
  HIGH: <AlertCircle className="w-3 h-3" />,
  URGENT: <AlertCircle className="w-3 h-3" />,
};

export function KanbanBoard({ tasks: initialTasks, employees }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<TaskStatus | "">("");
  const [newAssignee, setNewAssignee] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const openUpdateDialog = (task: Task) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setNewAssignee(task.assigneeId || "unassigned");
    setIsUpdateDialogOpen(true);
  };

  const openDeleteDialog = (task: Task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;
    
    setIsUpdating(true);
    
    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: selectedTask.title,
          description: selectedTask.description,
          priority: selectedTask.priority,
          status: newStatus || selectedTask.status,
          assigneeId: newAssignee === "unassigned" ? null : newAssignee,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      const { task: updatedTask } = await response.json();

      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === selectedTask.id ? updatedTask : task
        )
      );

      setIsUpdateDialogOpen(false);
      toast.success("Task updated successfully");
    } catch (error) {
      toast.error("Failed to update task");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!selectedTask) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      // Update local state
      setTasks((prevTasks) =>
        prevTasks.filter((task) => task.id !== selectedTask.id)
      );

      setIsDeleteDialogOpen(false);
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="gap-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
      {statusColumns.map((column) => (
        <div key={column.status} className="flex flex-col h-full">
          <div className="flex justify-between items-center bg-muted p-3 rounded-t-md font-medium text-sm">
            <span>{column.label}</span>
            <Badge variant="outline">
              {tasks.filter((task) => task.status === column.status).length}
            </Badge>
          </div>
          <div className="flex-1 bg-muted/50 p-2 rounded-b-md min-h-[500px] overflow-y-auto">
            <div className="space-y-2">
              {tasks
                .filter((task) => task.status === column.status)
                .map((task) => (
                  <Card key={task.id} className="shadow-sm">
                    <CardHeader className="p-3 pb-0">
                      <div className="flex justify-between items-start">
                        <CardTitle className="font-medium text-sm">
                          {task.title}
                        </CardTitle>
                        <Badge className={priorityColors[task.priority]} variant="outline">
                          {priorityIcons[task.priority]}
                          <span className="ml-1">{task.priority}</span>
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-2">
                      {task.description && (
                        <CardDescription className="mt-1 text-xs line-clamp-2">
                          {task.description}
                        </CardDescription>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between items-center p-3 pt-0">
                      {task.assignee ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {task.assignee.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-muted-foreground text-xs">
                            {task.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Unassigned</span>
                      )}
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7"
                          onClick={() => openUpdateDialog(task)}
                        >
                          <Edit className="w-3.5 h-3.5" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-destructive"
                          onClick={() => openDeleteDialog(task)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          </div>
        </div>
      ))}

      {/* Update Task Dialog */}
      <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Task</DialogTitle>
            <DialogDescription>
              Change the status or assignee of this task.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as TaskStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusColumns.map((column) => (
                    <SelectItem key={column.status} value={column.status}>
                      {column.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignee">Assignee</Label>
              <Select
                value={newAssignee}
                onValueChange={setNewAssignee}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select assignee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} ({employee.employeeId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsUpdateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateTask}
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Task Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this task? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteTask}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}