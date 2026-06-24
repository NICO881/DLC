/**
 * api/auth.js
 */
import client from "./client";

export async function login(username, password) {
  const { data } = await client.post("/auth/login/", { username, password });
  return data; // { token, user }
}

export async function logout() {
  await client.post("/auth/logout/");
}

export async function fetchMe() {
  const { data } = await client.get("/auth/me/");
  return data;
}

export async function updateMe(payload) {
  const { data } = await client.patch("/auth/me/", payload);
  return data;
}

export async function changePassword(oldPassword, newPassword) {
  const { data } = await client.post("/auth/change-password/", {
    old_password: oldPassword,
    new_password: newPassword,
  });
  return data;
}

export async function requestPasswordReset(email) {
  const { data } = await client.post("/auth/password-reset/", { email });
  return data;
}

export async function confirmPasswordReset(uid, token, newPassword) {
  const { data } = await client.post("/auth/password-reset/confirm/", {
    uid,
    token,
    new_password: newPassword,
  });
  return data;
}

export async function listUsers(params = {}) {
  const { data } = await client.get("/users/", { params });
  return data;
}

export async function createUser(payload) {
  const { data } = await client.post("/users/", payload);
  return data;
}

export async function updateUser(id, payload) {
  const { data } = await client.patch(`/users/${id}/`, payload);
  return data;
}

export async function deleteUser(id) {
  await client.delete(`/users/${id}/`);
}
