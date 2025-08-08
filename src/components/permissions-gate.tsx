import { useAuth } from "@/auth/auth-provider"
import type { Permission } from "@/lib/types"

export function PermissionsGate({
  permission,
  children,
  fallback = null,
}: {
  permission: Permission
  children?: React.ReactNode
  fallback?: React.ReactNode
}) {
  const { can } = useAuth()
  return <>{can(permission) ? children : fallback}</>
}
