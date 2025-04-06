export type Role = "ADMIN" | "STUDENT" | "MANAGER" | "INSTRUCTOR" | "NON_EDITING_INSTRUCTOR"

export const isValidRole = (role: string): role is Role => {
  return ["ADMIN", "STUDENT", "MANAGER", "INSTRUCTOR", "NON_EDITING_INSTRUCTOR"].includes(role)
} 