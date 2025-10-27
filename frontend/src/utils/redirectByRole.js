// src/utils/redirectByRole.js
export function getPathByRole(roleName) {
  if (!roleName) return "/";
  const role = roleName.toLowerCase();
  if (role === "alumno") return "/agendarcita";
  if (role === "coordinacion") return "/panel-coordinacion";
  if (role === "admin") return "/panel-admin";
  return "/";
}

export function redirectByRole(roleName, navigate) {
  const path = getPathByRole(roleName);
  navigate(path, { replace: true });
}
