export type Role = "admin" | "manager" | "member"

export type Permission =
  | "project:create"
  | "project:update"
  | "project:delete"
  | "task:create"
  | "task:update"
  | "task:delete"
  | "role:assign"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  createdAt: number
}

export type ColumnId = "todo" | "inprogress" | "done"

export interface Task {
  id: string
  projectId: string
  title: string
  description?: string
  assigneeId?: string
  status: ColumnId
  createdAt: number
  updatedAt: number
  dueDate?: string
}

export interface Project {
  id: string
  name: string
  createdAt: number
}

export interface BoardState {
  projects: Project[]
  currentProjectId?: string
  tasks: Record<string, Task>
  columns: Record<ColumnId, { id: ColumnId; name: string; taskIds: string[] }>
}