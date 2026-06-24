/**
 * api/interactions.js
 */
import client from "./client";

// --- Bookmarks ---
export async function listBookmarks(params = {}) {
  const { data } = await client.get("/bookmarks/", { params });
  return data;
}
export async function addBookmark(resourceId, collectionName = "My Bookmarks") {
  const { data } = await client.post("/bookmarks/", {
    resource: resourceId,
    collection_name: collectionName,
  });
  return data;
}
export async function removeBookmark(bookmarkId) {
  await client.delete(`/bookmarks/${bookmarkId}/`);
}

// --- Progress ---
export async function listProgress(params = {}) {
  const { data } = await client.get("/progress/", { params });
  return data;
}
export async function upsertProgress(resourceId, payload) {
  // Try to find an existing record first (one row per user+resource).
  const existing = await listProgress({ resource: resourceId });
  const results = existing.results ?? existing;
  if (results.length > 0) {
    const { data } = await client.patch(`/progress/${results[0].id}/`, payload);
    return data;
  }
  const { data } = await client.post("/progress/", { resource: resourceId, ...payload });
  return data;
}

// --- Ratings ---
export async function listRatings(params = {}) {
  const { data } = await client.get("/ratings/", { params });
  return data;
}
export async function rateResource(resourceId, score, comment = "") {
  const { data } = await client.post("/ratings/", { resource: resourceId, score, comment });
  return data;
}

// --- Downloads ---
export async function listDownloads(params = {}) {
  const { data } = await client.get("/downloads/", { params });
  return data;
}

// --- Resource Shares ---
export async function listShares(params = {}) {
  const { data } = await client.get("/shares/", { params });
  return data;
}
export async function shareResource(payload) {
  const { data } = await client.post("/shares/", payload);
  return data;
}

// --- Notifications ---
export async function listNotifications(params = {}) {
  const { data } = await client.get("/notifications/", { params });
  return data;
}
export async function markNotificationRead(id) {
  const { data } = await client.patch(`/notifications/${id}/mark_read/`);
  return data;
}
export async function markAllNotificationsRead() {
  const { data } = await client.post("/notifications/mark-all-read/");
  return data;
}
