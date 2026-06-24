/**
 * api/analytics.js
 */
import client from "./client";

export async function fetchUsageAnalytics() {
  const { data } = await client.get("/analytics/usage/");
  return data;
}

export async function fetchStorageMonitoring() {
  const { data } = await client.get("/analytics/storage/");
  return data;
}

export async function listAuditLogs(params = {}) {
  const { data } = await client.get("/audit-logs/", { params });
  return data;
}
