"use client";

import type { FormEvent, ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  ChevronsRight,
  ClipboardList,
  Download,
  Eye,
  Filter,
  Image,
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
import { fetchManajemenPesanan, fetchPengaturanOutlet, fetchManajemenUser, updatePesananStatus, createPesananAdmin, deletePesananAdmin, konfirmasiPembayaran } from "@/lib/admin-api";
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
  customerId: string;
  outlet: string;
  service: string;
  total: string;
  status: AdminOrderStatus;
};

const emptyOrderForm: OrderFormValues = {
  customerId: "",
  outlet: "",
  service: "",
  total: "Rp ",
  status: "Pending",
};

const STAGE_NEXT_STATUS: Record<string, string> = {
  menunggu: 'menuju_lokasi',
  menuju_lokasi: 'dijemput',
  dijemput: 'di_laundry',
  di_laundry: 'siap_diantar',
  siap_diantar: 'diantar',
  diantar: 'selesai',
};

const STAGE_LABEL: Record<string, string> = {
  menunggu: 'Menunggu',
  menuju_lokasi: 'Menuju Lokasi',
  dijemput: 'Dijemput',
  di_laundry: 'Di Laundry',
  siap_diantar: 'Siap Diantar',
  diantar: 'Diantar',
  selesai: 'Selesai',
  dibatalkan: 'Dibatalkan',
};

function getAdvanceLabel(statusAsli: string): string {
  if (statusAsli === 'di_laundry') return 'Konfirmasi Selesai Cuci';
  const next = STAGE_NEXT_STATUS[statusAsli];
  return next ? `Tandai ${STAGE_LABEL[next] ?? next}` : '';
}

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
  const [customers, setCustomers] = useState<{ id: string; nama: string; email: string }[]>([]);
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
  const [konfirmasiOrder, setKonfirmasiOrder] = useState<AdminOrder | null>(null);
  const [konfirmasiLoading, setKonfirmasiLoading] = useState(false);
  const [advanceOrder, setAdvanceOrder] = useState<AdminOrder | null>(null);
  const [advanceLoading, setAdvanceLoading] = useState(false);
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
    loadCustomers();
    loadOutletAndServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadCustomers() {
    try {
      const res = await fetchManajemenUser(1, 1000);
      const pelanggan = (res.users || [])
        .filter((user) => (user.role || '').toLowerCase() === 'user' || (user.role || '').toLowerCase() === 'pelanggan')
        .map((user) => ({
          id: user.id,
          nama: user.nama,
          email: user.email,
        }));
      setCustomers(pelanggan);
      setOrderForm((cur) => ({
        ...cur,
        customerId: cur.customerId || (pelanggan[0]?.id ?? ''),
      }));
    } catch (err) {
      console.error('Failed to load customers:', err);
    }
  }

  async function loadOutletAndServices() {
    try {
      const res = await fetchPengaturanOutlet();
      const semua = res.semuaOutlet || [];
      setOutlets(
        semua.map((o) => ({ id: o.id_outlet ?? String(o.namaOutlet || Math.random()), nama: o.namaOutlet }))
      );

      const layanan = (res.layananOutlet || []).map((l) => ({ id: l.id_layanan ?? String(l.namaLayanan || Math.random()), nama: l.namaLayanan }));
      setServices(layanan);

      setOrderForm((cur) => ({
        ...cur,
        outlet: cur.outlet || (semua[0]?.id_outlet ?? ""),
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
          kodePesanan: o.kodePesanan ?? `#LS-${(o.id_pesanan || '').slice(-3)}`,
          customer: o.customer?.name || 'Tidak Diketahui',
          outlet: o.outlet || '-',
          service: o.layanan || '-',
          total: o.harga ? `Rp ${o.harga.toLocaleString('id-ID')}` : 'Rp 0',
          status,
          createdAt: dateLabel,
          statusPembayaran: o.statusPembayaran ?? null,
          fotoBuktiUrl: o.fotoBuktiUrl ?? null,
          statusAsli: o.statusAsli ?? null,
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
        order.kodePesanan.toLowerCase().includes(normalizedQuery) ||
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
      customerId: cur.customerId || customers[0]?.id || "",
      outlet: cur.outlet || outlets[0]?.id || "",
      service: cur.service || services[0]?.id || "",
      status: "Pending",
    }));
    setOrderModalMode("create");
  };

  const openEditOrder = (order: AdminOrder) => {
    setEditingOrder(order);
    setOrderForm({
      customerId: "",
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

    const selectedCustomer = customers.find((customer) => customer.id === orderForm.customerId);
    const trimmedTotal = orderForm.total.trim();

    if (!trimmedTotal) {
      return;
    }

    if (orderModalMode === "create" && !selectedCustomer) {
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
          id_pengguna: selectedCustomer?.id ?? '',
        };
        const res = await createPesananAdmin(payload as any);
        const created = res.pesanan;
        if (created) {
          const rawId: string = created.id_pesanan || createNextOrderId([]);
          const mapped: AdminOrder = {
            id: rawId,
            kodePesanan: created.kodePesanan ?? `#LS-${rawId.slice(-3)}`,
            customer: created.customer?.nama || selectedCustomer?.nama || "Tidak Diketahui",
            outlet: created.outlet?.nama || orderForm.outlet,
            service: created.layanan?.nama || orderForm.service,
            total: `Rp ${Number(created.totalEstimasi || hargaParsed).toLocaleString('id-ID')}`,
            status: (created.status || 'menunggu').toString().toLowerCase().includes('siap') ? 'ReadyForDelivery' : (created.status || 'menunggu').toString().toLowerCase().includes('selesai') ? 'Completed' : 'Pending',
            createdAt: created.waktuPesanan || formatDateTimeLabel(),
            statusPembayaran: null,
            fotoBuktiUrl: null,
            statusAsli: created.status ?? 'menunggu',
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

        if (editingOrder.id && newStatus !== editingOrder.status) {
          const statusMap: Record<string, string> = {
            Pending: 'menunggu',
            Processing: 'di_laundry',
            ReadyForDelivery: 'siap_diantar',
            Completed: 'selesai',
            Cancelled: 'dibatalkan',
          };

          const backendStatus = statusMap[newStatus] ?? newStatus;

          try {
            await updatePesananStatus(editingOrder.id, backendStatus);
          } catch (err: any) {
            console.error("Failed to update status on server:", err);
            alert(err?.message || "Gagal memperbarui status pesanan di server");
            closeOrderForm();
            return;
          }
        }

        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order.id === editingOrder.id
              ? {
                  ...order,
                  // keep existing customer for edit (not editable)
                  customer: editingOrder.customer,
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

  const handleKonfirmasiPembayaran = (order: AdminOrder) => {
    setKonfirmasiOrder(order);
  };

  const confirmKonfirmasiPembayaran = async () => {
    if (!konfirmasiOrder) return;
    setKonfirmasiLoading(true);
    try {
      await konfirmasiPembayaran(konfirmasiOrder.id);
      setOrders((cur) =>
        cur.map((o) => o.id === konfirmasiOrder.id ? { ...o, statusPembayaran: 'lunas' } : o)
      );
      setDetailOrder((d) =>
        d?.id === konfirmasiOrder.id ? { ...d, statusPembayaran: 'lunas' } : d
      );
      setKonfirmasiOrder(null);
    } catch (err: any) {
      alert(err?.message ?? 'Gagal mengkonfirmasi pembayaran.');
    } finally {
      setKonfirmasiLoading(false);
    }
  };

  const confirmAdvanceStage = async () => {
    if (!advanceOrder) return;
    const statusAsli = (advanceOrder.statusAsli ?? '').toLowerCase();
    const nextStatus = STAGE_NEXT_STATUS[statusAsli];
    if (!nextStatus) return;

    setAdvanceLoading(true);
    try {
      await updatePesananStatus(advanceOrder.id, nextStatus);

      const newAdminStatus: AdminOrderStatus =
        nextStatus === 'selesai' ? 'Completed' :
        nextStatus === 'siap_diantar' ? 'ReadyForDelivery' :
        nextStatus === 'dibatalkan' ? 'Cancelled' :
        nextStatus === 'menunggu' ? 'Pending' : 'Processing';

      setOrders((cur) =>
        cur.map((o) =>
          o.id === advanceOrder.id
            ? { ...o, status: newAdminStatus, statusAsli: nextStatus }
            : o,
        ),
      );
      setDetailOrder((d) =>
        d?.id === advanceOrder.id
          ? { ...d, status: newAdminStatus, statusAsli: nextStatus }
          : d,
      );
      setAdvanceOrder(null);
    } catch (err: any) {
      alert(err?.message ?? 'Gagal memperbarui status pesanan.');
    } finally {
      setAdvanceLoading(false);
    }
  };

  const confirmDeleteOrder = async () => {
    if (!deleteOrder) return;
    try {
      await deletePesananAdmin(deleteOrder.id);
    } catch (err: any) {
      alert(err?.message ?? "Gagal menghapus pesanan.");
      setDeleteOrder(null);
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
        { header: "ID", value: (order) => order.kodePesanan },
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
                          {order.kodePesanan}
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
                      {order.fotoBuktiUrl && (
                        <AdminIconButton
                          icon={Image}
                          label="Lihat foto bukti"
                          onClick={() => window.open(order.fotoBuktiUrl!, '_blank')}
                        />
                      )}
                      {order.statusPembayaran === 'menunggu_konfirmasi' && (
                        <AdminIconButton
                          icon={BadgeCheck}
                          label="Konfirmasi pembayaran"
                          tone="success"
                          onClick={() => handleKonfirmasiPembayaran(order)}
                        />
                      )}
                      {order.statusAsli === 'di_laundry' && (
                        <AdminIconButton
                          icon={ChevronsRight}
                          label="Konfirmasi Selesai Cuci"
                          tone="primary"
                          onClick={() => setAdvanceOrder(order)}
                        />
                      )}
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
                            {order.kodePesanan}
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
                            {order.fotoBuktiUrl && (
                              <AdminIconButton
                                icon={Image}
                                label="Lihat foto bukti"
                                onClick={() => window.open(order.fotoBuktiUrl!, '_blank')}
                              />
                            )}
                            {order.statusPembayaran === 'menunggu_konfirmasi' && (
                              <AdminIconButton
                                icon={BadgeCheck}
                                label="Konfirmasi pembayaran"
                                tone="success"
                                onClick={() => handleKonfirmasiPembayaran(order)}
                              />
                            )}
                            {order.statusAsli === 'di_laundry' && (
                              <AdminIconButton
                                icon={ChevronsRight}
                                label="Konfirmasi Selesai Cuci"
                                tone="primary"
                                onClick={() => setAdvanceOrder(order)}
                              />
                            )}
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
            ? "Perbarui outlet, layanan, total, dan status pesanan."
            : "Buat pesanan baru dengan detail yang langsung siap diproses."
        }
        size="lg"
      >
        <form className="space-y-5" onSubmit={submitOrderForm}>
          <div className="grid gap-4 sm:grid-cols-2">
            {orderModalMode === "edit" ? (
              <div className="block space-y-2 sm:col-span-2">
                <span className="text-sm font-extrabold text-[var(--odong-text)]">
                  Customer
                </span>
                <div className="rounded-2xl border border-[var(--odong-border)] bg-[var(--odong-surface-muted)] px-4 py-3 text-sm font-semibold text-[var(--odong-text)]">
                  {editingOrder?.customer || "Tidak Diketahui"}
                </div>
              </div>
            ) : (
              <label className="block space-y-2 sm:col-span-2">
                <span className="text-sm font-extrabold text-[var(--odong-text)]">
                  Customer
                </span>
                <select
                  required
                  value={orderForm.customerId}
                  onChange={(event) =>
                    setOrderForm((current) => ({
                      ...current,
                      customerId: event.target.value,
                    }))
                  }
                  className={adminControlClass}
                >
                  <option value="">Pilih customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.nama} - {customer.id}
                    </option>
                  ))}
                </select>
              </label>
            )}

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
              <DetailItem label="Order" value={detailOrder.kodePesanan} />
              <DetailItem label="Customer" value={detailOrder.customer} />
              <DetailItem label="Outlet" value={detailOrder.outlet} />
              <DetailItem label="Layanan" value={detailOrder.service} />
              <DetailItem label="Status" value={<StatusBadge status={detailOrder.status} />} />
              <DetailItem label="Total" value={detailOrder.total} />
              <DetailItem label="Dibuat" value={detailOrder.createdAt} />
              <DetailItem
                label="Status Pembayaran"
                value={
                  detailOrder.statusPembayaran === 'lunas' ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Lunas
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-extrabold text-amber-700">
                      Menunggu Konfirmasi
                    </span>
                  )
                }
              />
              {detailOrder.fotoBuktiUrl && (
                <DetailItem
                  label="Foto Bukti Pengantaran"
                  value={
                    <a
                      href={detailOrder.fotoBuktiUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-primary-700 underline underline-offset-2 hover:text-primary-900"
                    >
                      <Image className="h-3.5 w-3.5" />
                      Lihat foto
                    </a>
                  }
                />
              )}
            </div>

            {/* Konfirmasi pembayaran — tampil saat pengguna sudah konfirmasi transfer/QRIS */}
            {detailOrder.statusPembayaran === 'menunggu_konfirmasi' && (
              <div className="rounded-[20px] border border-emerald-100 bg-emerald-50 p-4">
                <p className="text-sm font-bold text-emerald-800">
                  Pengguna telah mengkonfirmasi pembayaran.
                </p>
                <p className="mt-1 text-xs text-emerald-700">
                  Verifikasi dan konfirmasi pembayaran agar pesanan dapat diproses oleh kurir.
                </p>
                <button
                  type="button"
                  onClick={() => handleKonfirmasiPembayaran(detailOrder)}
                  className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(22,163,74,0.22)] transition hover:-translate-y-0.5 hover:bg-emerald-700 active:scale-[0.98]"
                >
                  <BadgeCheck className="h-4 w-4" />
                  Konfirmasi Pembayaran
                </button>
              </div>
            )}

            {/* Selesai cuci — hanya tampil saat cucian di laundry menunggu konfirmasi admin */}
            {detailOrder.statusAsli === 'di_laundry' && (
              <div className="rounded-[20px] border border-primary-100 bg-primary-50 p-4">
                <p className="text-sm font-bold text-primary-800">
                  Cucian sudah selesai dicuci?
                </p>
                <p className="mt-1 text-xs text-primary-700">
                  Di Laundry → Siap Diantar
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setAdvanceOrder(detailOrder);
                    setDetailOrder(null);
                  }}
                  className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(0,88,202,0.22)] transition hover:-translate-y-0.5 hover:bg-primary-700 active:scale-[0.98]"
                >
                  <ChevronsRight className="h-4 w-4" />
                  Konfirmasi Selesai Cuci
                </button>
              </div>
            )}

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

      {/* Modal lanjutkan tahap */}
      <AdminDialog
        open={Boolean(advanceOrder)}
        onClose={() => setAdvanceOrder(null)}
        title={advanceOrder?.statusAsli === 'di_laundry' ? 'Konfirmasi selesai cuci?' : 'Lanjutkan tahap pesanan?'}
        description="Status pesanan akan diperbarui ke tahap berikutnya."
        size="sm"
      >
        <div className="space-y-5">
          {advanceOrder && (
            <>
              <div className="divide-y divide-[var(--odong-border)] rounded-[20px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)]">
                {[
                  { label: "Order", value: advanceOrder.kodePesanan },
                  { label: "Customer", value: advanceOrder.customer },
                  {
                    label: "Status",
                    value: `${STAGE_LABEL[advanceOrder.statusAsli ?? ''] ?? advanceOrder.statusAsli} → ${STAGE_LABEL[STAGE_NEXT_STATUS[advanceOrder.statusAsli ?? '']] ?? '-'}`,
                  },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span className="text-xs font-semibold text-[var(--odong-muted)]">{label}</span>
                    <span className="text-sm font-extrabold text-[var(--odong-text)]">{value}</span>
                  </div>
                ))}
              </div>
              <div className="rounded-[16px] border border-primary-100 bg-primary-50 px-4 py-3 text-sm leading-6 text-primary-700">
                {advanceOrder.statusAsli === 'di_laundry'
                  ? 'Setelah dikonfirmasi, kurir dapat melanjutkan pengantaran ke pelanggan.'
                  : 'Tindakan ini akan memperbarui status dan memberitahu kurir.'}
              </div>
            </>
          )}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setAdvanceOrder(null)}
              disabled={advanceLoading}
              className={adminSecondaryButtonClass}
            >
              Batalkan
            </button>
            <button
              type="button"
              onClick={confirmAdvanceStage}
              disabled={advanceLoading}
              className="inline-flex items-center gap-2 rounded-2xl bg-primary-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(0,88,202,0.22)] transition hover:bg-primary-700 disabled:opacity-60"
            >
              <ChevronsRight className="h-4 w-4" aria-hidden="true" />
              {advanceLoading ? 'Memproses...' : (advanceOrder ? getAdvanceLabel(advanceOrder.statusAsli ?? '') : 'Lanjutkan')}
            </button>
          </div>
        </div>
      </AdminDialog>

      {/* Modal konfirmasi pembayaran */}
      <AdminDialog
        open={Boolean(konfirmasiOrder)}
        onClose={() => setKonfirmasiOrder(null)}
        title="Konfirmasi pembayaran?"
        description="Pembayaran akan ditandai lunas dan pesanan dilepas ke kurir."
        size="sm"
      >
        <div className="space-y-5">
          {konfirmasiOrder && (
            <div className="divide-y divide-[var(--odong-border)] rounded-[20px] border border-[var(--odong-border)] bg-[var(--odong-surface-strong)]">
              {[
                { label: "Order", value: konfirmasiOrder.kodePesanan },
                { label: "Customer", value: konfirmasiOrder.customer },
                { label: "Total", value: konfirmasiOrder.total },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="text-xs font-semibold text-[var(--odong-muted)]">{label}</span>
                  <span className="text-sm font-extrabold text-[var(--odong-text)]">{value}</span>
                </div>
              ))}
            </div>
          )}
          <div className="rounded-[16px] border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-700">
            Setelah dikonfirmasi, status pembayaran berubah menjadi <strong>Lunas</strong> dan pesanan muncul di halaman kurir.
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setKonfirmasiOrder(null)}
              disabled={konfirmasiLoading}
              className={adminSecondaryButtonClass}
            >
              Batalkan
            </button>
            <button
              type="button"
              onClick={confirmKonfirmasiPembayaran}
              disabled={konfirmasiLoading}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-extrabold text-white shadow-[0_8px_18px_rgba(22,163,74,0.22)] transition hover:bg-emerald-700 disabled:opacity-60"
            >
              <BadgeCheck className="h-4 w-4" aria-hidden="true" />
              {konfirmasiLoading ? 'Memproses...' : 'Konfirmasi Lunas'}
            </button>
          </div>
        </div>
      </AdminDialog>
    </div>
  );
}
