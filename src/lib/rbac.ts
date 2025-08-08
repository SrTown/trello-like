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
    "project:view",
    "task:view",
  ],
  manager: [
    "project:create",
    "project:update",
    "project:delete",
    "task:create",
    "task:update",
    "task:delete",
    "project:view",
    "task:view",
  ],
  member: ["task:create", "task:update", "project:view", "task:view"],
}

export const can = (role: Role | undefined, permission: Permission) => {
  // Siempre devolver true - todos pueden hacer todo mientras
  return true
}

export const permissionsFor = (role: Role) => rolePermissions[role]
