import type { Task } from "@/lib/types"
import { Pencil, Trash2 } from 'lucide-react'

export function TaskCard({
  task,
  assigneeName = "Sin asignar",
  onEdit,
  onDelete,
}: {
  task: Task
  assigneeName?: string
  onEdit?: (taskId: string) => void
  onDelete?: (taskId: string) => void
}) {
  const statusColor =
    task.status === "todo"
      ? "border-l-sky-400"
      : task.status === "inprogress"
      ? "border-l-amber-500"
      : "border-l-emerald-500"

  return (
    <div
      className={`group rounded-md bg-white shadow-card border border-neutral-200 ${statusColor} border-l-4`}
    >
      <div className="p-3">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{task.title}</div>
            {task.description ? (
              <div className="text-sm text-neutral-600 line-clamp-2">
                {task.description}
              </div>
            ) : null}
            <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
              <span>Responsable: {assigneeName}</span>
              {task.dueDate ? (
                <span className="ml-2">
                  Fecha límite: {new Date(task.dueDate).toLocaleDateString()}
                </span>
              ) : null}
            </div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 flex items-center gap-1">
            <button
              aria-label="Editar tarea"
              className="rounded p-1 hover:bg-neutral-100"
              onClick={() => onEdit?.(task.id)}
            >
              <Pencil className="h-4 w-4 text-neutral-700" />
            </button>
            <button
              aria-label="Eliminar tarea"
              className="rounded p-1 hover:bg-neutral-100"
              onClick={() => onDelete?.(task.id)}
            >
              <Trash2 className="h-4 w-4 text-red-600" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}