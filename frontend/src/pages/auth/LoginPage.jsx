/**
 * pages/auth/LoginPage.jsx
 */
import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { BookOpen, AlertCircle } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/ui/Button";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      const dest = location.state?.from?.pathname || "/";
      navigate(dest, { replace: true });
    } catch (err) {
      if (err.response?.status === 401) {
        setError("Incorrect username or password. Please try again.");
      } else if (err.response?.status === 403) {
        setError(err.response.data?.detail || "This account has been deactivated.");
      } else {
        setError("Couldn't reach the server. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-ink-700 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-card bg-clay-500 flex items-center justify-center mb-4">
            <BookOpen size={28} className="text-white" strokeWidth={2.25} />
          </div>
          <h1 className="font-display text-2xl font-semibold text-white mb-1">
            Digital Library
          </h1>
          <p className="text-ink-300 text-sm">Digital Learning Centre</p>
        </div>

        <div className="bg-white rounded-card shadow-shelf p-7">
          <h2 className="font-display text-lg font-semibold text-ink-800 mb-1">Sign in</h2>
          <p className="text-sm text-ink-500 mb-6">
            Use the account given to you by your school administrator.
          </p>

          {error && (
            <div className="flex items-start gap-2 bg-clay-50 text-clay-700 text-sm rounded-card px-3 py-2.5 mb-4">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-ink-700 mb-1.5">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-card border border-ink-100 focus:outline-none focus:border-clay-500 text-sm"
                placeholder="e.g. student"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-ink-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 rounded-card border border-ink-100 focus:outline-none focus:border-clay-500 text-sm"
                placeholder="••••••••"
              />
              <Link
                to="/forgot-password"
                className="block text-right text-xs font-medium text-clay-600 hover:underline mt-1.5"
              >
                Forgot your password?
              </Link>
            </div>

            <Button type="submit" disabled={loading} className="w-full" size="lg">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="text-center text-ink-300 text-xs mt-6">
          Trouble signing in? Ask your school administrator to reset your password.
        </p>
      </div>
    </div>
  );
}
