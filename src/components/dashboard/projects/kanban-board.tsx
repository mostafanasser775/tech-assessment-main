"use client";

import { useState, useMemo, useCallback } from "react";
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
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  projectId: string;
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

interface SortableTaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

function SortableTaskCard({ task, onEdit, onDelete }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card className="shadow-sm">
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
              onClick={() => onEdit(task)}
            >
              <Edit className="w-3.5 h-3.5" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7 text-destructive"
              onClick={() => onDelete(task)}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}

function KanbanColumn({ status, label, tasks, onEdit, onDelete }: {
  status: TaskStatus;
  label: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  const { setNodeRef } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status,
    },
  });

  const taskIds = useMemo(() => tasks.map(task => task.id), [tasks]);

  return (
    <div 
      ref={setNodeRef}
      data-status={status}
      className="flex flex-col h-full transition-colors duration-200"
    >
      <div className="flex justify-between items-center bg-muted p-3 rounded-t-md font-medium text-sm">
        <span>{label}</span>
        <Badge variant="outline">
          {tasks.length}
        </Badge>
      </div>
      <div className="flex-1 bg-muted/50 p-2 rounded-b-md min-h-[500px] overflow-y-auto">
        <SortableContext
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks: initialTasks, employees, projectId }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<TaskStatus | "">("");
  const [newAssignee, setNewAssignee] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Memoize tasks by status to prevent unnecessary recalculations
  const tasksByStatus = useMemo(() => {
    return statusColumns.reduce((acc, column) => {
      acc[column.status] = tasks.filter(task => task.status === column.status);
      return acc;
    }, {} as Record<TaskStatus, Task[]>);
  }, [tasks]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  // Memoize handlers to prevent unnecessary re-renders
  const openUpdateDialog = useCallback((task: Task) => {
    setSelectedTask(task);
    setNewStatus(task.status);
    setNewAssignee(task.assigneeId || "unassigned");
    setIsUpdateDialogOpen(true);
  }, []);

  const openDeleteDialog = useCallback((task: Task) => {
    setSelectedTask(task);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragCancel = useCallback(() => {
    setActiveId(null);
  }, []);

  // Fetch latest tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`/api/tasks?projectId=${projectId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch tasks');
      }
      const data = await res.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to fetch tasks');
    }
  }, [projectId]);

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) {
      toast.error("Drop target not found");
      return;
    }

    const activeTask = tasks.find((task) => task.id === active.id);
    if (!activeTask) {
      toast.error("Task not found");
      return;
    }

    const targetColumnStatus = over.data.current?.type === 'column' ? over.id : null;
    if (!targetColumnStatus) {
      toast.error("Invalid drop target");
      return;
    }

    const newStatus = targetColumnStatus as TaskStatus;
    if (activeTask.status === newStatus) {
      return;
    }

    // Optimistically update UI
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === active.id ? { ...task, status: newStatus } : task
      )
    );

    try {
      const response = await fetch(`/api/tasks/${active.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update task status");
      }

      await fetchTasks();
      toast.success("Task status updated");
    } catch (error) {
      // Revert on error
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === active.id ? { ...task, status: activeTask.status } : task
        )
      );
      const errorMessage = error instanceof Error ? error.message : "Failed to update task status";
      toast.error(errorMessage);
      console.error(error);
    }
  }, [tasks, fetchTasks]);

  const handleUpdateTask = useCallback(async () => {
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

      await fetchTasks();
      setIsUpdateDialogOpen(false);
      toast.success("Task updated successfully");
    } catch (error) {
      toast.error("Failed to update task");
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  }, [selectedTask, newStatus, newAssignee, fetchTasks]);

  const handleDeleteTask = useCallback(async () => {
    if (!selectedTask) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      await fetchTasks();
      setIsDeleteDialogOpen(false);
      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  }, [selectedTask, fetchTasks]);

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="gap-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5">
        {statusColumns.map((column) => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            label={column.label}
            tasks={tasksByStatus[column.status] || []}
            onEdit={openUpdateDialog}
            onDelete={openDeleteDialog}
          />
        ))}
      </div>

      <DragOverlay>
        {activeId ? (
          <Card className="opacity-90 shadow-lg w-[300px]">
            <CardHeader className="p-3 pb-0">
              <div className="flex justify-between items-start">
                <CardTitle className="font-medium text-sm">
                  {tasks.find((task) => task.id === activeId)?.title}
                </CardTitle>
                <Badge
                  className={
                    priorityColors[
                      tasks.find((task) => task.id === activeId)?.priority ||
                        "LOW"
                    ]
                  }
                  variant="outline"
                >
                  {priorityIcons[
                    tasks.find((task) => task.id === activeId)?.priority || "LOW"
                  ]}
                  <span className="ml-1">
                    {tasks.find((task) => task.id === activeId)?.priority}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-2">
              {tasks.find((task) => task.id === activeId)?.description && (
                <CardDescription className="mt-1 text-xs line-clamp-2">
                  {tasks.find((task) => task.id === activeId)?.description}
                </CardDescription>
              )}
            </CardContent>
            <CardFooter className="flex justify-between items-center p-3 pt-0">
              {tasks.find((task) => task.id === activeId)?.assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {tasks
                        .find((task) => task.id === activeId)
                        ?.assignee?.name.substring(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-muted-foreground text-xs">
                    {tasks.find((task) => task.id === activeId)?.assignee?.name}
                  </span>
                </div>
              ) : (
                <span className="text-muted-foreground text-xs">Unassigned</span>
              )}
            </CardFooter>
          </Card>
        ) : null}
      </DragOverlay>

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
    </DndContext>
  );
}