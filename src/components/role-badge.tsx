import type { Role } from "@/lib/types"

export function RoleBadge({ role = "admin" as Role }) {
  const styles = "bg-rose-100 text-rose-700"
  const label = "Administrador"

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${styles}`}>
      {label}
    </span>
  )
}
