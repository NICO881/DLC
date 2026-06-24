/**
 * pages/shared/ProfilePage.jsx
 */
import { useState } from "react";
import { User, Lock } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import * as authApi from "../../api/auth";
import { Card } from "../../components/ui/Card";
import { TextField } from "../../components/ui/FormField";
import Button from "../../components/ui/Button";

const ROLE_LABELS = {
  STUDENT: "Student",
  TEACHER: "Teacher",
  COORDINATOR: "Subject Coordinator",
  ADMIN: "Administrator",
};

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({
    first_name: user.first_name || "",
    last_name: user.last_name || "",
    email: user.email || "",
    phone_number: user.phone_number || "",
    preferred_language: user.preferred_language || "English",
  });
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const [passwords, setPasswords] = useState({ old: "", next: "" });
  const [pwMessage, setPwMessage] = useState("");
  const [pwError, setPwError] = useState("");

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSaveProfile(e) {
    e.preventDefault();
    setSaving(true);
    setSavedMessage("");
    try {
      const updated = await authApi.updateMe(form);
      refreshUser(updated);
      setSavedMessage("Profile updated.");
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPwError("");
    setPwMessage("");
    try {
      await authApi.changePassword(passwords.old, passwords.next);
      setPwMessage("Password changed. Please sign in again next time with your new password.");
      setPasswords({ old: "", next: "" });
    } catch (err) {
      setPwError(err.response?.data?.detail || "Couldn't change password.");
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-ink-800 flex items-center gap-2">
          <User size={24} className="text-clay-500" /> My Profile
        </h1>
        <p className="text-ink-500 text-sm mt-1">{ROLE_LABELS[user.role]}</p>
      </div>

      <Card className="p-5 mb-5">
        <h2 className="font-display font-semibold text-ink-800 mb-4">Profile details</h2>
        {savedMessage && (
          <div className="bg-leaf-50 text-leaf-600 text-sm rounded-card px-3 py-2 mb-3">
            {savedMessage}
          </div>
        )}
        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextField label="First name" value={form.first_name} onChange={(v) => update("first_name", v)} />
            <TextField label="Last name" value={form.last_name} onChange={(v) => update("last_name", v)} />
          </div>
          <TextField label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} />
          <TextField label="Phone number" value={form.phone_number} onChange={(v) => update("phone_number", v)} />
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="font-display font-semibold text-ink-800 mb-4 flex items-center gap-1.5">
          <Lock size={16} /> Change password
        </h2>
        {pwMessage && (
          <div className="bg-leaf-50 text-leaf-600 text-sm rounded-card px-3 py-2 mb-3">{pwMessage}</div>
        )}
        {pwError && (
          <div className="bg-clay-50 text-clay-700 text-sm rounded-card px-3 py-2 mb-3">{pwError}</div>
        )}
        <form onSubmit={handleChangePassword} className="space-y-4">
          <TextField
            label="Current password"
            type="password"
            value={passwords.old}
            onChange={(v) => setPasswords((p) => ({ ...p, old: v }))}
            required
          />
          <TextField
            label="New password"
            type="password"
            value={passwords.next}
            onChange={(v) => setPasswords((p) => ({ ...p, next: v }))}
            required
          />
          <Button type="submit" variant="secondary">
            Update password
          </Button>
        </form>
      </Card>
    </div>
  );
}
