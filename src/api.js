export const API_URL = "https://jolly-sea-36fd.iri20rob94.workers.dev";

export const ADMIN_TOKEN_STORAGE_KEY = "cineverse_admin_token";

export function getAdminToken() {
  try {
    return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

export function setAdminToken(token) {
  try {
    localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, String(token || "").trim());
    return true;
  } catch {
    return false;
  }
}

export function clearAdminToken() {
  try {
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

function adminHeaders(extraHeaders = {}) {
  const token = getAdminToken();

  return {
    ...extraHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function parseApiError(response, fallbackMessage) {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  const message =
    data?.error ||
    data?.message ||
    fallbackMessage ||
    `API failed with status ${response.status}`;

  const error = new Error(message);
  error.status = response.status;
  error.data = data;

  return error;
}

export async function apiGet(path) {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    if (path.startsWith("/presets")) {
      console.warn(`Cloud presets offline, fallback empty: ${path}`);
      return { ok: true, items: [] };
    }

    throw await parseApiError(response, `API GET failed: ${path}`);
  }

  return response.json();
}

export async function apiPost(path, data = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: adminHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw await parseApiError(response, `API POST failed: ${path}`);
  }

  return response.json();
}

export async function apiPut(path, data = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: adminHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw await parseApiError(response, `API PUT failed: ${path}`);
  }

  return response.json();
}

export async function apiPatch(path, data = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "PATCH",
    headers: adminHeaders({
      "Content-Type": "application/json"
    }),
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw await parseApiError(response, `API PATCH failed: ${path}`);
  }

  return response.json();
}

export async function apiDelete(path) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "DELETE",
    headers: adminHeaders()
  });

  if (!response.ok) {
    throw await parseApiError(response, `API DELETE failed: ${path}`);
  }

  return response.json();
}

export function toQueryString(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    search.set(key, value);
  });

  return search.toString();
}

export async function apiCatalog(params = {}) {
  const query = toQueryString(params);
  return apiGet(`/catalog${query ? `?${query}` : ""}`);
}

export async function apiCatalogStats() {
  return apiGet("/catalog/stats");
}

export async function apiCatalogFacets() {
  return apiGet("/catalog/facets");
}
