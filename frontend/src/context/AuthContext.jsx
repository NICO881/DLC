/**
 * context/AuthContext.jsx
 *
 * Holds the logged-in user and exposes login/logout. Persists the token
 * and user object to localStorage so a page refresh doesn't log you out —
 * important for a school setting where shared computers might be left on
 * a tab for a while, and for offline-first behavior.
 */
import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("dl_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("dl_token");
    if (!token) {
      setLoading(false);
      return;
    }
    // Validate the stored token against the server on first load.
    authApi
      .fetchMe()
      .then((freshUser) => {
        setUser(freshUser);
        localStorage.setItem("dl_user", JSON.stringify(freshUser));
      })
      .catch(() => {
        localStorage.removeItem("dl_token");
        localStorage.removeItem("dl_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const { token, user: loggedInUser } = await authApi.login(username, password);
    localStorage.setItem("dl_token", token);
    localStorage.setItem("dl_user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
    return loggedInUser;
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // Even if the server call fails, clear local state so the user can
      // always get back to the login screen.
    }
    localStorage.removeItem("dl_token");
    localStorage.removeItem("dl_user");
    setUser(null);
  }

  function refreshUser(updatedUser) {
    setUser(updatedUser);
    localStorage.setItem("dl_user", JSON.stringify(updatedUser));
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
