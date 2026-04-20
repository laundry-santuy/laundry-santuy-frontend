// src/app/user/beranda/_components/staff-list.tsx
import { Phone, Plus } from "lucide-react";

const staffList = [
  { name: "Ahmad Fauzi", role: "Staff Laundry", initials: "AF" },
  { name: "Rina Suci", role: "Staff Laundry", initials: "RS" },
  { name: "Dedi Kurniawan", role: "Driver", initials: "DK" },
];

export function StaffList() {
  return (
    <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-base font-bold text-neutral-900">Staff Kami</h4>
        <button className="w-7 h-7 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-400 hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200 transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {staffList.map((s) => (
          <div key={s.name} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold shrink-0">
              {s.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-neutral-800 truncate">{s.name}</p>
              <p className="text-xs text-neutral-400">{s.role}</p>
            </div>
            <button className="text-xs font-semibold text-primary-500 hover:text-primary-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Phone className="w-3 h-3" />
              Hubungi
            </button>
          </div>
        ))}
      </div>
      <button className="mt-5 w-full py-2.5 rounded-xl border border-primary-200 text-primary-600 text-sm font-semibold hover:bg-primary-50 transition-colors">
        Lihat Semua
      </button>
    </div>
  );
}
