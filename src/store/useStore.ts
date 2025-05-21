import { create } from 'zustand'
import { Employee, Project, Task } from '@prisma/client'

type EmployeeWithCount = Employee & {
  _count: {
    tasks: number
  }
}

type ProjectWithRelations = Project & {
  _count: {
    tasks: number
  }
  tasks: (Task & {
    assignee: Employee | null
  })[]
}

type TaskWithRelations = Task & {
  assignee: Employee | null
  project: Project
}

interface StoreState {
  employees: EmployeeWithCount[]
  projects: ProjectWithRelations[]
  tasks: TaskWithRelations[]
  isLoading: boolean
  error: string | null
  setEmployees: (employees: EmployeeWithCount[]) => void
  setProjects: (projects: ProjectWithRelations[]) => void
  setTasks: (tasks: TaskWithRelations[]) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  addEmployee: (employee: EmployeeWithCount) => void
  addProject: (project: ProjectWithRelations) => void
  addTask: (task: TaskWithRelations) => void
  updateEmployee: (employee: EmployeeWithCount) => void
  updateProject: (project: ProjectWithRelations) => void
  updateTask: (task: TaskWithRelations) => void
  deleteEmployee: (id: string) => void
  deleteProject: (id: string) => void
  deleteTask: (id: string) => void
}

export const useStore = create<StoreState>((set) => ({
  employees: [],
  projects: [],
  tasks: [],
  isLoading: false,
  error: null,
  setEmployees: (employees) => set({ employees }),
  setProjects: (projects) => set({ projects }),
  setTasks: (tasks) => set({ tasks }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  addEmployee: (employee) => set((state) => ({ employees: [...state.employees, employee] })),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateEmployee: (employee) => set((state) => ({
    employees: state.employees.map((e) => (e.id === employee.id ? employee : e))
  })),
  updateProject: (project) => set((state) => ({
    projects: state.projects.map((p) => (p.id === project.id ? project : p))
  })),
  updateTask: (task) => set((state) => ({
    tasks: state.tasks.map((t) => (t.id === task.id ? task : t))
  })),
  deleteEmployee: (id) => set((state) => ({
    employees: state.employees.filter((e) => e.id !== id)
  })),
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter((p) => p.id !== id)
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id)
  }))
})) 