// src/app/user/beranda/_components/order-history.tsx
import { Sparkles, Eye } from "lucide-react";

const orderHistory = [
  {
    staff: "Ahmad Fauzi",
    date: "16/04/2026",
    type: "CUCI SETRIKA",
    desc: "Paket Reguler 5 Kg",
  },
];

export function OrderHistory() {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-neutral-900">Riwayat Pesanan</h3>
        <button className="text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors">
          Lihat semua
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-neutral-100 overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 text-neutral-400 text-xs uppercase tracking-wider">
              <th className="text-left py-3 px-4 font-medium">Staff</th>
              <th className="text-left py-3 px-4 font-medium">Tipe</th>
              <th className="text-left py-3 px-4 font-medium">Deskripsi</th>
              <th className="text-left py-3 px-4 font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {orderHistory.map((row, i) => (
              <tr key={i} className="border-b last:border-b-0 border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {row.staff.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <p className="font-medium text-neutral-800">{row.staff}</p>
                      <p className="text-[10px] text-neutral-400">{row.date}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full bg-primary-50 text-primary-600">
                    <Sparkles className="w-3 h-3" />
                    {row.type}
                  </span>
                </td>
                <td className="py-3 px-4 text-neutral-600">{row.desc}</td>
                <td className="py-3 px-4">
                  <button className="w-7 h-7 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
