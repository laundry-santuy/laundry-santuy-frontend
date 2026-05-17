"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Download,
  Eye,
  Filter,
  KeyRound,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  ToggleLeft,
  UsersRound,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { AdminDialog } from "../admin-dialog";
import { exportRowsToExcel } from "../admin-export";
import {
  AdminMetricStrip,
  AdminPageHeader,
  AdminPanel,
  adminControlClass,
  adminDangerButtonClass,
  adminPrimaryButtonClass,
  adminSecondaryButtonClass,
  adminSelectClass,
} from "../admin-page";
import { AdminEmptyState, AdminLoadingState } from "../admin-state";
import {
  AdminActionBar,
  AdminIconButton,
  AdminPaginationBar,
} from "../admin-table-tools";
import { adminUsers } from "../data";
import type { AdminUser, AdminUserRole, AdminUserStatus } from "../types";

const PAGE_SIZE = 5;

const roleOptions: Array<AdminUserRole | "Semua"> = [
  "Semua",
  "Admin",
  "Kurir",
  "Pelanggan",
];

const statusOptions: Array<AdminUserStatus | "Semua"> = [
  "Semua",
  "Aktif",
  "Nonaktif",
];

type UserFormValues = {
  name: string;
  email: string;
  role: AdminUserRole;
  status: AdminUserStatus;
  password: string;
};

const emptyUserForm: UserFormValues = {
  name: "",
  email: "",
  role: "Pelanggan",
  status: "Aktif",
  password: "",
};

const passwordPools = [
  "ABCDEFGHJKLMNPQRSTUVWXYZ",
  "abcdefghijkmnopqrstuvwxyz",
  "23456789",
  "!@#$%&*?",
];

function randomIndex(max: number) {
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    return values[0] % max;
  }

  return Math.floor(Math.random() * max);
}

function pickCharacter(pool: string) {
  return pool[randomIndex(pool.length)];
}

function generateStrongPassword() {
  const allCharacters = passwordPools.join("");
  const characters = [
    ...passwordPools.map((pool) => pickCharacter(pool)),
    ...Array.from({ length: 10 }, () => pickCharacter(allCharacters)),
  ];

  for (let index = characters.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [characters[index], characters[swapIndex]] = [
      characters[swapIndex],
      characters[index],
    ];
  }

  return characters.join("");
}

function formatDateLabel() {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
}

function createNextUserId(users: AdminUser[]) {
  const nextNumber =
    Math.max(
      0,
      ...users.map((user) => Number(user.id.match(/(\d+)$/)?.[1] ?? 0)),
    ) + 1;

  return `USR-${String(nextNumber).padStart(3, "0")}`;
}

function UserBadge({ role }: { role: AdminUserRole }) {
  const toneClass =
    role === "Admin"
      ? "bg-primary-50 text-primary-600"
      : role === "Kurir"
        ? "bg-emerald-50 text-emerald-600"
        : "bg-amber-50 text-amber-600";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold",
        toneClass,
      )}
    >
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: AdminUserStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold",
        status === "Aktif"
          ? "bg-emerald-50 text-emerald-600"
          : "bg-[var(--odong-surface-muted)] text-[var(--odong-muted)]",
      )}
    >
      {status}
    </span>
  );
}

function DetailItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-muted)] px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--odong-muted-soft)]">
        {label}
      </p>
      <div className="mt-2 text-sm font-extrabold text-[var(--odong-text)]">
        {value}
      </div>
    </div>
  );
}

export function AdminUserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>(adminUsers);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] =
    useState<(typeof roleOptions)[number]>("Semua");
  const [statusFilter, setStatusFilter] =
    useState<(typeof statusOptions)[number]>("Semua");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [userModalMode, setUserModalMode] =
    useState<"create" | "edit" | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [detailUser, setDetailUser] = useState<AdminUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null);
  const [userForm, setUserForm] = useState<UserFormValues>(emptyUserForm);
  const [lastCredential, setLastCredential] = useState<{
    email: string;
    password: string;
  } | null>(null);
  const [credentialCopied, setCredentialCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.toLowerCase();

    return users.filter((user) => {
      const matchesQuery =
        user.name.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.id.toLowerCase().includes(normalizedQuery);
      const matchesRole =
        roleFilter === "Semua" ? true : user.role === roleFilter;
      const matchesStatus =
        statusFilter === "Semua" ? true : user.status === statusFilter;

      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, query, roleFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const activePage = Math.min(page, totalPages);

  const paginatedUsers = useMemo(() => {
    const startIndex = (activePage - 1) * PAGE_SIZE;

    return filteredUsers.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredUsers, activePage]);

  const summary = {
    total: users.length,
    active: users.filter((user) => user.status === "Aktif").length,
    admin: users.filter((user) => user.role === "Admin").length,
    courier: users.filter((user) => user.role === "Kurir").length,
  };

  const refreshUsers = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    setIsLoading(true);
    timerRef.current = window.setTimeout(() => {
      setIsLoading(false);
    }, 650);
  };

  const openCreateUser = () => {
    setEditingUser(null);
    setCredentialCopied(false);
    setUserForm({
      ...emptyUserForm,
      password: generateStrongPassword(),
    });
    setUserModalMode("create");
  };

  const openEditUser = (user: AdminUser) => {
    setEditingUser(user);
    setCredentialCopied(false);
    setUserForm({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: "",
    });
    setUserModalMode("edit");
  };

  const closeUserForm = () => {
    setUserModalMode(null);
    setEditingUser(null);
    setUserForm(emptyUserForm);
  };

  const submitUserForm = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = userForm.name.trim();
    const trimmedEmail = userForm.email.trim();

    if (!trimmedName || !trimmedEmail) {
      return;
    }

    if (userModalMode === "create") {
      const createdPassword = userForm.password || generateStrongPassword();

      setUsers((currentUsers) => [
        {
          id: createNextUserId(currentUsers),
          name: trimmedName,
          email: trimmedEmail,
          role: userForm.role,
          status: userForm.status,
          joinedAt: formatDateLabel(),
        },
        ...currentUsers,
      ]);
      setLastCredential({
        email: trimmedEmail,
        password: createdPassword,
      });
      setPage(1);
    }

    if (userModalMode === "edit" && editingUser) {
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === editingUser.id
            ? {
                ...user,
                name: trimmedName,
                email: trimmedEmail,
                role: userForm.role,
                status: userForm.status,
              }
            : user,
        ),
      );
    }

    closeUserForm();
  };

  const confirmDeleteUser = () => {
    if (!deleteUser) {
      return;
    }

    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== deleteUser.id),
    );
    setDetailUser((currentUser) =>
      currentUser?.id === deleteUser.id ? null : currentUser,
    );
    setDeleteUser(null);
    setPage(1);
  };

  const copyPassword = async (password: string) => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(password);
        setCredentialCopied(true);
      }
    } catch {
      setCredentialCopied(false);
    }
  };

  const exportUsers = () => {
    exportRowsToExcel({
      fileName: "laundry-santuy-pengguna",
      sheetName: "Pengguna",
      columns: [
        { header: "ID", value: (user) => user.id },
        { header: "Nama", value: (user) => user.name },
        { header: "Email", value: (user) => user.email },
        { header: "Role", value: (user) => user.role },
        { header: "Status", value: (user) => user.status },
        { header: "Bergabung", value: (user) => user.joinedAt },
      ],
      rows: filteredUsers,
    });
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Manajemen User"
        title="Kelola akun pengguna"
        description="Cari, filter, tambah, dan ubah akses admin, kurir, atau pelanggan dari satu panel yang tetap ringan dipakai."
        actions={
          <AdminActionBar className="justify-end">
            <button
              type="button"
              onClick={refreshUsers}
              className={adminSecondaryButtonClass}
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Muat ulang
            </button>
            <button
              type="button"
              onClick={exportUsers}
              className={adminSecondaryButtonClass}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export Excel
            </button>
            <button
              type="button"
              onClick={openCreateUser}
              className={adminPrimaryButtonClass}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Tambah User
            </button>
          </AdminActionBar>
        }
      />

      <AdminMetricStrip
        items={[
          {
            label: "Total user",
            value: summary.total,
            caption: `${filteredUsers.length} sesuai filter`,
            icon: UsersRound,
          },
          {
            label: "Akun aktif",
            value: summary.active,
            caption: "Siap digunakan",
            icon: ShieldCheck,
            tone: "success",
          },
          {
            label: "Admin",
            value: summary.admin,
            caption: "Akses penuh",
            icon: ShieldCheck,
          },
          {
            label: "Kurir",
            value: summary.courier,
            caption: "Akun operasional",
            icon: ToggleLeft,
            tone: "warning",
          },
        ]}
      />

      <AdminPanel
        title="Direktori pengguna"
        description="Filter cepat tetap di atas, daftar dibatasi 5 data per halaman agar tabel tidak terlalu panjang."
        icon={UsersRound}
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
          <label className="relative block">
            <span className="sr-only">Cari ID, nama, atau email user</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--odong-muted-soft)]" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Cari ID, nama, atau email user"
              className={cn(adminControlClass, "pl-11")}
            />
          </label>

          <label className="relative block">
            <span className="sr-only">Filter role user</span>
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--odong-muted-soft)]" />
            <select
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value as typeof roleFilter);
                setPage(1);
              }}
              className={cn(adminSelectClass, "pl-11")}
            >
              {roleOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>

          <label className="relative block">
            <span className="sr-only">Filter status user</span>
            <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--odong-muted-soft)]" />
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value as typeof statusFilter);
                setPage(1);
              }}
              className={cn(adminSelectClass, "pl-11")}
            >
              {statusOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        {lastCredential ? (
          <div
            role="status"
            aria-live="polite"
            className="mt-4 flex flex-col gap-3 rounded-[24px] border border-emerald-100 bg-emerald-50 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="min-w-0">
              <p className="text-sm font-extrabold text-emerald-700">
                User baru ditambahkan
              </p>
              <p className="mt-1 break-words text-sm font-semibold text-emerald-700">
                {lastCredential.email} · Password awal{" "}
                <span className="font-mono">{lastCredential.password}</span>
              </p>
            </div>
            <AdminActionBar className="shrink-0">
              <button
                type="button"
                onClick={() => copyPassword(lastCredential.password)}
                className={adminSecondaryButtonClass}
              >
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                {credentialCopied ? "Tersalin" : "Salin"}
              </button>
              <button
                type="button"
                onClick={() => setLastCredential(null)}
                className={adminSecondaryButtonClass}
              >
                Tutup
              </button>
            </AdminActionBar>
          </div>
        ) : null}

        <div className="mt-5">
          {isLoading ? (
            <AdminLoadingState />
          ) : filteredUsers.length === 0 ? (
            <AdminEmptyState
              title="User tidak ditemukan"
              description="Coba ubah kata kunci pencarian atau reset filter yang aktif."
            />
          ) : (
            <>
              <div className="grid gap-3 lg:hidden">
                {paginatedUsers.map((user) => (
                  <article
                    key={user.id}
                    className="rounded-[26px] border border-[var(--odong-border)] bg-[var(--odong-surface-muted)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-extrabold text-[var(--odong-text)]">
                          {user.name}
                        </p>
                        <p className="mt-1 truncate text-sm text-[var(--odong-muted)]">
                          {user.email}
                        </p>
                      </div>
                      <StatusBadge status={user.status} />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <UserBadge role={user.role} />
                      <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                        {user.id}
                      </span>
                      <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                        {user.joinedAt}
                      </span>
                    </div>

                    <div className="mt-4 flex justify-end gap-2 border-t border-[var(--odong-border)] pt-4">
                      <AdminIconButton
                        icon={Eye}
                        label={`Detail ${user.name}`}
                        onClick={() => setDetailUser(user)}
                      />
                      <AdminIconButton
                        icon={Pencil}
                        label={`Edit ${user.name}`}
                        tone="primary"
                        onClick={() => openEditUser(user)}
                      />
                      <AdminIconButton
                        icon={Trash2}
                        label={`Hapus ${user.name}`}
                        tone="danger"
                        onClick={() => setDeleteUser(user)}
                      />
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-hidden rounded-[28px] border border-[var(--odong-border)] lg:block">
                <table className="min-w-full divide-y divide-[var(--odong-border)]">
                  <thead className="bg-[var(--odong-surface-soft)]">
                    <tr className="text-left text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--odong-muted)]">
                      <th className="px-4 py-4">User</th>
                      <th className="px-4 py-4">Role</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Bergabung</th>
                      <th className="px-4 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--odong-border)] bg-[var(--odong-surface-strong)]">
                    {paginatedUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="transition hover:bg-primary-50/35"
                      >
                        <td className="px-4 py-4">
                          <p className="font-extrabold text-[var(--odong-text)]">
                            {user.name}
                          </p>
                          <p className="mt-1 text-sm text-[var(--odong-muted)]">
                            {user.email}
                          </p>
                          <p className="mt-1 text-xs font-bold text-[var(--odong-muted-soft)]">
                            {user.id}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <UserBadge role={user.role} />
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={user.status} />
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-[var(--odong-muted)]">
                          {user.joinedAt}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <AdminIconButton
                              icon={Eye}
                              label={`Detail ${user.name}`}
                              onClick={() => setDetailUser(user)}
                            />
                            <AdminIconButton
                              icon={Pencil}
                              label={`Edit ${user.name}`}
                              tone="primary"
                              onClick={() => openEditUser(user)}
                            />
                            <AdminIconButton
                              icon={Trash2}
                              label={`Hapus ${user.name}`}
                              tone="danger"
                              onClick={() => setDeleteUser(user)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <AdminPaginationBar
                page={activePage}
                totalPages={totalPages}
                totalItems={filteredUsers.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </AdminPanel>

      <AdminDialog
        open={userModalMode !== null}
        onClose={closeUserForm}
        title={userModalMode === "edit" ? "Edit pengguna" : "Tambah pengguna"}
        description={
          userModalMode === "edit"
            ? "Perbarui identitas, role, dan status akun pengguna."
            : "Buat akun baru dengan role yang tepat dan password awal yang kuat."
        }
        size="lg"
      >
        <form className="space-y-5" onSubmit={submitUserForm}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2">
              <span className="text-sm font-extrabold text-[var(--odong-text)]">
                Nama lengkap
              </span>
              <input
                required
                value={userForm.name}
                onChange={(event) =>
                  setUserForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                className={adminControlClass}
                placeholder="Contoh: Dinda Maharani"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-extrabold text-[var(--odong-text)]">
                Email
              </span>
              <input
                required
                type="email"
                value={userForm.email}
                onChange={(event) =>
                  setUserForm((current) => ({
                    ...current,
                    email: event.target.value,
                  }))
                }
                className={adminControlClass}
                placeholder="nama@laundrysantuy.id"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-extrabold text-[var(--odong-text)]">
                Role
              </span>
              <select
                value={userForm.role}
                onChange={(event) =>
                  setUserForm((current) => ({
                    ...current,
                    role: event.target.value as AdminUserRole,
                  }))
                }
                className={adminSelectClass}
              >
                {roleOptions
                  .filter((option): option is AdminUserRole => option !== "Semua")
                  .map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-extrabold text-[var(--odong-text)]">
                Status
              </span>
              <select
                value={userForm.status}
                onChange={(event) =>
                  setUserForm((current) => ({
                    ...current,
                    status: event.target.value as AdminUserStatus,
                  }))
                }
                className={adminSelectClass}
              >
                {statusOptions
                  .filter(
                    (option): option is AdminUserStatus => option !== "Semua",
                  )
                  .map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          {userModalMode === "create" ? (
            <div className="rounded-[24px] border border-primary-100 bg-primary-50/70 p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--odong-surface-strong)] text-primary-600">
                  <KeyRound className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-extrabold text-[var(--odong-text)]">
                    Password awal
                  </p>
                  <p className="mt-1 text-sm leading-6 text-[var(--odong-muted)]">
                    Password dibuat otomatis dengan kombinasi huruf besar, huruf
                    kecil, angka, dan simbol.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <label className="min-w-0 flex-1">
                  <span className="sr-only">Password awal</span>
                  <input
                    readOnly
                    value={userForm.password}
                    className={cn(adminControlClass, "font-mono")}
                  />
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setUserForm((current) => ({
                      ...current,
                      password: generateStrongPassword(),
                    }))
                  }
                  className={adminSecondaryButtonClass}
                >
                  <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                  Generate
                </button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-col-reverse gap-3 border-t border-[var(--odong-border)] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeUserForm}
              className={adminSecondaryButtonClass}
            >
              Batalkan
            </button>
            <button type="submit" className={adminPrimaryButtonClass}>
              {userModalMode === "edit" ? "Simpan perubahan" : "Tambah user"}
            </button>
          </div>
        </form>
      </AdminDialog>

      <AdminDialog
        open={Boolean(detailUser)}
        onClose={() => setDetailUser(null)}
        title="Detail pengguna"
        description="Ringkasan akun dan akses yang sedang terdaftar."
        size="sm"
      >
        {detailUser ? (
          <div className="space-y-4">
            <div className="grid gap-3">
              <DetailItem label="ID" value={detailUser.id} />
              <DetailItem label="Nama" value={detailUser.name} />
              <DetailItem label="Email" value={detailUser.email} />
              <DetailItem label="Role" value={<UserBadge role={detailUser.role} />} />
              <DetailItem
                label="Status"
                value={<StatusBadge status={detailUser.status} />}
              />
              <DetailItem label="Bergabung" value={detailUser.joinedAt} />
            </div>
            <AdminActionBar className="justify-end border-t border-[var(--odong-border)] pt-4">
              <button
                type="button"
                onClick={() => {
                  openEditUser(detailUser);
                  setDetailUser(null);
                }}
                className={adminPrimaryButtonClass}
              >
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit
              </button>
            </AdminActionBar>
          </div>
        ) : null}
      </AdminDialog>

      <AdminDialog
        open={Boolean(deleteUser)}
        onClose={() => setDeleteUser(null)}
        title="Hapus pengguna?"
        description="Data akan dihapus dari daftar admin lokal ini."
        size="sm"
      >
        <div className="space-y-5">
          <div className="rounded-[24px] border border-rose-100 bg-rose-50 px-4 py-4 text-sm font-semibold leading-6 text-rose-700">
            {deleteUser
              ? `Hapus ${deleteUser.name} (${deleteUser.email}) dari direktori pengguna?`
              : "Pilih pengguna yang akan dihapus."}
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setDeleteUser(null)}
              className={adminSecondaryButtonClass}
            >
              Batalkan
            </button>
            <button
              type="button"
              onClick={confirmDeleteUser}
              className={adminDangerButtonClass}
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Hapus
            </button>
          </div>
        </div>
      </AdminDialog>
    </div>
  );
}
