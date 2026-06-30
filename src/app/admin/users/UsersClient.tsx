"use client";

import { useState, useTransition } from "react";
import {
  Search, Shield, UserCheck, UserPlus, Users, Edit, Trash2, X, AlertTriangle, Loader2
} from "lucide-react";
import { Role } from "@prisma/client";
import { PageHero, SurfaceCard } from "@/components/ui/PageShell";
import { createUser, updateUser, deleteUser, toggleBanUser } from "./actions";

type UserType = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  rank: string | null;
  role: Role;
  isBanned: boolean;
  mlbbId: string | null;
  server: string | null;
  createdAt: Date;
};

interface UsersClientProps {
  initialUsers: UserType[];
  currentUserRole: string;
}

export function UsersClient({ initialUsers, currentUserRole }: UsersClientProps) {
  const [users, setUsers] = useState<UserType[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createEmail, setCreateEmail] = useState("");
  const [createName, setCreateName] = useState("");
  const [createRole, setCreateRole] = useState<Role>(Role.USER);
  const [createRank, setCreateRank] = useState("Rookie");
  const [createMlbbId, setCreateMlbbId] = useState("");
  const [createServer, setCreateServer] = useState("");

  // Edit Modal State
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editName, setEditName] = useState("");
  const [editRole, setEditRole] = useState<Role>(Role.USER);
  const [editRank, setEditRank] = useState("");
  const [editMlbbId, setEditMlbbId] = useState("");
  const [editServer, setEditServer] = useState("");

  // Delete Modal State
  const [deletingUser, setDeletingUser] = useState<UserType | null>(null);

  // Toggle Ban Modal State
  const [banningUser, setBanningUser] = useState<UserType | null>(null);

  // Search Filter
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(q) ||
      (u.email || "").toLowerCase().includes(q) ||
      u.id.toLowerCase().includes(q)
    );
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const newUser = await createUser({
          email: createEmail,
          name: createName,
          role: createRole,
          rank: createRank,
          mlbbId: createMlbbId || undefined,
          server: createServer || undefined,
        });
        setUsers([newUser as any, ...users]);
        setShowCreateModal(false);
        // Reset fields
        setCreateEmail("");
        setCreateName("");
        setCreateRole(Role.USER);
        setCreateRank("Rookie");
        setCreateMlbbId("");
        setCreateServer("");
      } catch (err: any) {
        alert(err.message || "Failed to create user");
      }
    });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    startTransition(async () => {
      try {
        const updated = await updateUser(editingUser.id, {
          email: editEmail,
          name: editName,
          role: editRole,
          rank: editRank,
          mlbbId: editMlbbId || undefined,
          server: editServer || undefined,
        });
        setUsers(users.map((u) => (u.id === editingUser.id ? (updated as any) : u)));
        setEditingUser(null);
      } catch (err: any) {
        alert(err.message || "Failed to update user");
      }
    });
  };

  const handleDelete = async () => {
    if (!deletingUser) return;
    startTransition(async () => {
      try {
        await deleteUser(deletingUser.id);
        setUsers(users.filter((u) => u.id !== deletingUser.id));
        setDeletingUser(null);
      } catch (err: any) {
        alert(err.message || "Failed to delete user");
      }
    });
  };

  const handleToggleBan = async () => {
    if (!banningUser) return;
    startTransition(async () => {
      try {
        await toggleBanUser(banningUser.id);
        setUsers(
          users.map((u) =>
            u.id === banningUser.id ? { ...u, isBanned: !u.isBanned } : u
          )
        );
        setBanningUser(null);
      } catch (err: any) {
        alert(err.message || "Failed to moderate account");
      }
    });
  };

  const openEditModal = (user: UserType) => {
    setEditingUser(user);
    setEditEmail(user.email || "");
    setEditName(user.name || "");
    setEditRole(user.role);
    setEditRank(user.rank || "Rookie");
    setEditMlbbId(user.mlbbId || "");
    setEditServer(user.server || "");
  };

  return (
    <div className="space-y-6">
      <PageHero
        eyebrow="User Directory"
        icon={<Users className="h-4 w-4" />}
        title="Manage platform users"
        description="Create new user accounts, modify roles and profile parameters, and manage account ban statuses."
        stats={[
          { label: "Total Users", value: users.length },
          { label: "Moderators", value: users.filter((u) => u.role === Role.MODERATOR).length },
          { label: "Admins", value: users.filter((u) => u.role === Role.SUPERADMIN).length },
        ]}
        actions={
          <button
            onClick={() => setShowCreateModal(true)}
            className="action-button-primary text-[11px] cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            Add User Account
          </button>
        }
      />

      <SurfaceCard className="p-0">
        <div className="border-b border-border p-5">
          <div className="flex items-center gap-3 rounded-[1.4rem] border border-border bg-muted/40 px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search users by name, email, or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        <div className="custom-scrollbar overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left">
                {["User Info", "Role", "Rank", "MLBB Info", "Status", "Joined", "Actions"].map((heading) => (
                  <th key={heading} className="px-6 py-4 text-[0.62rem] font-black uppercase tracking-[0.24em] text-muted-foreground">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-muted-foreground">
                    No users found matching your search parameters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const role = user.role || Role.USER;
                  const isAdmin = role === "SUPERADMIN";
                  const isMod = role === "MODERATOR";

                  return (
                    <tr key={user.id} className="border-b border-border transition-colors hover:bg-muted">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-sm font-black text-muted-foreground flex-shrink-0">
                            {user.image ? <img src={user.image} alt="" className="h-full w-full object-cover" /> : (user.name || "U").charAt(0)}
                          </div>
                          <div>
                            <div className="font-display text-lg font-black uppercase tracking-[0.08em] text-foreground">{user.name || "Anon Player"}</div>
                            <div className="mt-1 text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted px-3 py-1.5 text-[0.62rem] font-black uppercase tracking-[0.22em] text-muted-foreground">
                          {isAdmin ? <Shield className="h-3.5 w-3.5 text-primary" /> : isMod ? <UserCheck className="h-3.5 w-3.5 text-primary" /> : <Users className="h-3.5 w-3.5 text-muted-foreground" />}
                          {role}
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-muted-foreground">{user.rank || "Unranked"}</td>
                      <td className="px-6 py-5 text-sm text-muted-foreground">
                        {user.mlbbId ? (
                          <div>
                            <div>ID: {user.mlbbId}</div>
                            <div className="text-[10px] text-muted-foreground">Server: {user.server || "—"}</div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground/50 italic">—</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border text-[9px] font-black uppercase tracking-[0.2em] ${user.isBanned
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : "bg-green-500/10 border-green-500/20 text-green-400"
                          }`}>
                          {user.isBanned ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm text-muted-foreground">{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="rounded-xl border border-border bg-muted p-2 text-muted-foreground transition-colors hover:text-primary cursor-pointer"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>

                          {user.role !== "SUPERADMIN" && (
                            <button
                              onClick={() => setBanningUser(user)}
                              className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${user.isBanned
                                  ? "bg-green-500/10 border-green-500/25 text-green-400 hover:bg-green-500/20"
                                  : "bg-red-500/10 border-red-500/25 text-red-400 hover:bg-red-500/20"
                                }`}
                            >
                              {user.isBanned ? "Unban" : "Ban"}
                            </button>
                          )}

                          {user.role !== "SUPERADMIN" && (
                            <button
                              onClick={() => setDeletingUser(user)}
                              className="rounded-xl border border-border bg-muted p-2 text-muted-foreground transition-colors hover:text-rose-400 cursor-pointer"
                              title="Delete Account"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </SurfaceCard>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setShowCreateModal(false)} />
          <form
            onSubmit={handleCreate}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <UserPlus className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-black uppercase tracking-wider text-foreground">Create User Account</h3>
              </div>
              <button type="button" onClick={() => setShowCreateModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  className="input-hud w-full"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Kim Lester Evangelista"
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  className="input-hud w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">Role Type</label>
                  <select
                    value={createRole}
                    onChange={(e) => setCreateRole(e.target.value as Role)}
                    className="input-hud w-full bg-card"
                  >
                    <option value={Role.USER}>User (Player)</option>
                    <option value={Role.MODERATOR}>Moderator</option>
                    <option value={Role.SUPERADMIN}>Superadmin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">MLBB Rank</label>
                  <input
                    type="text"
                    placeholder="Rookie, Mythical Glory..."
                    value={createRank}
                    onChange={(e) => setCreateRank(e.target.value)}
                    className="input-hud w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">MLBB User ID</label>
                  <input
                    type="text"
                    placeholder="12345678"
                    value={createMlbbId}
                    onChange={(e) => setCreateMlbbId(e.target.value)}
                    className="input-hud w-full"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">MLBB Server ID</label>
                  <input
                    type="text"
                    placeholder="3012"
                    value={createServer}
                    onChange={(e) => setCreateServer(e.target.value)}
                    className="input-hud w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl border border-border bg-muted hover:bg-muted/80 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/95 text-xs font-bold uppercase tracking-wider text-black transition-colors shadow-lg cursor-pointer"
              >
                {isPending ? "Launching..." : "Launch User"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setEditingUser(null)} />
          <form
            onSubmit={handleUpdate}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200"
          >
            <div className="flex items-center justify-between border-b border-border pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <Edit className="h-5 w-5 text-primary" />
                <h3 className="font-display text-lg font-black uppercase tracking-wider text-foreground">Edit User Profile</h3>
              </div>
              <button type="button" onClick={() => setEditingUser(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="input-hud w-full"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-hud w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">Role Type</label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as Role)}
                    className="input-hud w-full bg-card"
                  >
                    <option value={Role.USER}>User (Player)</option>
                    <option value={Role.MODERATOR}>Moderator</option>
                    <option value={Role.SUPERADMIN}>Superadmin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">MLBB Rank</label>
                  <input
                    type="text"
                    placeholder="Rookie, Mythic..."
                    value={editRank}
                    onChange={(e) => setEditRank(e.target.value)}
                    className="input-hud w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">MLBB User ID</label>
                  <input
                    type="text"
                    placeholder="12345678"
                    value={editMlbbId}
                    onChange={(e) => setEditMlbbId(e.target.value)}
                    className="input-hud w-full"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-muted-foreground mb-1.5">MLBB Server ID</label>
                  <input
                    type="text"
                    placeholder="3012"
                    value={editServer}
                    onChange={(e) => setEditServer(e.target.value)}
                    className="input-hud w-full"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 border-t border-border pt-4">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="px-4 py-2 rounded-xl border border-border bg-muted hover:bg-muted/80 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/95 text-xs font-bold uppercase tracking-wider text-black transition-colors shadow-lg cursor-pointer"
              >
                {isPending ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DELETE MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setDeletingUser(null)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-black uppercase tracking-wider text-foreground">Delete Account</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Are you sure you want to permanently delete the account of <strong>{deletingUser.name || deletingUser.email}</strong>? This action will cascade delete all their matches, teams, and comments and cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingUser(null)}
                className="px-4 py-2 rounded-xl border border-border bg-muted hover:bg-muted/80 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold uppercase tracking-wider text-white transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)] cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BAN/UNBAN MODAL */}
      {banningUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" onClick={() => setBanningUser(null)} />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${banningUser.isBanned ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                }`}>
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-display text-lg font-black uppercase tracking-wider text-foreground">Confirm Account Moderation</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Are you sure you want to {banningUser.isBanned ? "unban" : "suspend"} <strong>{banningUser.name || banningUser.email}</strong>'s account?
              {!banningUser.isBanned && " Suspended players will be blocked from logging into the platform."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setBanningUser(null)}
                className="px-4 py-2 rounded-xl border border-border bg-muted hover:bg-muted/80 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleToggleBan}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white transition-colors shadow-lg cursor-pointer ${banningUser.isBanned
                    ? "bg-green-600 hover:bg-green-500 shadow-green-600/30"
                    : "bg-red-600 hover:bg-red-500 shadow-red-600/30"
                  }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
