/**
 * api/client.js
 *
 * Central axios instance. Every request automatically gets the auth token
 * (if present) attached; a 401 response clears the session and redirects
 * to login, so components never have to handle that case individually.
 */
import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const client = axios.create({
  baseURL: API_BASE_URL,
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("dl_token");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("dl_token");
      localStorage.removeItem("dl_user");
      // Avoid a hard redirect loop if we're already on the login screen.
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default client;
