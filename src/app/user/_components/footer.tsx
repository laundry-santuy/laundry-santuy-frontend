import { Clock, Mail, MapPin, Phone, Shirt } from "lucide-react";
import Link from "next/link";

const footerNavigation = [
  {
    title: "Navigasi",
    links: [
      { label: "Beranda", href: "/user/beranda" },
      { label: "Order", href: "/user/pesan" },
      { label: "Lacak", href: "/user/lacak" },
      { label: "Riwayat", href: "/user/riwayat" },
    ],
  },
  {
    title: "Layanan",
    links: [
      { label: "Cuci Kiloan", href: "/user/pesan" },
      { label: "Cuci + Setrika", href: "/user/pesan" },
      { label: "Express", href: "/user/pesan" },
      { label: "Bedding Care", href: "/user/pesan" },
    ],
  },
  {
    title: "Bantuan",
    links: [
      { label: "Profil", href: "/user/profil" },
      { label: "Pengaturan", href: "/user/pengaturan" },
      { label: "Login", href: "/auth/login/user" },
      { label: "Daftar", href: "/auth/daftar/user" },
    ],
  },
];

const contactItems = [
  {
    label: "Jl. Santuy No. 24, Jakarta",
    icon: MapPin,
  },
  {
    label: "0812-3456-7890",
    icon: Phone,
  },
  {
    label: "hello@laundrysantuy.id",
    icon: Mail,
  },
  {
    label: "Setiap hari, 08.00 - 21.00",
    icon: Clock,
  },
];

export function UserFooter() {
  return (
    <footer className="relative z-10 mt-10 border-t border-[var(--odong-border)] bg-[var(--odong-surface)] backdrop-blur-xl">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.25fr_2fr] lg:px-8">
        <div>
          <Link href="/user/beranda" className="inline-flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 text-white">
              <Shirt className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block text-lg font-extrabold text-[var(--odong-text)]">
                Laundry Santuy
              </span>
              <span className="block text-xs font-medium text-[var(--odong-muted)]">
                Bersih, rapi, tanpa ribet.
              </span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-6 text-[var(--odong-muted)]">
            Layanan laundry jemput antar untuk pakaian harian, express, dan
            bedding care. Pesan dari rumah, pantau prosesnya, terima kembali
            dalam keadaan segar.
          </p>
          <div className="mt-5 grid gap-2 text-sm text-[var(--odong-muted)]">
            {contactItems.map((item) => {
              const Icon = item.icon;

              return (
                <p key={item.label} className="flex items-start gap-2">
                  <Icon
                    className="mt-0.5 h-4 w-4 shrink-0 text-primary-600"
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </p>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          {footerNavigation.map((group) => (
            <nav key={group.title} aria-label={group.title}>
              <h2 className="text-sm font-extrabold text-[var(--odong-text)]">
                {group.title}
              </h2>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-sm font-medium text-[var(--odong-muted)] transition hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--odong-border)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-4 py-5 text-xs font-medium text-[var(--odong-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 Laundry Santuy. All rights reserved.</p>
          <div className="flex flex-wrap gap-x-4 gap-y-2">
            <Link href="#" className="transition hover:text-primary-600">
              Kebijakan Privasi
            </Link>
            <Link href="#" className="transition hover:text-primary-600">
              Syarat Layanan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
