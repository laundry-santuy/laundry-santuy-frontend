"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ClipboardList,
  Download,
  Eye,
  Filter,
  PackageCheck,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
  Truck,
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
import { fetchManajemenPesanan, fetchPengaturanOutlet, updatePesananStatus, createPesananAdmin } from "@/lib/admin-api";
import type { AdminOrder, AdminOrderStatus } from "../types";

const PAGE_SIZE = 5;

const statusOptions: Array<AdminOrderStatus | "Semua"> = [
  "Semua",
  "Pending",
  "Processing",
  "ReadyForDelivery",
  "Completed",
  "Cancelled",
];

const statusLabel: Record<AdminOrderStatus, string> = {
  Pending: "Menunggu",
  Processing: "Diproses",
  ReadyForDelivery: "Siap Diantar",
  Completed: "Selesai",
  Cancelled: "Dibatalkan",
};

const statusToneClass: Record<AdminOrderStatus, string> = {
  Pending: "bg-rose-50 text-rose-600",
  Processing: "bg-amber-50 text-amber-600",
  ReadyForDelivery: "bg-amber-50 text-amber-600",
  Completed: "bg-emerald-50 text-emerald-600",
  Cancelled: "bg-[var(--odong-surface-muted)] text-[var(--odong-muted)]",
};

// outlet and service options are loaded from API at runtime

type OrderFormValues = {
  customer: string;
  outlet: string;
  service: string;
  total: string;
  status: AdminOrderStatus;
};

const emptyOrderForm: OrderFormValues = {
  customer: "",
  outlet: "",
  service: "",
  total: "Rp ",
  status: "Pending",
};

function createNextOrderId(orders: AdminOrder[]) {
  const nextNumber =
    Math.max(
      0,
      ...orders.map((order) => Number(order.id.match(/(\d+)$/)?.[1] ?? 0)),
    ) + 1;

  return `LS-2026-${String(nextNumber).padStart(4, "0")}`;
}

function formatDateTimeLabel() {
  const now = new Date();
  const datePart = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(now);
  const timePart = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
    .format(now)
    .replace(".", ":");

  return `${datePart}, ${timePart}`;
}

function StatusBadge({ status }: { status: AdminOrderStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold",
        statusToneClass[status],
      )}
    >
      {statusLabel[status]}
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

export function AdminOrderManagementPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [outlets, setOutlets] = useState<{ id: string; nama: string }[]>([]);
  const [services, setServices] = useState<{ id: string; nama: string }[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<(typeof statusOptions)[number]>("Semua");
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [orderModalMode, setOrderModalMode] =
    useState<"create" | "edit" | null>(null);
  const [editingOrder, setEditingOrder] = useState<AdminOrder | null>(null);
  const [detailOrder, setDetailOrder] = useState<AdminOrder | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<AdminOrder | null>(null);
  const [orderForm, setOrderForm] = useState<OrderFormValues>(emptyOrderForm);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Load orders and outlet/service options once on mount
    loadOrders();
    loadOutletAndServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadOutletAndServices() {
    try {
      const res = await fetchPengaturanOutlet();
      const semua = res.semuaOutlet || [];
      setOutlets(semua.map((o) => ({ id: o.id, nama: o.nama })));

      const layanan = (res.layananOutlet || []).map((l) => ({ id: l.id_layanan, nama: l.namaLayanan }));
      setServices(layanan);

      setOrderForm((cur) => ({
        ...cur,
        outlet: cur.outlet || (semua[0]?.id ?? ""),
        service: cur.service || (layanan[0]?.id ?? ""),
      }));
    } catch (err) {
      console.error("Failed to load outlets/services:", err);
    }
  }

  async function loadOrders() {
    try {
      setIsLoading(true);
      const res = await fetchManajemenPesanan(1, 1000);
      const mapped: AdminOrder[] = (res.orders || []).map((o) => {
        const rawStatus = (o.status || o.statusAsli || '').toString().toLowerCase();
        let status: AdminOrderStatus = 'Pending';
        if (rawStatus.includes('selesai') || rawStatus.includes('completed')) status = 'Completed';
        else if (rawStatus.includes('siap')) status = 'ReadyForDelivery';
        else if (rawStatus.includes('proses') || rawStatus.includes('sedang')) status = 'Processing';
        else if (rawStatus.includes('batal') || rawStatus.includes('dibatalkan') || rawStatus.includes('cancel')) status = 'Cancelled';
        else status = 'Pending';

        const dateLabel = o.date ? new Date(o.date).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';

        return {
          id: o.id_pesanan,
          customer: o.customer?.name || 'Tidak Diketahui',
          outlet: o.outlet || '-',
          service: o.layanan || '-',
          total: o.harga ? `Rp ${o.harga.toLocaleString('id-ID')}` : 'Rp 0',
          status,
          createdAt: dateLabel,
        } as AdminOrder;
      });

      setOrders(mapped);
    } catch (err) {
      console.error('Failed to load manajemen pesanan:', err);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.toLowerCase();

    return orders.filter((order) => {
      const matchesQuery =
        order.id.toLowerCase().includes(normalizedQuery) ||
        order.customer.toLowerCase().includes(normalizedQuery) ||
        order.outlet.toLowerCase().includes(normalizedQuery) ||
        order.service.toLowerCase().includes(normalizedQuery);
      const matchesStatus =
        statusFilter === "Semua" ? true : order.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [orders, query, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));
  const activePage = Math.min(page, totalPages);

  const paginatedOrders = useMemo(() => {
    const startIndex = (activePage - 1) * PAGE_SIZE;

    return filteredOrders.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredOrders, activePage]);

  const summary = {
    total: orders.length,
    pending: orders.filter((order) => order.status === "Pending").length,
    processing: orders.filter((order) => order.status === "Processing").length,
    completed: orders.filter((order) => order.status === "Completed").length,
  };

  const refreshOrders = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
    }

    // trigger reload from API
    loadOrders();
  };

  const openCreateOrder = () => {
    setEditingOrder(null);
    setOrderForm((cur) => ({
      ...emptyOrderForm,
      total: "Rp ",
      customer: "",
      outlet: cur.outlet || outlets[0]?.id || "",
      service: cur.service || services[0] || "",
      status: "Pending",
    }));
    setOrderModalMode("create");
  };

  const openEditOrder = (order: AdminOrder) => {
    setEditingOrder(order);
    setOrderForm({
      customer: order.customer,
      outlet: order.outlet as string,
      service: order.service as string,
      total: order.total,
      status: order.status,
    });
    setOrderModalMode("edit");
  };

  const closeOrderForm = () => {
    setOrderModalMode(null);
    setEditingOrder(null);
    setOrderForm(emptyOrderForm);
  };

  const submitOrderForm = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedCustomer = orderForm.customer.trim();
    const trimmedTotal = orderForm.total.trim();

    if (!trimmedCustomer || !trimmedTotal) {
      return;
    }

    if (orderModalMode === "create") {
      // call backend to create pesanan via admin API
      try {
        const hargaParsed = Number(String(trimmedTotal).replace(/[^0-9]/g, '')) || 0;
        const payload = {
          id_layanan: orderForm.service,
          id_laundry: orderForm.outlet,
          harga_total: hargaParsed,
          status: orderForm.status,
          customerName: trimmedCustomer,
        };
        const res = await createPesananAdmin(payload as any);
        const created = res.pesanan;
        if (created) {
          const mapped: AdminOrder = {
            id: created.id_pesanan || createNextOrderId([]),
            customer: created.customer?.nama || trimmedCustomer,
            outlet: created.outlet?.nama || orderForm.outlet,
            service: created.layanan?.nama || orderForm.service,
            total: `Rp ${Number(created.totalEstimasi || hargaParsed).toLocaleString('id-ID')}`,
            status: (created.status || 'menunggu').toString().toLowerCase().includes('siap') ? 'ReadyForDelivery' : (created.status || 'menunggu').toString().toLowerCase().includes('selesai') ? 'Completed' : 'Pending',
            createdAt: created.waktuPesanan || formatDateTimeLabel(),
          };
          setOrders((currentOrders) => [mapped, ...currentOrders]);
        }
      } catch (err) {
        console.error('Failed to create pesanan via admin API:', err);
        alert('Gagal membuat pesanan: ' + (err as any)?.message || 'Server error');
      }
      setPage(1);
    }

    if (orderModalMode === "edit" && editingOrder) {
        const newStatus = orderForm.status;
        // If status changed to ReadyForDelivery, call backend to persist
        if (newStatus === "ReadyForDelivery" && editingOrder.id) {
          try {
            // backend expects 'siap_diantar'
            await updatePesananStatus(editingOrder.id, "siap_diantar");
          } catch (err: any) {
            console.error("Failed to update status on server:", err);
            // show simple alert to user
            alert(err?.message || "Gagal memperbarui status pesanan di server");
            // do not update local state if server update failed
            closeOrderForm();
            return;
          }
        }

        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.id === editingOrder.id
              ? {
                  ...order,
                  customer: trimmedCustomer,
                  outlet: orderForm.outlet,
                  service: orderForm.service,
                  total: trimmedTotal,
                  status: orderForm.status,
                }
              : order,
          ),
        );
    }

    closeOrderForm();
  };

  const confirmDeleteOrder = () => {
    if (!deleteOrder) {
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.filter((order) => order.id !== deleteOrder.id),
    );
    setDetailOrder((currentOrder) =>
      currentOrder?.id === deleteOrder.id ? null : currentOrder,
    );
    setDeleteOrder(null);
    setPage(1);
  };

  const exportOrders = () => {
    exportRowsToExcel({
      fileName: "laundry-santuy-pesanan",
      sheetName: "Pesanan",
      columns: [
        { header: "ID", value: (order) => order.id },
        { header: "Customer", value: (order) => order.customer },
        { header: "Outlet", value: (order) => order.outlet },
        { header: "Layanan", value: (order) => order.service },
        { header: "Total", value: (order) => order.total },
        { header: "Status", value: (order) => statusLabel[order.status] },
        { header: "Dibuat", value: (order) => order.createdAt },
      ],
      rows: filteredOrders,
    });
  };

  return (
    <div className="space-y-5">
      <AdminPageHeader
        eyebrow="Manajemen Pesanan"
        title="Pantau status pesanan"
        description="Filter order, ubah progres, tambah order baru, lalu ekspor data dari satu panel yang rapi."
        actions={
          <AdminActionBar className="justify-end">
            <button
              type="button"
              onClick={refreshOrders}
              className={adminSecondaryButtonClass}
            >
              <RefreshCcw className="h-4 w-4" aria-hidden="true" />
              Muat ulang
            </button>
            <button
              type="button"
              onClick={exportOrders}
              className={adminSecondaryButtonClass}
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              Export Excel
            </button>
            <button
              type="button"
              onClick={openCreateOrder}
              className={adminPrimaryButtonClass}
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Tambah Pesanan
            </button>
          </AdminActionBar>
        }
      />

      <AdminMetricStrip
        items={[
          {
            label: "Total order",
            value: summary.total,
            caption: `${filteredOrders.length} sesuai filter`,
            icon: ClipboardList,
          },
          {
            label: "Menunggu",
            value: summary.pending,
            caption: "Perlu tindak lanjut",
            icon: Truck,
            tone: "danger",
          },
          {
            label: "Diproses",
            value: summary.processing,
            caption: "Sedang berjalan",
            icon: PackageCheck,
            tone: "warning",
          },
          {
            label: "Selesai",
            value: summary.completed,
            caption: "Siap ditutup",
            icon: PackageCheck,
            tone: "success",
          },
        ]}
      />

      <AdminPanel
        title="Daftar pesanan"
        description="Cari data pesanan, lalu kelola detailnya tanpa keluar dari halaman."
        icon={ClipboardList}
      >
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <label className="relative block">
            <span className="sr-only">Cari order, customer, outlet, atau layanan</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--odong-muted-soft)]" />
            <input
              type="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
              placeholder="Cari order, customer, outlet, atau layanan"
              className={cn(adminControlClass, "pl-11")}
            />
          </label>

          <label className="relative block">
            <span className="sr-only">Filter status pesanan</span>
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
                <option key={option} value={option}>
                  {option === "Semua" ? option : statusLabel[option]}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5">
          {isLoading ? (
            <AdminLoadingState />
          ) : filteredOrders.length === 0 ? (
            <AdminEmptyState
              title="Order tidak ditemukan"
              description="Coba ubah pencarian atau filter status yang aktif."
            />
          ) : (
            <>
              <div className="grid gap-3 lg:hidden">
                {paginatedOrders.map((order) => (
                  <article
                    key={order.id}
                    className="rounded-[26px] border border-[var(--odong-border)] bg-[var(--odong-surface-muted)] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-extrabold text-[var(--odong-text)]">
                          {order.id}
                        </p>
                        <p className="mt-1 text-sm text-[var(--odong-muted)]">
                          {order.createdAt}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="mt-4 grid gap-2">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--odong-muted-soft)]">
                          Customer
                        </p>
                        <p className="mt-1 font-semibold text-[var(--odong-text)]">
                          {order.customer}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--odong-muted-soft)]">
                          Outlet
                        </p>
                        <p className="mt-1 font-semibold text-[var(--odong-text)]">
                          {order.outlet}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--odong-muted-soft)]">
                          Layanan
                        </p>
                        <p className="mt-1 font-semibold text-[var(--odong-text)]">
                          {order.service}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase tracking-[0.08em] text-[var(--odong-muted-soft)]">
                          Total
                        </p>
                        <p className="mt-1 font-extrabold text-[var(--odong-text)]">
                          {order.total}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end gap-2 border-t border-[var(--odong-border)] pt-4">
                      <AdminIconButton
                        icon={Eye}
                        label={`Detail ${order.id}`}
                        onClick={() => setDetailOrder(order)}
                      />
                      <AdminIconButton
                        icon={Pencil}
                        label={`Edit ${order.id}`}
                        tone="primary"
                        onClick={() => openEditOrder(order)}
                      />
                      <AdminIconButton
                        icon={Trash2}
                        label={`Hapus ${order.id}`}
                        tone="danger"
                        onClick={() => setDeleteOrder(order)}
                      />
                    </div>
                  </article>
                ))}
              </div>

              <div className="hidden overflow-hidden rounded-[28px] border border-[var(--odong-border)] lg:block">
                <table className="min-w-full divide-y divide-[var(--odong-border)]">
                  <thead className="bg-[var(--odong-surface-soft)]">
                    <tr className="text-left text-xs font-extrabold uppercase tracking-[0.08em] text-[var(--odong-muted)]">
                      <th className="px-4 py-4">Order</th>
                      <th className="px-4 py-4">Customer</th>
                      <th className="px-4 py-4">Outlet</th>
                      <th className="px-4 py-4">Status</th>
                      <th className="px-4 py-4">Total</th>
                      <th className="px-4 py-4 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--odong-border)] bg-[var(--odong-surface-strong)]">
                    {paginatedOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="transition hover:bg-primary-50/35"
                      >
                        <td className="px-4 py-4">
                          <p className="font-extrabold text-[var(--odong-text)]">
                            {order.id}
                          </p>
                          <p className="mt-1 text-sm text-[var(--odong-muted)]">
                            {order.createdAt}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-semibold text-[var(--odong-text)]">
                            {order.customer}
                          </p>
                          <p className="mt-1 text-sm text-[var(--odong-muted)]">
                            {order.service}
                          </p>
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-[var(--odong-muted)]">
                          {order.outlet}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-4 text-sm font-extrabold text-[var(--odong-text)]">
                          {order.total}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <AdminIconButton
                              icon={Eye}
                              label={`Detail ${order.id}`}
                              onClick={() => setDetailOrder(order)}
                            />
                            <AdminIconButton
                              icon={Pencil}
                              label={`Edit ${order.id}`}
                              tone="primary"
                              onClick={() => openEditOrder(order)}
                            />
                            <AdminIconButton
                              icon={Trash2}
                              label={`Hapus ${order.id}`}
                              tone="danger"
                              onClick={() => setDeleteOrder(order)}
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
                totalItems={filteredOrders.length}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </>
          )}
        </div>
      </AdminPanel>

      <AdminDialog
        open={orderModalMode !== null}
        onClose={closeOrderForm}
        title={orderModalMode === "edit" ? "Edit pesanan" : "Tambah pesanan"}
        description={
          orderModalMode === "edit"
            ? "Perbarui customer, outlet, layanan, total, dan status pesanan."
            : "Buat pesanan baru dengan detail yang langsung siap diproses."
        }
        size="lg"
      >
        <form className="space-y-5" onSubmit={submitOrderForm}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block space-y-2 sm:col-span-2">
              <span className="text-sm font-extrabold text-[var(--odong-text)]">
                Customer
              </span>
              <input
                required
                value={orderForm.customer}
                onChange={(event) =>
                  setOrderForm((current) => ({
                    ...current,
                    customer: event.target.value,
                  }))
                }
                className={adminControlClass}
                placeholder="Contoh: Dinda Maharani"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-extrabold text-[var(--odong-text)]">
                Outlet
              </span>
              <select
                value={orderForm.outlet}
                onChange={(event) =>
                  setOrderForm((current) => ({
                    ...current,
                    outlet: event.target.value,
                  }))
                }
                className={adminSelectClass}
              >
                {outlets.length > 0 ? (
                  outlets.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.nama}
                    </option>
                  ))
                ) : (
                  <option value="">Pilih outlet</option>
                )}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-extrabold text-[var(--odong-text)]">
                Layanan
              </span>
              <select
                value={orderForm.service}
                onChange={(event) =>
                  setOrderForm((current) => ({
                    ...current,
                    service: event.target.value,
                  }))
                }
                className={adminSelectClass}
              >
                {services.length > 0 ? (
                  services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nama}
                    </option>
                  ))
                ) : (
                  <option value="">Pilih layanan</option>
                )}
              </select>
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-extrabold text-[var(--odong-text)]">
                Total
              </span>
              <input
                required
                value={orderForm.total}
                onChange={(event) =>
                  setOrderForm((current) => ({
                    ...current,
                    total: event.target.value,
                  }))
                }
                className={adminControlClass}
                placeholder="Rp 35.000"
              />
            </label>

            <label className="block space-y-2">
              <span className="text-sm font-extrabold text-[var(--odong-text)]">
                Status
              </span>
              <select
                value={orderForm.status}
                onChange={(event) =>
                  setOrderForm((current) => ({
                    ...current,
                    status: event.target.value as AdminOrderStatus,
                  }))
                }
                className={adminSelectClass}
              >
                {statusOptions
                  .filter(
                    (option): option is AdminOrderStatus => option !== "Semua",
                  )
                  .map((option) => (
                    <option key={option} value={option}>
                      {statusLabel[option]}
                    </option>
                  ))}
              </select>
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-[var(--odong-border)] pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeOrderForm}
              className={adminSecondaryButtonClass}
            >
              Batalkan
            </button>
            <button type="submit" className={adminPrimaryButtonClass}>
              {orderModalMode === "edit"
                ? "Simpan perubahan"
                : "Tambah pesanan"}
            </button>
          </div>
        </form>
      </AdminDialog>

      <AdminDialog
        open={Boolean(detailOrder)}
        onClose={() => setDetailOrder(null)}
        title="Detail pesanan"
        description="Ringkasan order dan status operasionalnya."
        size="sm"
      >
        {detailOrder ? (
          <div className="space-y-4">
            <div className="grid gap-3">
              <DetailItem label="Order" value={detailOrder.id} />
              <DetailItem label="Customer" value={detailOrder.customer} />
              <DetailItem label="Outlet" value={detailOrder.outlet} />
              <DetailItem label="Layanan" value={detailOrder.service} />
              <DetailItem label="Status" value={<StatusBadge status={detailOrder.status} />} />
              <DetailItem label="Total" value={detailOrder.total} />
              <DetailItem label="Dibuat" value={detailOrder.createdAt} />
            </div>
            <AdminActionBar className="justify-end border-t border-[var(--odong-border)] pt-4">
              <button
                type="button"
                onClick={() => {
                  openEditOrder(detailOrder);
                  setDetailOrder(null);
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
        open={Boolean(deleteOrder)}
        onClose={() => setDeleteOrder(null)}
        title="Hapus pesanan?"
        description="Data pesanan akan dihapus dari daftar admin lokal ini."
        size="sm"
      >
        <div className="space-y-5">
          <div className="rounded-[24px] border border-rose-100 bg-rose-50 px-4 py-4 text-sm font-semibold leading-6 text-rose-700">
            {deleteOrder
              ? `Hapus ${deleteOrder.id} milik ${deleteOrder.customer}?`
              : "Pilih pesanan yang akan dihapus."}
          </div>
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setDeleteOrder(null)}
              className={adminSecondaryButtonClass}
            >
              Batalkan
            </button>
            <button
              type="button"
              onClick={confirmDeleteOrder}
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
