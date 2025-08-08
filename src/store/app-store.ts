import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { BoardState, Project, Task, BoardColumn, User } from "@/lib/types"
import { crdCreate, crdUpdate, crdRemove, crdRead } from "@/lib/crd"

type Actions = {
  seedIfEmpty: () => void
  loadFromBackend: () => Promise<void>
  createProject: (name: string, ownerId?: string) => Promise<Project | null>
  setCurrentProject: (id: string) => void
  createTask: (projectId: string, columnId: string, input: { title: string; description?: string; due_date?: string }) => Promise<Task | null>
  updateTask: (taskId: string, input: Partial<Task>) => Promise<void>
  deleteTask: (taskId: string) => Promise<void>
  moveTask: (taskId: string, toColumnId: string, toPosition?: number) => Promise<void>
  assignUserToTask: (taskId: string, userId: string) => Promise<void>
  unassignUserFromTask: (taskId: string, userId: string) => Promise<void>
  // 🔥 NUEVAS FUNCIONES PARA COLUMNAS
  createColumn: (projectId: string, name: string) => Promise<BoardColumn | null>
  updateColumn: (columnId: string, input: { name?: string; position?: number }) => Promise<void>
  deleteColumn: (columnId: string) => Promise<void>
  reorderColumns: (columnId: string, newPosition: number) => Promise<void>
}

export const useAppStore = create<BoardState & Actions>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: undefined,
      tasks: {},
      columns: {},
      users: [],

      seedIfEmpty: () => {
        console.log("Demo mode - no real data created")
      },

      loadFromBackend: async () => {
        try {
          const state = get()
          
          // Cargar proyectos
          const projectsRes = await crdRead("projects")
          if (projectsRes.ok && projectsRes.data) {
            const projects = projectsRes.data.map((p: any) => ({
              id: p.id,
              name: p.name,
              owner_id: p.owner_id,
              archived_at: p.archived_at,
              created_at: p.created_at
            }))

            const currentProjectId = state.currentProjectId || (projects.length > 0 ? projects[0].id : undefined)
            
            let columns: Record<string, BoardColumn> = {}
            let tasks: Record<string, Task> = {}

            if (currentProjectId) {
              // Cargar columnas del proyecto actual
              const columnsRes = await crdRead("board_columns", { project_id: currentProjectId })
              if (columnsRes.ok && columnsRes.data) {
                columnsRes.data.forEach((col: any) => {
                  columns[col.id] = {
                    id: col.id,
                    project_id: col.project_id,
                    name: col.name,
                    position: col.position,
                    is_default: col.is_default,
                    created_at: col.created_at
                  }
                })
              }

              // Cargar tareas del proyecto actual
              const tasksRes = await crdRead("tasks", { project_id: currentProjectId })
              if (tasksRes.ok && tasksRes.data) {
                for (const t of tasksRes.data) {
                  // Cargar asignados para cada tarea
                  const assigneesRes = await crdRead("task_assignees", { task_id: t.id })
                  const assignees: User[] = []
                  
                  if (assigneesRes.ok && assigneesRes.data) {
                    for (const assignment of assigneesRes.data) {
                      const userRes = await crdRead("users", { id: assignment.user_id })
                      if (userRes.ok && userRes.data && userRes.data[0]) {
                        const user = userRes.data[0]
                        assignees.push({
                          id: user.id,
                          name: user.name,
                          email: user.email,
                          role: "admin",
                          createdAt: new Date(user.created_at).getTime()
                        })
                      }
                    }
                  }

                  tasks[t.id] = {
                    id: t.id,
                    project_id: t.project_id,
                    column_id: t.column_id,
                    title: t.title,
                    description: t.description,
                    due_date: t.due_date,
                    position: t.position,
                    created_by: t.created_by,
                    archived_at: t.archived_at,
                    created_at: t.created_at,
                    updated_at: t.updated_at,
                    assignees
                  }
                }
              }
            }

            set({
              projects,
              currentProjectId,
              columns,
              tasks
            })
          }
        } catch (error) {
          console.error("Error loading from backend:", error)
        }
      },

      createProject: async (name, ownerId) => {
        try {
          const projectId = crypto.randomUUID()
          const projectData = {
            id: projectId,
            name,
            owner_id: ownerId || null,
            created_at: new Date().toISOString()
          }
          
          console.log("Creating project:", projectData)
          
          const res = await crdCreate("projects", projectData)
          console.log("Project creation response:", res)
          
          if (res.ok) {
            const project: Project = {
              id: projectId,
              name,
              owner_id: ownerId,
              created_at: projectData.created_at
            }

            // Crear columnas por defecto
            const defaultColumns = [
              { name: "Pendientes", position: 0 },
              { name: "En progreso", position: 1 },
              { name: "Hecho", position: 2 }
            ]

            console.log("Creating default columns for project:", projectId)

            const columnPromises = defaultColumns.map(col => {
              const columnData = {
                id: crypto.randomUUID(),
                project_id: projectId,
                name: col.name,
                position: col.position,
                is_default: true,
                created_at: new Date().toISOString()
              }
              console.log("Creating column:", columnData)
              return crdCreate("board_columns", columnData)
            })

            const columnResults = await Promise.all(columnPromises)
            console.log("Column creation results:", columnResults)
            
            set((s) => ({
              projects: [...s.projects, project],
              currentProjectId: project.id,
              tasks: {},
              columns: {},
            }))

            // Recargar para obtener las columnas creadas
            await get().loadFromBackend()
            
            return project
          } else {
            console.error("Failed to create project:", res)
            return null
          }
        } catch (error) {
          console.error("Error creating project:", error)
          return null
        }
      },

      setCurrentProject: (id) => {
        set({ currentProjectId: id })
        get().loadFromBackend()
      },

      createTask: async (projectId, columnId, input) => {
        try {
          const taskData = {
            id: crypto.randomUUID(),
            project_id: projectId,
            column_id: columnId,
            title: input.title,
            description: input.description !== undefined ? input.description : undefined,
            due_date: input.due_date !== undefined ? input.due_date : undefined,
            position: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }

          console.log("Creating task:", taskData)

          const res = await crdCreate("tasks", taskData)
          console.log("Task creation response:", res)
          
          if (res.ok) {
            const task: Task = {
              ...taskData,
              assignees: []
            }

            set((s) => ({
              tasks: { ...s.tasks, [task.id]: task }
            }))

            return task
          }
          return null
        } catch (error) {
          console.error("Error creating task:", error)
          return null
        }
      },

      updateTask: async (taskId, input) => {
        try {
          const updateData: Record<string, any> = {
            updated_at: new Date().toISOString()
          }
          
          if (input.title !== undefined) updateData.title = input.title
          if (input.description !== undefined) updateData.description = input.description
          if (input.due_date !== undefined) updateData.due_date = input.due_date
          if (input.column_id !== undefined) updateData.column_id = input.column_id
          if (input.position !== undefined) updateData.position = input.position

          const res = await crdUpdate("tasks", `id=${taskId}`, updateData)
          if (res.ok) {
            set((s) => {
              const task = s.tasks[taskId]
              if (!task) return {}
              return {
                tasks: { ...s.tasks, [taskId]: { ...task, ...input, updated_at: updateData.updated_at } }
              }
            })
          }
        } catch (error) {
          console.error("Error updating task:", error)
        }
      },

      deleteTask: async (taskId) => {
        try {
          const res = await crdRemove("tasks", `id=${taskId}`)
          if (res.ok) {
            set((s) => {
              const { [taskId]: _omit, ...rest } = s.tasks
              return { tasks: rest }
            })
          }
        } catch (error) {
          console.error("Error deleting task:", error)
        }
      },

      moveTask: async (taskId, toColumnId, toPosition = 0) => {
        set((s) => {
          const task = s.tasks[taskId]
          if (!task) return {}
          return {
            tasks: { 
              ...s.tasks, 
              [taskId]: { 
                ...task, 
                column_id: toColumnId, 
                position: toPosition,
                updated_at: new Date().toISOString()
              } 
            }
          }
        })

        try {
          await get().updateTask(taskId, { column_id: toColumnId, position: toPosition })
        } catch (error) {
          console.error("Error moving task:", error)
          get().loadFromBackend()
        }
      },

      assignUserToTask: async (taskId, userId) => {
        try {
          const res = await crdCreate("task_assignees", {
            task_id: taskId,
            user_id: userId
          })
          if (res.ok) {
            get().loadFromBackend()
          }
        } catch (error) {
          console.error("Error assigning user to task:", error)
        }
      },

      unassignUserFromTask: async (taskId, userId) => {
        try {
          const res = await crdRemove("task_assignees", `task_id=${taskId}&user_id=${userId}`)
          if (res.ok) {
            get().loadFromBackend()
          }
        } catch (error) {
          console.error("Error unassigning user from task:", error)
        }
      },

      // 🔥 NUEVAS FUNCIONES PARA GESTIÓN DE COLUMNAS
      createColumn: async (projectId, name) => {
        try {
          const state = get()
          const existingColumns = Object.values(state.columns)
          const maxPosition = existingColumns.length > 0 
            ? Math.max(...existingColumns.map(col => col.position)) 
            : -1

          const columnData = {
            id: crypto.randomUUID(),
            project_id: projectId,
            name,
            position: maxPosition + 1,
            is_default: false,
            created_at: new Date().toISOString()
          }

          console.log("Creating column:", columnData)

          const res = await crdCreate("board_columns", columnData)
          console.log("Column creation response:", res)

          if (res.ok) {
            const column: BoardColumn = columnData

            set((s) => ({
              columns: { ...s.columns, [column.id]: column }
            }))

            return column
          }
          return null
        } catch (error) {
          console.error("Error creating column:", error)
          return null
        }
      },

      updateColumn: async (columnId, input) => {
        try {
          const updateData: Record<string, any> = {}
          
          if (input.name !== undefined) updateData.name = input.name
          if (input.position !== undefined) updateData.position = input.position

          const res = await crdUpdate("board_columns", `id=${columnId}`, updateData)
          if (res.ok) {
            set((s) => {
              const column = s.columns[columnId]
              if (!column) return {}
              return {
                columns: { ...s.columns, [columnId]: { ...column, ...input } }
              }
            })
          }
        } catch (error) {
          console.error("Error updating column:", error)
        }
      },

      deleteColumn: async (columnId) => {
        try {
          // Primero eliminar todas las tareas de esta columna
          const state = get()
          const tasksInColumn = Object.values(state.tasks).filter(task => task.column_id === columnId)
          
          for (const task of tasksInColumn) {
            await crdRemove("tasks", `id=${task.id}`)
          }

          // Luego eliminar la columna
          const res = await crdRemove("board_columns", `id=${columnId}`)
          if (res.ok) {
            set((s) => {
              const { [columnId]: _omitColumn, ...restColumns } = s.columns
              const restTasks = Object.fromEntries(
                Object.entries(s.tasks).filter(([_, task]) => task.column_id !== columnId)
              )
              return {
                columns: restColumns,
                tasks: restTasks
              }
            })
          }
        } catch (error) {
          console.error("Error deleting column:", error)
        }
      },

      reorderColumns: async (columnId, newPosition) => {
        try {
          const state = get()
          const columns = Object.values(state.columns).sort((a, b) => a.position - b.position)
          
          // Reordenar localmente primero
          const updatedColumns = [...columns]
          const columnIndex = updatedColumns.findIndex(col => col.id === columnId)
          
          if (columnIndex === -1) return

          const [movedColumn] = updatedColumns.splice(columnIndex, 1)
          updatedColumns.splice(newPosition, 0, movedColumn)

          // Actualizar posiciones
          const updatePromises = updatedColumns.map((col, index) => {
            if (col.position !== index) {
              return get().updateColumn(col.id, { position: index })
            }
            return Promise.resolve()
          })

          await Promise.all(updatePromises)

          // Recargar desde backend para asegurar consistencia
          await get().loadFromBackend()
        } catch (error) {
          console.error("Error reordering columns:", error)
        }
      },
    }),
    { name: "flowboard-react-store", version: 5 }
  )
)
