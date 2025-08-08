import { useState } from "react"
import { useAppStore } from "@/store/app-store"
import { useAuth } from "@/auth/auth-provider"
import { Folder, FolderPlus } from 'lucide-react'

export function ProjectSwitcher() {
  const { projects, currentProjectId, setCurrentProject, createProject } =
    useAppStore()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)

  const current = projects.find((p) => p.id === currentProjectId)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || loading || !user?.id) return
    
    setLoading(true)
    console.log("Attempting to create project:", name, "for user:", user?.id) // Debug
    
    try {
      const project = await createProject(name.trim(), user.id)
      if (project) {
        console.log("Project created successfully:", project) // Debug
        setName("")
        setOpen(false)
      } else {
        console.error("Failed to create project") // Debug
        alert("Error al crear el proyecto. Revisa la consola para más detalles.")
      }
    } catch (error) {
      console.error("Error in project creation:", error) // Debug
      alert("Error al crear el proyecto: " + error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20 transition"
      >
        <Folder className="h-4 w-4" />
        {current?.name ?? "Seleccionar proyecto"}
      </button>
      {open && (
        <div
          className="absolute left-0 mt-2 w-64 rounded-md bg-white p-2 shadow-card ring-1 ring-black/5"
          onMouseLeave={() => setOpen(false)}
        >
          <div className="max-h-64 overflow-auto">
            {projects.length ? (
              projects.map((p) => (
                <button
                  key={p.id}
                  className="w-full text-left rounded px-2 py-1.5 hover:bg-neutral-100 text-neutral-700"
                  onClick={() => {
                    setCurrentProject(p.id)
                    setOpen(false)
                  }}
                >
                  {p.name}
                </button>
              ))
            ) : (
              <div className="px-2 py-1.5 text-neutral-500 text-sm">
                Sin proyectos
              </div>
            )}
          </div>
          
          <div className="my-2 border-t" />
          <form onSubmit={submit} className="space-y-2">
            <label className="block text-xs font-medium text-neutral-600">
              Nuevo proyecto
            </label>
            <input
              className="w-full rounded border px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Nombre del proyecto"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-1 rounded bg-brand-600 px-2 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              <FolderPlus className="h-4 w-4" />
              {loading ? "Creando..." : "Crear"}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
