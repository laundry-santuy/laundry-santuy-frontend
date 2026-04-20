// src/app/user/beranda/_components/statistic-card.tsx
const chartData = [
  { label: "1-10 Apr", value: 30 },
  { label: "11-20 Apr", value: 45 },
  { label: "21-30 Apr", value: 25 },
];

export function StatisticCard() {
  return (
    <div className="bg-white rounded-3xl p-5">
      <h4 className="text-base font-bold text-neutral-900 mb-4">Statistik</h4>
      <div className="flex items-center justify-center mb-5">
        <div className="relative w-28 h-28">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.91549431" fill="none" stroke="#E1E3E4" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.91549431" fill="none" stroke="#558DFF" strokeWidth="3" strokeDasharray="32 68" strokeLinecap="round" className="transition-all duration-700" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold text-primary-500">32%</span>
          </div>
        </div>
      </div>
      <div className="bg-neutral-50 rounded-2xl p-4">
        <div className="flex items-end justify-between gap-3 h-28">
          {chartData.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs font-semibold text-neutral-700">{d.value}</span>
              <div className="w-full flex justify-center">
                <div
                  className="w-8 rounded-t-md bg-primary-300 hover:bg-primary-400 transition-colors"
                  style={{ height: `${(d.value / 60) * 80}px` }}
                />
              </div>
              <span className="text-[10px] text-neutral-400 whitespace-nowrap">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
