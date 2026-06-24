/**
 * pages/admin/UserManagementPage.jsx
 */
import { useEffect, useState } from "react";
import { Users, UserPlus, X } from "lucide-react";
import * as authApi from "../../api/auth";
import { Card, PageLoader } from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Select from "../../components/ui/Select";
import { TextField } from "../../components/ui/FormField";

const ROLE_OPTIONS = [
  { value: "STUDENT", label: "Student" },
  { value: "TEACHER", label: "Teacher" },
  { value: "COORDINATOR", label: "Subject Coordinator" },
  { value: "ADMIN", label: "Administrator" },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  function loadUsers() {
    setLoading(true);
    authApi
      .listUsers(roleFilter ? { role: roleFilter } : {})
      .then((data) => setUsers(data.results ?? data))
      .finally(() => setLoading(false));
  }

  async function handleToggleActive(user) {
    await authApi.updateUser(user.id, { is_active: !user.is_active });
    loadUsers();
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink-800 flex items-center gap-2">
            <Users size={24} className="text-clay-500" /> Manage Users
          </h1>
          <p className="text-ink-500 text-sm mt-1">
            Create accounts and manage roles for students, teachers, and staff.
          </p>
        </div>
        <Button icon={UserPlus} onClick={() => setShowForm(true)}>
          New User
        </Button>
      </div>

      <div className="mb-4 max-w-xs">
        <Select
          label="Filter by role"
          value={roleFilter}
          onChange={setRoleFilter}
          options={ROLE_OPTIONS}
        />
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Username</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3 text-ink-800 font-medium">
                    {u.first_name} {u.last_name}
                  </td>
                  <td className="px-4 py-3 text-ink-600">{u.username}</td>
                  <td className="px-4 py-3 text-ink-600">{u.role_display}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        u.is_active ? "bg-leaf-50 text-leaf-600" : "bg-ink-100 text-ink-500"
                      }`}
                    >
                      {u.is_active ? "Active" : "Deactivated"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleToggleActive(u)}
                      className="text-clay-600 text-sm font-medium hover:underline"
                    >
                      {u.is_active ? "Deactivate" : "Reactivate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {showForm && (
        <NewUserModal onClose={() => setShowForm(false)} onCreated={loadUsers} />
      )}
    </div>
  );
}

function NewUserModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "STUDENT",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await authApi.createUser(form);
      onCreated();
      onClose();
    } catch (err) {
      const data = err.response?.data;
      setError(data ? Object.values(data)[0]?.[0] || "Couldn't create user." : "Couldn't create user.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-ink-900/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-card w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-ink-800">New User</h2>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-700">
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="bg-clay-50 text-clay-700 text-sm rounded-card px-3 py-2 mb-3">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <TextField
              label="First name"
              value={form.first_name}
              onChange={(v) => update("first_name", v)}
              required
            />
            <TextField
              label="Last name"
              value={form.last_name}
              onChange={(v) => update("last_name", v)}
              required
            />
          </div>
          <TextField
            label="Username"
            value={form.username}
            onChange={(v) => update("username", v)}
            required
          />
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(v) => update("email", v)}
            required
          />
          <TextField
            label="Temporary password"
            type="password"
            value={form.password}
            onChange={(v) => update("password", v)}
            required
          />
          <Select
            label="Role"
            value={form.role}
            onChange={(v) => update("role", v)}
            options={ROLE_OPTIONS}
            placeholder={null}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create User"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
