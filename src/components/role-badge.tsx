import type { Role } from "@/lib/types"

export function RoleBadge({ role = "member" as Role }) {
  const styles =
    role === "admin"
      ? "bg-rose-100 text-rose-700"
      : role === "manager"
      ? "bg-amber-100 text-amber-800"
      : "bg-emerald-100 text-emerald-700"

  const label =
    role === "admin" ? "Administrador" : role === "manager" ? "Gestor" : "Miembro"

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${styles}`}>
      {label}
    </span>
  )
}