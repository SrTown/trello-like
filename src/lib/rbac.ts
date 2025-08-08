import type { Permission, Role } from "./types"

const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    "project:create",
    "project:update",
    "project:delete",
    "task:create",
    "task:update",
    "task:delete",
    "role:assign",
  ],
  manager: [
    "project:create",
    "project:update",
    "project:delete",
    "task:create",
    "task:update",
    "task:delete",
  ],
  member: ["task:create", "task:update"],
}

export const can = (role: Role | undefined, permission: Permission) =>
  !!role && (rolePermissions[role]?.includes(permission) ?? false)

export const permissionsFor = (role: Role) => rolePermissions[role]