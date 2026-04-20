// src/app/user/beranda/_components/laundry-reminder.tsx
import { Plus } from "lucide-react";

const reminders = [
  { label: "Laundry Rutin", date: "Rabu, 23 Oktober 2025" },
  { label: "Seprei", date: "Selasa, 22 Oktober 2025" },
  { label: "Pakaian Kerja", date: "Minggu, 20 Oktober 2025" },
];

export function LaundryReminder() {
  return (
    <div className="bg-white rounded-3xl p-5">
      <h4 className="text-base font-bold text-neutral-900 mb-4">
        Pengingat Laundry
      </h4>
      <div className="flex flex-col gap-3">
        {reminders.map((item, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-400 accent-primary-500"
            />
            <div>
              <p className="text-sm font-medium text-neutral-800 group-hover:text-primary-600 transition-colors">
                {item.label}
              </p>
              <p className="text-xs text-neutral-400">{item.date}</p>
            </div>
          </label>
        ))}
      </div>
      <button className="mt-4 w-full py-2.5 rounded-xl border border-dashed border-primary-300 text-primary-500 text-sm font-semibold hover:bg-primary-50 transition-colors flex items-center justify-center gap-1.5">
        <Plus className="w-4 h-4" />
        Tambah Pengingat
      </button>
    </div>
  );
}
