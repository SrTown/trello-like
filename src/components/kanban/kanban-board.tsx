import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import type { ColumnId, Task } from "@/lib/types"
import { useMemo, useState } from "react"
import { useAppStore } from "@/store/app-store"
import { useAuth } from "@/auth/auth-provider"
import { PermissionsGate } from "@/components/permissions-gate"
import { SortableTask } from "./sortable-task"
import { Plus } from 'lucide-react'

function DroppableColumn({
  id,
  children,
}: {
  id: ColumnId
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div ref={setNodeRef} className={isOver ? "ring-2 ring-brand-500 rounded-lg" : ""}>
      {children}
    </div>
  )
}

function Column({
  id,
  title,
  hintColor,
  taskIds,
  tasks,
  onEdit,
  onDelete,
  assigneeNameById,
}: {
  id: ColumnId
  title: string
  hintColor: "sky" | "amber" | "emerald"
  taskIds: string[]
  tasks: Record<string, Task>
  onEdit: (taskId: string) => void
  onDelete: (taskId: string) => void
  assigneeNameById: (uid?: string) => string
}) {
  const bg =
    hintColor === "sky"
      ? "bg-sky-50 border-sky-200"
      : hintColor === "amber"
        ? "bg-amber-50 border-amber-200"
        : "bg-emerald-50 border-emerald-200"
  const titleColor =
    hintColor === "sky"
      ? "text-sky-700"
      : hintColor === "amber"
        ? "text-amber-700"
        : "text-emerald-700"

  return (
    <div className={`rounded-lg border ${bg} p-4`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-semibold ${titleColor}`}>{title}</h3>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs text-neutral-700 border">
          {taskIds.length}
        </span>
      </div>
      <DroppableColumn id={id}>
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {taskIds.map((taskId) => {
              const task = tasks[taskId]
              if (!task) return null
              return (
                <SortableTask
                  key={taskId}
                  task={task}
                  assigneeName={assigneeNameById(task.assigneeId)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              )
            })}
          </div>
        </SortableContext>
      </DroppableColumn>
    </div>
  )
}

export function KanbanBoard({ className = "" }: { className?: string }) {
  const { user, users, can } = useAuth()
  const { columns, tasks, currentProjectId, createTask, updateTask, deleteTask, moveTask } =
    useAppStore()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )
  const [addOpenFor, setAddOpenFor] = useState<ColumnId | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newAssignee, setNewAssignee] = useState<string>("")
  const [newDue, setNewDue] = useState<string>("")

  const assigneeNameById = (uid?: string) =>
    users.find((u) => u.id === uid)?.name ?? "Sin asignar"

  function onDragEnd(e: DragEndEvent) {
    const activeId = e.active?.id?.toString()
    const overId = e.over?.id?.toString()
    if (!activeId || !overId) return

    let from: ColumnId | undefined
    let fromIndex = -1
    for (const [colId, col] of Object.entries(columns) as [
      ColumnId,
      { id: ColumnId; name: string; taskIds: string[] }
    ][]) {
      const idx = col.taskIds.indexOf(activeId)
      if (idx !== -1) {
        from = colId
        fromIndex = idx
        break
      }
    }

    let to: ColumnId | undefined
    let toIndex: number | undefined = undefined

    const isOverTask = !!tasks[overId]
    if (isOverTask) {
      for (const [colId, col] of Object.entries(columns) as [
        ColumnId,
        { id: ColumnId; name: string; taskIds: string[] }
      ][]) {
        const idx = col.taskIds.indexOf(overId)
        if (idx !== -1) {
          to = colId
          toIndex = idx
          break
        }
      }
    } else {
      if (["todo", "inprogress", "done"].includes(overId)) {
        to = overId as ColumnId
        toIndex = columns[to].taskIds.length
      }
    }

    if (!from || !to) return
    if (!can("task:update")) return

    if (from === to) {
      if (typeof toIndex === "number" && fromIndex !== toIndex) {
        moveTask(activeId, to, toIndex)
      }
    } else {
      moveTask(activeId, to, toIndex)
    }
  }

  function handleCreate(status: ColumnId) {
    if (!user || !currentProjectId || !can("task:create")) return
    if (!newTitle.trim()) return
    createTask(currentProjectId, status, {
      title: newTitle.trim(),
      description: newDesc || undefined,
      assigneeId: newAssignee || undefined,
      dueDate: newDue || undefined,
    })
    setNewTitle("")
    setNewDesc("")
    setNewAssignee("")
    setNewDue("")
    setAddOpenFor(null)
  }

  function onEditTask(taskId: string) {
    const t = tasks[taskId]
    if (!t || !can("task:update")) return
    const title = window.prompt("Editar título de la tarea", t.title)
    if (!title) return
    updateTask(taskId, { title: title.trim() })
  }

  function onDeleteTask(taskId: string) {
    if (!can("task:delete")) return
    if (confirm("¿Eliminar esta tarea?")) deleteTask(taskId)
  }

  const columnsMeta = useMemo(
    () => [
      { id: "todo" as ColumnId, title: "Pendientes", hint: "sky" as const },
      { id: "inprogress" as ColumnId, title: "En progreso", hint: "amber" as const },
      { id: "done" as ColumnId, title: "Hecho", hint: "emerald" as const },
    ],
    []
  )

  return (
    <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        {columnsMeta.map((c) => (
          <div key={c.id} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-semibold">{c.title}</h2>
              <PermissionsGate permission="task:create">
                <button
                  onClick={() => setAddOpenFor((prev) => (prev === c.id ? null : c.id))}
                  className="inline-flex items-center gap-1 rounded bg-neutral-800 text-white px-2 py-1 text-xs hover:bg-neutral-700"
                >
                  <Plus className="h-4 w-4" /> Añadir
                </button>
              </PermissionsGate>
            </div>

            {addOpenFor === c.id && (
              <div className="rounded-lg border bg-white p-3 shadow-card">
                <div className="grid gap-2">
                  <input
                    className="rounded border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Título de la tarea"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                  <textarea
                    className="rounded border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Descripción"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      className="rounded border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                      value={newAssignee}
                      onChange={(e) => setNewAssignee(e.target.value)}
                    >
                      <option value="">Sin asignar</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="date"
                      className="rounded border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                      value={newDue}
                      onChange={(e) => setNewDue(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      className="rounded px-3 py-1.5 text-sm hover:bg-neutral-100"
                      onClick={() => setAddOpenFor(null)}
                    >
                      Cancelar
                    </button>
                    <button
                      className="rounded bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                      onClick={() => handleCreate(c.id)}
                    >
                      Crear
                    </button>
                  </div>
                </div>
              </div>
            )}

            <Column
              id={c.id}
              title={c.title}
              hintColor={c.hint}
              taskIds={columns[c.id].taskIds}
              tasks={tasks}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              assigneeNameById={assigneeNameById}
            />
          </div>
        ))}
      </DndContext>
    </div>
  )
}