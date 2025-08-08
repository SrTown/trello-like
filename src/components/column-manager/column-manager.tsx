import { useState } from "react"
import { useAppStore } from "@/store/app-store"
import { Plus, Settings, Trash2, GripVertical, Palette } from 'lucide-react'
import type { BoardColumn } from "@/lib/types"
import { DndContext, closestCenter, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

const COLUMN_COLORS = [
  { name: "Azul", bg: "bg-sky-50", border: "border-sky-200", text: "text-sky-700" },
  { name: "Amarillo", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
  { name: "Verde", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
  { name: "Púrpura", bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
  { name: "Rosa", bg: "bg-pink-50", border: "border-pink-200", text: "text-pink-700" },
  { name: "Gris", bg: "bg-gray-50", border: "border-gray-200", text: "text-gray-700" },
]

function SortableColumnItem({ 
  column, 
  onEdit, 
  onDelete 
}: { 
  column: BoardColumn
  onEdit: (column: BoardColumn) => void
  onDelete: (columnId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: column.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const colorIndex = column.position % COLUMN_COLORS.length
  const colors = COLUMN_COLORS[colorIndex]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border ${colors.bg} ${colors.border}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </div>
      
      <div className="flex-1">
        <div className={`font-medium ${colors.text}`}>{column.name}</div>
        <div className="text-xs text-gray-500">
          Posición: {column.position + 1}
          {column.is_default && " • Por defecto"}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onEdit(column)}
          className="p-1 rounded hover:bg-white/50 transition-colors"
          title="Editar columna"
        >
          <Settings className="h-4 w-4 text-gray-600" />
        </button>
        
        {!column.is_default && (
          <button
            onClick={() => onDelete(column.id)}
            className="p-1 rounded hover:bg-white/50 transition-colors"
            title="Eliminar columna"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        )}
      </div>
    </div>
  )
}

function ColumnEditModal({ 
  column, 
  onSave, 
  onClose 
}: { 
  column: BoardColumn | null
  onSave: (data: { name: string; color?: string }) => void
  onClose: () => void
}) {
  const [name, setName] = useState(column?.name || "")
  const [selectedColor, setSelectedColor] = useState(0)

  if (!column) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onSave({ name: name.trim() })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-semibold mb-4">
          {column ? "Editar columna" : "Nueva columna"}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de la columna
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Ej: En revisión"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color de la columna
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COLUMN_COLORS.map((color, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setSelectedColor(index)}
                  className={`p-3 rounded-lg border-2 transition-all ${color.bg} ${color.border} ${
                    selectedColor === index ? "ring-2 ring-brand-500" : ""
                  }`}
                >
                  <div className={`text-xs font-medium ${color.text}`}>
                    {color.name}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-600 text-white rounded hover:bg-brand-700 transition-colors"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function ColumnManager({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean
  onClose: () => void
}) {
  const { columns, currentProjectId, createColumn, updateColumn, deleteColumn, reorderColumns } = useAppStore()
  const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null)
  const [showNewColumn, setShowNewColumn] = useState(false)

  const sensors = useSensors(useSensor(PointerSensor))

  const sortedColumns = Object.values(columns).sort((a, b) => a.position - b.position)

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over || active.id === over.id) return

    const oldIndex = sortedColumns.findIndex(col => col.id === active.id)
    const newIndex = sortedColumns.findIndex(col => col.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      reorderColumns(active.id as string, newIndex)
    }
  }

  const handleSaveColumn = async (data: { name: string }) => {
    if (editingColumn) {
      await updateColumn(editingColumn.id, { name: data.name })
    }
    setEditingColumn(null)
  }

  const handleCreateColumn = async (data: { name: string }) => {
    if (!currentProjectId) return
    await createColumn(currentProjectId, data.name)
    setShowNewColumn(false)
  }

  const handleDeleteColumn = async (columnId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta columna? Se eliminarán todas las tareas que contenga.")) {
      await deleteColumn(columnId)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
        <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
          <div className="p-6 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Configurar columnas</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <p className="text-gray-600 text-sm mt-1">
              Arrastra las columnas para reordenarlas
            </p>
          </div>

          <div className="p-6 overflow-y-auto max-h-96">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedColumns.map(col => col.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {sortedColumns.map((column) => (
                    <SortableColumnItem
                      key={column.id}
                      column={column}
                      onEdit={setEditingColumn}
                      onDelete={handleDeleteColumn}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>

            {sortedColumns.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Settings className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No hay columnas configuradas</p>
                <p className="text-sm">Crea tu primera columna para comenzar</p>
              </div>
            )}
          </div>

          <div className="p-6 border-t bg-gray-50">
            <button
              onClick={() => setShowNewColumn(true)}
              className="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-brand-500 hover:bg-brand-50 transition-colors text-gray-600 hover:text-brand-600"
            >
              <Plus className="h-5 w-5" />
              Añadir nueva columna
            </button>
          </div>
        </div>
      </div>

      {/* Modal para editar columna */}
      {editingColumn && (
        <ColumnEditModal
          column={editingColumn}
          onSave={handleSaveColumn}
          onClose={() => setEditingColumn(null)}
        />
      )}

      {/* Modal para nueva columna */}
      {showNewColumn && (
        <ColumnEditModal
          column={{ id: "", project_id: "", name: "", position: 0, is_default: false, created_at: "" }}
          onSave={handleCreateColumn}
          onClose={() => setShowNewColumn(false)}
        />
      )}
    </>
  )
}
