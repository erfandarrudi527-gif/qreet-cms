"use client";

import { useState } from "react";
import { createAdminUser, deleteAdminUser } from "@/lib/actions/users";

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminsClient({ initialUsers }: { initialUsers: UserItem[] }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();

  async function handleAddUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(undefined);
    setSuccess(undefined);

    const form = e.currentTarget;
    const fd = new FormData(form);

    const res = await createAdminUser(fd);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
    } else {
      setSuccess("New administrator/user created successfully.");
      form.reset();
      window.location.reload();
    }
  }

  async function handleDelete(id: string, email: string) {
    if (!confirm(`Are you sure you want to delete ${email}?`)) return;
    const res = await deleteAdminUser(id);
    if (!res.ok) {
      alert(res.error || "Failed to delete user");
    } else {
      window.location.reload();
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <span>🛡️</span>
            <span>Admins &amp; Permissions Management</span>
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            List of authorized dashboard administrators, role management, and access control.
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Users List Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card overflow-hidden p-0 border border-admin-border/80 bg-admin-panel/60">
            <div className="border-b border-admin-border px-5 py-4 flex items-center justify-between bg-slate-50/70">
              <span className="text-sm font-bold text-slate-900">Active Administrators ({initialUsers.length})</span>
              <span className="text-xs text-slate-500 font-mono">Bcrypt Hash Protected</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-800">
                <thead className="border-b border-admin-border bg-slate-100/70 text-xs uppercase tracking-wider text-slate-700 font-bold">
                  <tr>
                    <th className="px-5 py-3">User & Identity</th>
                    <th className="px-5 py-3">Login Email</th>
                    <th className="px-5 py-3">Role</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {initialUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50 transition">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 text-xs font-bold text-white shadow-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <div className="font-semibold text-slate-900">{user.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">ID: {user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 font-mono text-xs text-slate-800 font-medium">
                        {user.email}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          user.role === "admin"
                            ? "bg-purple-950/80 text-purple-300 border border-purple-800/60"
                            : "bg-blue-950/80 text-blue-300 border border-blue-800/60"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        {user.id === "admin-1" ? (
                          <span className="text-[11px] text-gray-500 italic">Primary Root (Locked)</span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleDelete(user.id, user.email)}
                            className="rounded px-2.5 py-1 text-xs text-red-400 hover:bg-red-950/60 hover:text-red-300 transition"
                          >
                            Delete ✕
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Add User Form */}
        <div className="space-y-4">
          <div className="card space-y-4 border border-admin-border/80 bg-admin-panel/60 p-5">
            <div className="border-b border-admin-border pb-3">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <span>➕</span>
                <span>Add New Administrator</span>
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                Passwords are automatically hashed and salted with Bcrypt.
              </p>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5">
              <div>
                <label className="label">User Full Name</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Erfan Darroudi"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="label">Login Email</label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="admin@example.com"
                  className="input text-xs font-mono"
                />
              </div>

              <div>
                <label className="label">Initial Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="At least 6 characters"
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="label">Role</label>
                <select name="role" className="input text-xs bg-admin-panel">
                  <option value="admin">Full Administrator (Admin)</option>
                  <option value="editor">Editor / Author (Editor)</option>
                </select>
              </div>

              {error && (
                <div className="rounded-lg border border-red-900/60 bg-red-950/40 p-2.5 text-xs text-red-400">
                  {error}
                </div>
              )}
              {success && (
                <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/40 p-2.5 text-xs text-emerald-400">
                  {success}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2 text-xs font-semibold"
              >
                {loading ? "Registering..." : "Create User Account"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
