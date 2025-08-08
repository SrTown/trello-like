import { useEffect } from "react"
import { useAppStore } from "@/store/app-store"
import { Topbar } from "@/components/topbar"
import { KanbanBoard } from "@/components/kanban/kanban-board"
import { useAuth } from "@/auth/auth-provider"
import { Link } from "react-router-dom"

export default function BoardPage() {
  const { seedIfEmpty, loadFromBackend, currentProjectId, projects } = useAppStore()
  const { user, token } = useAuth()

  useEffect(() => {
    if (user && token) {
      // Cargar datos del backend cuando el usuario esté autenticado
      loadFromBackend()
    } else {
      // Solo usar datos demo si no hay usuario
      seedIfEmpty()
    }
  }, [user, token, loadFromBackend, seedIfEmpty])

  return (
    <main className="min-h-screen flex flex-col">
      <Topbar />
      <div className="mx-auto max-w-6xl px-4 py-6 w-full space-y-6">
        {!user ? (
          <div className="rounded-lg border bg-white p-6 shadow-card">
            <h2 className="text-lg font-semibold">Bienvenido a FlowBoard</h2>
            <p className="text-neutral-600 mt-1">
              Por favor inicia sesión o regístrate para comenzar a colaborar en
              proyectos.
            </p>
            <div className="mt-3 flex gap-2">
              <Link
                to="/login"
                className="rounded bg-brand-600 px-4 py-2 text-white hover:bg-brand-700"
              >
                Iniciar sesión
              </Link>
              <Link
                to="/register"
                className="rounded border px-4 py-2 hover:bg-neutral-50"
              >
                Registrarse
              </Link>
            </div>
          </div>
        ) : null}

        {user && projects.length > 0 && currentProjectId ? (
          <KanbanBoard />
        ) : user ? (
          <div className="rounded-lg border bg-white p-6 shadow-card">
            <h3 className="font-semibold">Ningún proyecto encontrado</h3>
            <p className="text-neutral-600">
              Usa el selector de proyectos en la barra superior para crear tu primer proyecto.
            </p>
          </div>
        ) : null}
      </div>
    </main>
  )
}
