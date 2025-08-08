import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"
import type { BoardState, ColumnId, Project, Task } from "@/lib/types"

type Actions = {
  seedIfEmpty: () => void
  createProject: (name: string) => Project
  setCurrentProject: (id: string) => void
  createTask: (projectId: string, status: ColumnId, input: Partial<Omit<Task, "id" | "projectId" | "status" | "createdAt" | "updatedAt">> & { title: string }) => Task
  updateTask: (taskId: string, input: Partial<Omit<Task, "id" | "projectId" | "createdAt" | "updatedAt">>) => void
  deleteTask: (taskId: string) => void
  moveTask: (taskId: string, toStatus: ColumnId, toIndex?: number) => void
}

const defaultColumns = (): BoardState["columns"] => ({
  todo: { id: "todo", name: "Backlog", taskIds: [] },
  inprogress: { id: "inprogress", name: "In Progress", taskIds: [] },
  done: { id: "done", name: "Done", taskIds: [] },
})

export const useAppStore = create<BoardState & Actions>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: undefined,
      tasks: {},
      columns: defaultColumns(),

      seedIfEmpty: () => {
        const s = get()
        if (s.projects.length === 0) {
          const projectId = nanoid()
          const project: Project = { id: projectId, name: "Colorful Demo Project", createdAt: Date.now() }
          const t1: Task = {
            id: nanoid(),
            projectId,
            title: "Design splash with gradient",
            status: "todo",
            createdAt: Date.now(),
            updatedAt: Date.now(),
            description: "Hero with brand violet → fuchsia gradient"
          }
          const t2: Task = {
            id: nanoid(),
            projectId,
            title: "Implement Kanban drag & drop",
            status: "inprogress",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          const t3: Task = {
            id: nanoid(),
            projectId,
            title: "Polish accessibility",
            status: "done",
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          set({
            projects: [project],
            currentProjectId: projectId,
            tasks: { [t1.id]: t1, [t2.id]: t2, [t3.id]: t3 },
            columns: {
              todo: { id: "todo", name: "Backlog", taskIds: [t1.id] },
              inprogress: { id: "inprogress", name: "In Progress", taskIds: [t2.id] },
              done: { id: "done", name: "Done", taskIds: [t3.id] },
            },
          })
        }
      },

      createProject: (name) => {
        const p: Project = { id: nanoid(), name, createdAt: Date.now() }
        set((s) => ({
          projects: [...s.projects, p],
          currentProjectId: p.id,
          tasks: {},
          columns: defaultColumns(),
        }))
        return p
      },

      setCurrentProject: (id) => {
        set({ currentProjectId: id, tasks: {}, columns: defaultColumns() })
      },

      createTask: (projectId, status, input) => {
        const id = nanoid()
        const now = Date.now()
        const task: Task = {
          id,
          projectId,
          status,
          title: input.title,
          description: input.description,
          assigneeId: input.assigneeId,
          dueDate: input.dueDate,
          createdAt: now,
          updatedAt: now,
        }
        set((s) => {
          const col = s.columns[status]
          return {
            tasks: { ...s.tasks, [id]: task },
            columns: { ...s.columns, [status]: { ...col, taskIds: [...col.taskIds, id] } },
          }
        })
        return task
      },

      updateTask: (taskId, input) => {
        set((s) => {
          const t = s.tasks[taskId]
          if (!t) return {}
          const nextStatus = input.status ?? t.status
          let columns = { ...s.columns }
          if (nextStatus !== t.status) {
            columns[t.status] = { ...columns[t.status], taskIds: columns[t.status].taskIds.filter((i) => i !== taskId) }
            columns[nextStatus] = { ...columns[nextStatus], taskIds: [...columns[nextStatus].taskIds, taskId] }
          }
          return {
            tasks: { ...s.tasks, [taskId]: { ...t, ...input, status: nextStatus, updatedAt: Date.now() } },
            columns,
          }
        })
      },

      deleteTask: (taskId) => {
        set((s) => {
          const t = s.tasks[taskId]
          if (!t) return {}
          const { [taskId]: _omit, ...rest } = s.tasks
          return {
            tasks: rest,
            columns: {
              ...s.columns,
              [t.status]: { ...s.columns[t.status], taskIds: s.columns[t.status].taskIds.filter((i) => i !== taskId) },
            },
          }
        })
      },

      moveTask: (taskId, toStatus, toIndex) => {
        set((s) => {
          const t = s.tasks[taskId]
          if (!t) return {}
          const fromStatus = t.status
          const updated = { ...s.columns }
          updated[fromStatus] = {
            ...updated[fromStatus],
            taskIds: updated[fromStatus].taskIds.filter((i) => i !== taskId),
          }
          const toIds = [...updated[toStatus].taskIds]
          const idx = typeof toIndex === "number" ? Math.min(Math.max(0, toIndex), toIds.length) : toIds.length
          toIds.splice(idx, 0, taskId)
          updated[toStatus] = { ...updated[toStatus], taskIds: toIds }

          return {
            columns: updated,
            tasks: { ...s.tasks, [taskId]: { ...t, status: toStatus, updatedAt: Date.now() } },
          }
        })
      },
    }),
    { name: "flowboard-react-store", version: 1 }
  )
)
