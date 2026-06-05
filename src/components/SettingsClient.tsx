"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import {
  User,
  Shield,
  Key,
  History,
  UserPlus,
  Loader2,
  Users,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { UserCardSkeleton, TimelineSkeleton } from "@/components/Skeleton";

interface AuditLogItem {
  _id: string;
  action: string;
  details: string;
  performedBy: string;
  timestamp: string;
}

interface UserItem {
  _id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function SettingsClient() {
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";

  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Registration Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("faculty");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState("");

  const fetchLogs = useCallback(async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch("/api/audit-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoadingLogs(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoadingUsers(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    fetchLogs();
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, fetchLogs, fetchUsers]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");
    setRegSuccess("");
    setRegLoading(true);

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register user.");
      }

      setRegSuccess(`Successfully registered faculty account for ${name}.`);
      setName("");
      setEmail("");
      setPassword("");
      setRole("faculty");
      fetchUsers(); // Refresh listing
      fetchLogs();  // Refresh timeline
    } catch (err: any) {
      setRegError(err.message || "Registration failed.");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12 animate-in">
      {/* Top Header */}
      <div className="border-b border-zinc-900 pb-5">
        <div className="flex items-center gap-2 mb-1">
          <div className="h-5 w-1 bg-purple-500 rounded-full" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">Configuration</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white">Settings</h1>
        <p className="text-zinc-500 text-xs mt-1">
          Manage your faculty credentials and audit system security trails.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* LEFT COLUMN: ACCOUNT PROFILE */}
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <User className="h-4 w-4 text-purple-400" />
              Account Profile
            </h3>

            <div className="space-y-3 pt-2">
              <div className="flex flex-col items-center py-6 bg-zinc-950/40 border border-zinc-900/80 rounded-xl group hover:border-purple-500/20 transition-all duration-300">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl mb-3 shadow-lg shadow-purple-600/20 group-hover:scale-105 transition-transform duration-300">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "F"}
                </div>
                <h4 className="text-sm font-bold text-white">{session?.user?.name}</h4>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 mt-2 bg-purple-500/10 text-purple-400 text-[8px] font-bold uppercase rounded-full border border-purple-500/20">
                  <Shield className="h-2.5 w-2.5" />
                  {(session?.user as any)?.role || "Faculty"}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="text-zinc-500">Email Address:</span>
                <p className="font-semibold text-zinc-300 break-all">{session?.user?.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: USER MANAGERS & AUDIT LOGS */}
        <div className="md:col-span-2 space-y-6">
          {/* ADMIN: USER MANAGEMENT MODULE */}
          {isAdmin && (
            <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 space-y-6">
              <div className="border-b border-zinc-900 pb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-purple-400" />
                  Faculty User Management
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  As administrator, you can authorize new faculty and view registered staff.
                </p>
              </div>

              {/* Form to Register Staff */}
              <form onSubmit={handleRegister} className="space-y-4">
                <h4 className="text-xs font-semibold text-zinc-400">Register New Staff</h4>
                
                {regError && (
                  <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-500/20 text-red-200 text-xs text-center flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <span>{regError}</span>
                  </div>
                )}
                {regSuccess && (
                  <div className="p-2.5 rounded-lg bg-green-950/40 border border-green-500/20 text-green-200 text-xs text-center flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span>{regSuccess}</span>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Faculty Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition"
                  />
                  <input
                    type="password"
                    required
                    placeholder="Temp Password (min 6 char)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-purple-500 transition"
                  />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-900 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-purple-500 transition cursor-pointer"
                  >
                    <option value="faculty">Faculty Access</option>
                    <option value="admin">Administrator Access</option>
                  </select>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={regLoading}
                    className="inline-flex items-center gap-1.5 py-2 px-5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed rounded-xl text-xs text-white transition font-semibold"
                  >
                    {regLoading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        <span>Registering...</span>
                      </>
                    ) : (
                      <>
                        <span>Add Faculty</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* List of Existing Users */}
              <div className="space-y-3 pt-3 border-t border-zinc-900">
                <h4 className="text-xs font-semibold text-zinc-400 flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-zinc-500" />
                  Staff Members List
                </h4>

                {loadingUsers ? (
                  <UserCardSkeleton count={4} />
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {users.map((u) => (
                      <div
                        key={u._id}
                        className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-900 flex justify-between items-center"
                      >
                        <div className="space-y-0.5 truncate max-w-[150px]">
                          <p className="text-xs font-semibold text-white truncate">{u.name}</p>
                          <p className="text-[10px] text-zinc-500 truncate">{u.email}</p>
                        </div>
                        <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-[8px] font-bold uppercase rounded-md text-zinc-400">
                          {u.role}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* AUDIT LOG TIMELINE */}
          <div className="glass-card p-6 rounded-2xl bg-zinc-900/40 border border-zinc-900 space-y-6">
            <div className="border-b border-zinc-900 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <History className="h-4 w-4 text-purple-400" />
                  System Audit Logs
                </h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">
                  Full security tracing logs of faculty and student actions.
                </p>
              </div>
              <button
                onClick={fetchLogs}
                className="text-[10px] font-semibold text-purple-400 hover:text-purple-300 underline"
              >
                Refresh Log
              </button>
            </div>

            {loadingLogs ? (
              <div className="py-4">
                <TimelineSkeleton count={5} />
              </div>
            ) : logs.length > 0 ? (
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {logs.map((log) => (
                  <div
                    key={log._id}
                    className="p-3 rounded-xl bg-zinc-950/40 border border-zinc-900 text-xs flex justify-between items-start gap-4 hover:border-zinc-800/80 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white">{log.action}</span>
                        <span className="text-[9px] text-zinc-500 font-medium">
                          by {log.performedBy}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-500 leading-normal">{log.details}</p>
                    </div>
                    <span className="text-[9px] text-zinc-600 font-mono text-right flex-shrink-0">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-600 text-center py-6">No audit records found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
