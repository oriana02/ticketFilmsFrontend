// Versión de esta build (1, 2 o 3). Cada despliegue la define en sus variables de entorno.
export const APP_VERSION = Number(import.meta.env.VITE_APP_VERSION) || 3;
export const ADMIN_GROUP = import.meta.env.VITE_ADMIN_GROUP || "admin";

const URLS = {
  1: import.meta.env.VITE_VERSION_1_URL,
  2: import.meta.env.VITE_VERSION_2_URL,
  3: import.meta.env.VITE_VERSION_3_URL,
};

// El grupo de cada versión en Cognito es version1, version2, version3.
export const VERSIONS = [1, 2, 3].map((n) => ({
  n,
  group: `version${n}`,
  label: `Versión ${n}`,
  url: URLS[n] || "",
}));

export function groupsOf(profile) {
  const g = profile?.["cognito:groups"];
  return Array.isArray(g) ? g : [];
}

export function isAdmin(profile) {
  return groupsOf(profile).includes(ADMIN_GROUP);
}

// El admin ve todas; el resto solo las versiones de sus grupos.
export function userVersions(profile) {
  if (isAdmin(profile)) return VERSIONS;
  const groups = groupsOf(profile);
  return VERSIONS.filter((v) => groups.includes(v.group));
}

export function canAccessThisVersion(profile) {
  return userVersions(profile).some((v) => v.n === APP_VERSION);
}
