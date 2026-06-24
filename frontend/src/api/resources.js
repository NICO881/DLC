/**
 * api/resources.js
 */
import client from "./client";

export async function listResources(params = {}) {
  const { data } = await client.get("/resources/", { params });
  return data; // { count, next, previous, results }
}

export async function listPopularResources(params = {}) {
  const { data } = await client.get("/resources/popular/", { params });
  return data; // array (not paginated)
}

export async function getResource(id) {
  const { data } = await client.get(`/resources/${id}/`);
  return data;
}

export async function uploadResource(formData) {
  const { data } = await client.post("/resources/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function updateResource(id, formData) {
  const { data } = await client.patch(`/resources/${id}/`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

export async function deleteResource(id) {
  await client.delete(`/resources/${id}/`);
}

export async function restoreResource(id) {
  const { data } = await client.post(`/resources/${id}/restore/`);
  return data;
}

export async function changeResourceStatus(id, newStatus, reviewNotes = "") {
  const { data } = await client.post(`/resources/${id}/change-status/`, {
    status: newStatus,
    review_notes: reviewNotes,
  });
  return data;
}

export async function recordDownload(id) {
  const { data } = await client.post(`/resources/${id}/download/`);
  return data;
}

export async function listResourceVersions(id) {
  const { data } = await client.get(`/resources/${id}/versions/`);
  return data;
}
