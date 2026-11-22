export const ADMIN_GROUP = import.meta.env.VITE_ADMIN_GROUP || "admin";
export const VERSION_GROUP = import.meta.env.VITE_VERSION_GROUP;

export const VERSIONS = [
  {
    group: "version1",
    label: "v1.0.0",
    url: import.meta.env.VITE_VERSION_1_URL,
  },
  {
    group: "version2",
    label: "v1.1.0",
    url: import.meta.env.VITE_VERSION_2_URL,
  },
  {
    group: "version3",
    label: "v2.0.0",
    url: import.meta.env.VITE_VERSION_3_URL,
  },
];

export function getGroups(user) {
  const g = user?.profile?.["cognito:groups"];
  return Array.isArray(g) ? g : [];
}

export function hasAccess(user) {
  const groups = getGroups(user);
  return groups.includes(ADMIN_GROUP) || groups.includes(VERSION_GROUP);
}

// Versión a la que pertenece el usuario (null si es admin o no tiene ninguna).
export function homeVersion(user) {
  const groups = getGroups(user);
  return VERSIONS.find((v) => groups.includes(v.group)) ?? null;
}
