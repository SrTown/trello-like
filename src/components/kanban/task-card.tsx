import type { Task } from "@/lib/types"
import { Pencil, Trash2, User } from 'lucide-react'

export function TaskCard({
  task,
  onEdit,
  onDelete,
}: {
  task: Task
  onEdit?: (taskId: string) => void
  onDelete?: (taskId: string) => void
}) {
  const statusColor =
    task.column_id ? "border-l-blue-400" : "border-l-gray-400"

  return (
    <div
      className={`group rounded-md bg-white shadow-card border border-neutral-200 ${statusColor} border-l-4`}
    >
      <div className="p-3">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{task.title}</div>
            {task.description ? (
              <div className="text-sm text-neutral-600 line-clamp-2 mt-1">
                {task.description}
              </div>
            ) : null}

            <div className="mt-2 flex items-center gap-2 text-xs text-neutral-500">
              {task.due_date ? (
                <span>
                  Fecha límite: {new Date(task.due_date).toLocaleDateString()}
                </span>
              ) : null}
            </div>

            {task.assignees && task.assignees.length > 0 && (
              <div className="mt-2 flex items-center gap-1">
                <User className="h-3 w-3 text-neutral-500" />
                <div className="flex gap-1">
                  {task.assignees.map((assignee) => (
                    <span
                      key={assignee.id}
                      className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs"
                    >
                      {assignee.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
