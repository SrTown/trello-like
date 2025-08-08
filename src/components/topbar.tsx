import { useAuth } from "@/auth/auth-provider"
import { useNavigate, Link } from "react-router-dom"
import { LogOut } from 'lucide-react'
import { ProjectSwitcher } from "@/components/project-switcher"
import { RoleBadge } from "@/components/role-badge"

export function Topbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = user?.name?.split(" ").map((x) => x[0]).slice(0, 2).join("") || "U"

  async function onLogout() {
    await logout()
    navigate("/login")
  }

  return (
    <header className="sticky top-0 z-10 border-b">
      <div className="bg-gradient-to-r from-brand-600 via-fuchsia-600 to-pink-500">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between gap-3 text-white">
          <Link to="/board" className="font-semibold text-lg tracking-tight">
            FlowBoard
          </Link>
          <ProjectSwitcher />
          <div className="flex items-center gap-3">
            {user ? <RoleBadge role={user.role} /> : null}
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/15 text-white grid place-items-center font-medium">
                {initials}
              </div>
              <span className="hidden md:inline text-sm">{user?.name ?? "Guest"}</span>
              {user ? (
                <button
                  onClick={onLogout}
                  className="inline-flex items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20 transition"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-sm hover:bg-white/20 transition"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
