import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { Clock, AlertCircle } from "lucide-react";

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  project: {
    name: string;
  };
}

interface EmployeeTasksModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
}

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

export function EmployeeTasksModal({
  isOpen,
  onClose,
  employeeId,
  employeeName,
}: EmployeeTasksModalProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!isOpen) return;
      
      setIsLoading(true);
      try {
        const response = await fetch(`/api/tasks?assigneeId=${employeeId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }
        const data = await response.json();
        setTasks(data.tasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
  }, [isOpen, employeeId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{employeeName}'s Tasks</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {isLoading ? (
            <div className="py-4 text-center">Loading tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="py-4 text-muted-foreground text-center">
              No tasks assigned
            </div>
          ) : (
            tasks.map((task) => (
              <Card key={task.id}>
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base">{task.title}</CardTitle>
                    <Badge className={priorityColors[task.priority]} variant="outline">
                      {priorityIcons[task.priority]}
                      <span className="ml-1">{task.priority}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                  <div className="flex justify-between items-center">
                    <div className="text-muted-foreground text-sm">
                      Project: {task.project.name}
                    </div>
                    <Badge variant="secondary">{task.status}</Badge>
                  </div>
                  {task.description && (
                    <p className="mt-2 text-muted-foreground text-sm">
                      {task.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 