/**
 * pages/auth/ForgotPasswordPage.jsx
 *
 * Step 1 of the reset flow: user submits their email. We always show the
 * same generic confirmation regardless of whether the email exists, to
 * avoid leaking which emails are registered.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Mail, ArrowLeft } from "lucide-react";
import * as authApi from "../../api/auth";
import Button from "../../components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.requestPasswordReset(email);
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
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
          {submitted ? (
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-leaf-50 flex items-center justify-center mx-auto mb-4">
                <Mail size={22} className="text-leaf-600" />
              </div>
              <h2 className="font-display text-lg font-semibold text-ink-800 mb-2">
                Check your email
              </h2>
              <p className="text-sm text-ink-500 mb-6">
                If an account exists for <strong>{email}</strong>, we've sent a link to
                reset your password. The link will expire soon, so use it shortly.
              </p>
              <Link to="/login" className="text-sm font-medium text-clay-600 hover:underline">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-lg font-semibold text-ink-800 mb-1">
                Forgot your password?
              </h2>
              <p className="text-sm text-ink-500 mb-6">
                Enter the email linked to your account and we'll send you a reset link.
              </p>

              {error && (
                <div className="bg-clay-50 text-clay-700 text-sm rounded-card px-3 py-2.5 mb-4">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-ink-700 mb-1.5">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="w-full px-3 py-2.5 rounded-card border border-ink-100 focus:outline-none focus:border-clay-500 text-sm"
                    placeholder="you@school.ug"
                  />
                </div>
                <Button type="submit" disabled={loading} className="w-full" size="lg">
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
              </form>

              <Link
                to="/login"
                className="flex items-center justify-center gap-1.5 text-sm text-ink-500 hover:text-ink-700 mt-5"
              >
                <ArrowLeft size={14} /> Back to sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
