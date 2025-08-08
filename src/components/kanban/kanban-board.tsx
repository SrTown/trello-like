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
import type { Task, BoardColumn } from "@/lib/types"
import { useMemo, useState } from "react"
import { useAppStore } from "@/store/app-store"
import { useAuth } from "@/auth/auth-provider"
import { SortableTask } from "./sortable-task"
import { Plus } from 'lucide-react'

const COLUMN_COLORS = [
  { bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700" },
  { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  { bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  { bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700" },
  { bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" },
]

function DroppableColumn({
  id,
  children,
}: {
  id: string
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
  column,
  tasks,
  onEdit,
  onDelete,
}: {
  column: BoardColumn
  tasks: Task[]
  onEdit: (taskId: string) => void
  onDelete: (taskId: string) => void
}) {
  const colorIndex = column.position % COLUMN_COLORS.length
  const colors = COLUMN_COLORS[colorIndex]

  return (
    <div className={`rounded-lg border ${colors.bg} ${colors.border} p-4`}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className={`font-semibold ${colors.text}`}>{column.name}</h3>
        <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs text-neutral-700 border">
          {tasks.length}
        </span>
      </div>
      <DroppableColumn id={column.id}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {tasks.map((task) => (
              <SortableTask
                key={task.id}
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </SortableContext>
      </DroppableColumn>
    </div>
  )
}

export function KanbanBoard({ className = "" }: { className?: string }) {
  const { user } = useAuth()
  const { columns, tasks, currentProjectId, createTask, updateTask, deleteTask, moveTask } =
    useAppStore()
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  )
  const [addOpenFor, setAddOpenFor] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newDue, setNewDue] = useState<string>("")

  const sortedColumns = useMemo(() => 
    Object.values(columns).sort((a, b) => a.position - b.position),
    [columns]
  )

  const tasksByColumn = useMemo(() => {
    const result: Record<string, Task[]> = {}
    sortedColumns.forEach(col => {
      result[col.id] = Object.values(tasks)
        .filter(task => task.column_id === col.id)
        .sort((a, b) => a.position - b.position)
    })
    return result
  }, [tasks, sortedColumns])

  function onDragEnd(e: DragEndEvent) {
    const activeId = e.active?.id?.toString()
    const overId = e.over?.id?.toString()
    if (!activeId || !overId) return

    const task = tasks[activeId]
    if (!task) return

    // Si se suelta sobre una columna
    if (columns[overId]) {
      moveTask(activeId, overId, 0)
    }
    // Si se suelta sobre otra tarea
    else if (tasks[overId]) {
      const targetTask = tasks[overId]
      const targetTasks = tasksByColumn[targetTask.column_id] || []
      const targetIndex = targetTasks.findIndex(t => t.id === overId)
      moveTask(activeId, targetTask.column_id, targetIndex)
    }
  }

  function handleCreate(columnId: string) {
    if (!user || !currentProjectId) return
    if (!newTitle.trim()) return
    
    createTask(currentProjectId, columnId, {
      title: newTitle.trim(),
      description: newDesc || undefined,
      due_date: newDue || undefined,
    })
    
    setNewTitle("")
    setNewDesc("")
    setNewDue("")
    setAddOpenFor(null)
  }

  function onEditTask(taskId: string) {
    const t = tasks[taskId]
    if (!t) return
    const title = window.prompt("Editar título de la tarea", t.title)
    if (!title) return
    updateTask(taskId, { title: title.trim() })
  }

  function onDeleteTask(taskId: string) {
    if (confirm("¿Eliminar esta tarea?")) deleteTask(taskId)
  }

  if (sortedColumns.length === 0) {
    return (
      <div className="rounded-lg border bg-white p-6 shadow-card">
        <h3 className="font-semibold">Sin columnas configuradas</h3>
        <p className="text-neutral-600">
          Usa el botón "Columnas" en la barra superior para configurar las columnas de tu tablero.
        </p>
      </div>
    )
  }

  return (
    <div className={`grid gap-6 ${className}`} style={{ gridTemplateColumns: `repeat(${sortedColumns.length}, minmax(300px, 1fr))` }}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        {sortedColumns.map((column) => (
          <div key={column.id} className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h2 className="font-semibold">{column.name}</h2>
              <button
                onClick={() => setAddOpenFor((prev) => (prev === column.id ? null : column.id))}
                className="inline-flex items-center gap-1 rounded bg-neutral-800 text-white px-2 py-1 text-xs hover:bg-neutral-700"
              >
                <Plus className="h-4 w-4" /> Añadir
              </button>
            </div>

            {addOpenFor === column.id && (
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
                  <input
                    type="date"
                    className="rounded border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
                    value={newDue}
                    onChange={(e) => setNewDue(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      className="rounded px-3 py-1.5 text-sm hover:bg-neutral-100"
                      onClick={() => setAddOpenFor(null)}
                    >
                      Cancelar
                    </button>
                    <button
                      className="rounded bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"
                      onClick={() => handleCreate(column.id)}
                    >
                      Crear
                    </button>
                  </div>
                </div>
              </div>
            )}

            <Column
              column={column}
              tasks={tasksByColumn[column.id] || []}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          </div>
        ))}
      </DndContext>
    </div>
  )
}
