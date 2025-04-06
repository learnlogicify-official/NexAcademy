import { Role } from "@prisma/client"

export { Role }

export const VALID_ROLES = Object.values(Role)

export function isValidRole(role: string): role is Role {
  return VALID_ROLES.includes(role as Role)
}

export function getRoleDescription(role: Role): string {
  const descriptions: Record<Role, string> = {
    STUDENT: "Default role for new users",
    MANAGER: "Can manage courses and users",
    ADMIN: "Full system access",
    INSTRUCTOR: "Can create and edit courses",
    NON_EDITING_INSTRUCTOR: "Can view courses but not edit them"
  }
  return descriptions[role]
} 