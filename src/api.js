export const API_URL = "https://jolly-sea-36fd.iri20rob94.workers.dev";

export async function apiGet(path) {
  const response = await fetch(`${API_URL}${path}`);

  if (!response.ok) {
    if (path.startsWith("/presets")) {
      console.warn(`Cloud presets offline, fallback empty: ${path}`);
      return { ok: true, items: [] };
    }
    throw new Error(`API GET failed: ${path}`);
  }

  return response.json();
}

export async function apiPost(path, data) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`API POST failed: ${path}`);
  }

  return response.json();
}

export async function apiPut(path, data) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) {
    throw new Error(`API PUT failed: ${path}`);
  }

  return response.json();
}

export async function apiDelete(path) {
  const response = await fetch(`${API_URL}${path}`, {
    method: "DELETE"
  });

  if (!response.ok) {
    throw new Error(`API DELETE failed: ${path}`);
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
