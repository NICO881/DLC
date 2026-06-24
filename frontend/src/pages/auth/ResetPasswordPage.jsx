/**
 * pages/auth/ResetPasswordPage.jsx
 *
 * Step 2 of the reset flow: lands here from the link emailed in step 1.
 * Reads uid + token from the URL query string and submits a new password.
 */
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { BookOpen, AlertCircle, CheckCircle2 } from "lucide-react";
import * as authApi from "../../api/auth";
import Button from "../../components/ui/Button";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const linkMissing = !uid || !token;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    try {
      await authApi.confirmPasswordReset(uid, token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      const data = err.response?.data;
      setError(data?.detail || data?.new_password?.[0] || "Couldn't reset your password.");
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
          {linkMissing ? (
            <div className="flex items-start gap-2 bg-clay-50 text-clay-700 text-sm rounded-card px-3 py-2.5">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>
                This reset link looks incomplete. Please use the link from your email,
                or{" "}
                <Link to="/forgot-password" className="underline font-medium">
                  request a new one
                </Link>
                .
              </span>
            </div>
          ) : success ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-leaf-50 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={22} className="text-leaf-600" />
              </div>
              <h2 className="font-display text-lg font-semibold text-ink-800 mb-2">
                Password reset
              </h2>
              <p className="text-sm text-ink-500">Taking you to sign in...</p>
            </div>
          ) : (
            <>
              <h2 className="font-display text-lg font-semibold text-ink-800 mb-1">
                Choose a new password
              </h2>
              <p className="text-sm text-ink-500 mb-6">
                Make it something you haven't used before on this account.
              </p>

              {error && (
                <div className="flex items-start gap-2 bg-clay-50 text-clay-700 text-sm rounded-card px-3 py-2.5 mb-4">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-ink-700 mb-1.5">
                    New password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoFocus
                    className="w-full px-3 py-2.5 rounded-card border border-ink-100 focus:outline-none focus:border-clay-500 text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink-700 mb-1.5">
                    Confirm new password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-3 py-2.5 rounded-card border border-ink-100 focus:outline-none focus:border-clay-500 text-sm"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full" size="lg">
                  {loading ? "Resetting..." : "Reset password"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
