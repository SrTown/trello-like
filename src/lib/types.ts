export type Role = "admin" | "manager" | "member"

export type Permission =
  | "project:create"
  | "project:update"
  | "project:delete"
  | "project:view"
  | "task:create"
  | "task:update"
  | "task:delete"
  | "task:view"
  | "role:assign"

export interface User {
  id: string
  name: string
  email: string
  role: Role
  createdAt: number
}

export interface BoardColumn {
  id: string
  project_id: string
  name: string
  position: number
  is_default: boolean
  created_at: string
}

export interface Task {
  id: string
  project_id: string
  column_id: string
  title: string
  description?: string
  due_date?: string
  position: number
  created_by?: string
  archived_at?: string
  created_at: string
  updated_at: string
  // Para el frontend
  assignees?: User[]
}

export interface Project {
  id: string
  name: string
  owner_id?: string
  archived_at?: string
  created_at: string
}

export interface BoardState {
  projects: Project[]
  currentProjectId?: string
  tasks: Record<string, Task>
  columns: Record<string, BoardColumn>
  users: User[]
}
