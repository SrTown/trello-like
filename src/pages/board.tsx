import { useEffect } from "react"
import { useAppStore } from "@/store/app-store"
import { Topbar } from "@/components/topbar"
import { KanbanBoard } from "@/components/kanban/kanban-board"
import { useAuth } from "@/auth/auth-provider"
import { Link } from "react-router-dom"

export default function BoardPage() {
  const { seedIfEmpty, currentProjectId, projects } = useAppStore()
  const { user } = useAuth()

  useEffect(() => {
    seedIfEmpty()
  }, [seedIfEmpty])

  return (
    <main className="min-h-screen flex flex-col">
      <Topbar />
      <div className="mx-auto max-w-6xl px-4 py-6 w-full space-y-6">
        {!user ? (
          <div className="rounded-lg border bg-white p-6 shadow-card">
            <h2 className="text-lg font-semibold">Welcome to FlowBoard</h2>
            <p className="text-neutral-600 mt-1">
              Please login or register to start collaborating on projects.
            </p>
            <div className="mt-3 flex gap-2">
              <Link to="/login" className="rounded bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">Login</Link>
              <Link to="/register" className="rounded border px-4 py-2 hover:bg-neutral-50">Register</Link>
            </div>
          </div>
        ) : null}

        {projects.length > 0 && currentProjectId ? (
          <KanbanBoard />
        ) : (
          <div className="rounded-lg border bg-white p-6 shadow-card">
            <h3 className="font-semibold">No project selected</h3>
            <p className="text-neutral-600">Use the project switcher in the top bar to create or select a project.</p>
          </div>
        )}
      </div>
    </main>
  )
}
