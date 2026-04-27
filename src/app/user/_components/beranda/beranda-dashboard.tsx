import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  ChevronRight,
  CirclePlus,
  Clock,
  MapPin,
  Package,
  Shirt,
  Sparkles,
  Truck,
} from "lucide-react";
import { activeOrder, recentOrders } from "./data";
import { ActiveOrderCard } from "./active-order-card";
import {
  DashboardEmptyState,
  DashboardErrorState,
  DashboardLoadingState,
} from "./dashboard-states";
import { PromoBanner } from "./promo-banner";
import { RecentOrders } from "./recent-orders";
import { SectionHeader } from "./section-header";

type DashboardStatus = "loading" | "error" | "empty" | "ready";

type BerandaDashboardProps = {
  status?: DashboardStatus;
};

const serviceCards = [
  {
    title: "Cuci Kiloan",
    description: "Pakaian harian bersih dan wangi tanpa perlu ribet.",
    price: "Mulai Rp7.000/kg",
    eta: "2-3 hari",
    icon: Shirt,
  },
  {
    title: "Cuci + Setrika",
    description: "Siap masuk lemari dengan lipatan rapi dan fresh.",
    price: "Mulai Rp10.000/kg",
    eta: "2 hari",
    icon: Sparkles,
  },
  {
    title: "Express",
    description: "Laundry cepat untuk kebutuhan mendadak hari ini.",
    price: "Mulai Rp18.000/kg",
    eta: "6-12 jam",
    icon: Clock,
  },
  {
    title: "Bedding Care",
    description: "Seprei, bed cover, dan selimut dicuci lebih higienis.",
    price: "Mulai Rp25.000/item",
    eta: "2-3 hari",
    icon: Package,
  },
];

const workflowItems = [
  {
    title: "Pilih layanan",
    description: "Tentukan jenis laundry dan jadwal jemput.",
    icon: CalendarClock,
  },
  {
    title: "Kurir menjemput",
    description: "Pakaian kamu dijemput sesuai alamat.",
    icon: Truck,
  },
  {
    title: "Pantau proses",
    description: "Lacak status laundry sampai selesai.",
    icon: MapPin,
  },
];

export function BerandaDashboard({ status = "ready" }: BerandaDashboardProps) {
  if (status === "loading") {
    return <DashboardLoadingState />;
  }

  if (status === "error") {
    return <DashboardErrorState />;
  }

  if (status === "empty") {
    return <DashboardEmptyState />;
  }

  return (
    <div className="relative mx-auto min-h-screen w-full max-w-6xl space-y-6">
      {/* ODONG: Background gradient khusus halaman Beranda User. Pakai warna dari token Tailwind project. */}
      <div className="odong-beranda-gradient pointer-events-none fixed inset-0 z-0 min-h-screen overflow-hidden">
        {/* ODONG: Layer radial glow ala ReactBits, tetap pakai CSS variable Tailwind theme. */}
        <div className="odong-orb-slow absolute left-[-16%] top-[8%] h-[420px] w-[420px] rounded-full bg-primary-300/18 blur-3xl" />
        <div className="odong-orb-medium absolute right-[-14%] top-[18%] h-[380px] w-[380px] rounded-full bg-primary-200/25 blur-3xl" />
        <div className="odong-orb-fast absolute bottom-[-18%] left-[26%] h-[460px] w-[460px] rounded-full bg-primary-100/45 blur-3xl" />

        {/* ODONG: Grid dibuat lebih terlihat sedikit dan tetap fade ke bawah. */}
        <div className="odong-beranda-grid absolute inset-0" />
      </div>

      {/* ODONG: Konten utama dibuat relative agar selalu berada di atas background gradient. */}
      <div className="relative z-10 space-y-6">
        {/* ODONG: Hero penyapa awal untuk web service Laundry Santuy. */}
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_380px] lg:items-stretch">
          <div className="odong-surface relative overflow-hidden rounded-[28px] border border-white/80 bg-white/80 p-6 shadow-[0_20px_50px_rgba(25,28,29,0.08)] backdrop-blur-xl sm:p-8">
            <div className="absolute right-[-80px] top-[-90px] h-64 w-64 rounded-full bg-primary-200/35 blur-3xl" />
            <div className="relative">
              <p className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Layanan laundry jemput antar
              </p>
              <h1 className="odong-text mt-5 max-w-2xl text-4xl font-extrabold leading-[1.08] tracking-normal text-neutral-900 sm:text-5xl">
                Halo, selamat datang di Laundry Santuy.
              </h1>
              <p className="odong-muted mt-4 max-w-xl text-base leading-7 text-neutral-600">
                Pesan laundry, pantau proses, dan terima pakaian bersih tanpa
                keluar rumah. Semua dibuat santai, rapi, dan transparan dari
                awal sampai selesai.
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/user/pesan"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-5 text-sm font-bold text-white shadow-[0_14px_26px_rgba(0,88,202,0.22)] transition hover:-translate-y-0.5 hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
                >
                  <CirclePlus className="h-5 w-5" aria-hidden="true" />
                  Buat Order
                </Link>
                <Link
                  href="/user/lacak"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-primary-100 bg-white/75 px-5 text-sm font-bold text-primary-700 transition hover:-translate-y-0.5 hover:bg-primary-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 active:scale-[0.98]"
                >
                  Lacak Pesanan
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  ["4.8/5", "Rating kurir"],
                  ["2 jam", "Estimasi pickup"],
                  ["24/7", "Pantau order"],
                ].map(([value, label]) => (
                  <div
                    key={label}
                    className="odong-surface-soft rounded-2xl border border-primary-100/70 bg-primary-50/70 px-4 py-3"
                  >
                    <p className="odong-text text-xl font-extrabold text-neutral-900">
                      {value}
                    </p>
                    <p className="odong-muted mt-1 text-xs font-medium text-neutral-500">
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="odong-surface-soft rounded-[28px] border border-white/80 bg-primary-50/75 p-5 shadow-[0_20px_50px_rgba(25,28,29,0.08)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="odong-muted text-sm font-semibold text-neutral-500">
                  Pesanan aktif
                </p>
                <h2 className="odong-text mt-1 text-2xl font-extrabold text-neutral-900">
                  {activeOrder.id}
                </h2>
              </div>
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                {activeOrder.eta}
              </span>
            </div>

            <div className="odong-surface-strong mt-5 rounded-3xl bg-white/90 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 text-white">
                  <Shirt className="h-6 w-6" aria-hidden="true" />
                </div>
                <div>
                  <p className="odong-text font-bold text-neutral-900">
                    {activeOrder.service}
                  </p>
                  <p className="odong-muted mt-1 text-sm text-neutral-500">
                    {activeOrder.weight} sedang disetrika
                  </p>
                </div>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-primary-100">
                <div className="h-full w-2/3 rounded-full bg-primary-600" />
              </div>
              <div className="odong-muted mt-3 flex items-center justify-between text-xs font-medium text-neutral-500">
                <span>Diterima</span>
                <span>Selesai</span>
              </div>
            </div>

            <Link
              href="/user/lacak"
              className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 text-sm font-bold text-white transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-300 active:scale-[0.98]"
            >
              Lihat Detail
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <div className="odong-surface-strong rounded-2xl bg-white/90 px-4 py-3">
                <p className="odong-muted-soft text-xs font-semibold text-neutral-400">
                  Kurir
                </p>
                <p className="odong-text mt-1 text-sm font-bold text-neutral-900">
                  Ahmad · 4.8
                </p>
              </div>
              <div className="odong-surface-strong rounded-2xl bg-white/90 px-4 py-3">
                <p className="odong-muted-soft text-xs font-semibold text-neutral-400">
                  Berikutnya
                </p>
                <p className="odong-text mt-1 text-sm font-bold text-neutral-900">
                  Siap dikirim
                </p>
              </div>
            </div>
          </aside>
        </section>

        {/* ODONG: Promo diletakkan setelah sapaan + ringkasan pesanan aktif agar top area tetap jadi highlight utama. */}
        <PromoBanner />

        {/* ODONG: Kumpulan layanan utama yang ditampilkan di beranda baru. */}
        <section className="space-y-3">
          <SectionHeader
            title="Layanan Favorit"
            actionLabel="Order sekarang"
            href="/user/pesan"
          />
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {serviceCards.map((service) => {
              const Icon = service.icon;

              return (
                <article
                  key={service.title}
                  className="odong-surface-soft group rounded-[24px] border border-[var(--odong-border)] p-5 shadow-[0_14px_34px_rgba(25,28,29,0.045)] transition hover:-translate-y-1 hover:bg-[var(--odong-surface-strong)] hover:shadow-[0_20px_44px_rgba(25,28,29,0.075)]"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 transition group-hover:bg-primary-600 group-hover:text-white">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="odong-text mt-4 text-lg font-extrabold text-neutral-900">
                    {service.title}
                  </h3>
                  <p className="odong-muted mt-2 min-h-[48px] text-sm leading-6 text-neutral-500">
                    {service.description}
                  </p>
                  <div className="mt-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-primary-700">
                        {service.price}
                      </p>
                      <p className="mt-1 text-xs text-neutral-400">
                        Estimasi {service.eta}
                      </p>
                    </div>
                    <Link
                      href="/user/pesan"
                      aria-label={`Pesan ${service.title}`}
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900 text-white transition group-hover:bg-primary-600"
                    >
                      <ChevronRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ODONG: Alur singkat supaya pengguna baru paham cara memakai service. */}
        <section className="odong-surface-soft rounded-[28px] border border-[var(--odong-border)] p-5 shadow-[0_14px_34px_rgba(25,28,29,0.045)] sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary-700">
                Cara kerja
              </p>
              <h2 className="odong-text mt-1 text-2xl font-extrabold text-neutral-900">
                Dari keranjang ke lemari, tinggal pantau.
              </h2>
            </div>
            <Link
              href="/user/pesan"
              className="inline-flex items-center gap-1 text-sm font-bold text-primary-700 hover:text-primary-800"
            >
              Mulai sekarang
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {workflowItems.map((item, index) => {
              const Icon = item.icon;

              return (
                <article
                  key={item.title}
                  className="odong-surface-strong rounded-2xl bg-white/85 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-600 text-sm font-extrabold text-white">
                      {index + 1}
                    </span>
                    <Icon className="h-5 w-5 text-primary-600" aria-hidden="true" />
                  </div>
                  <h3 className="odong-text mt-4 font-extrabold text-neutral-900">
                    {item.title}
                  </h3>
                  <p className="odong-muted mt-2 text-sm leading-6 text-neutral-500">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="space-y-3">
          <SectionHeader
            title="Pesanan Aktif"
            actionLabel="Detail"
            href="/user/lacak"
          />
          <ActiveOrderCard order={activeOrder} />
        </section>

        <RecentOrders orders={recentOrders} />
      </div>
    </div>
  );
}
