// src/app/user/beranda/_components/recent-orders.tsx
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Heart } from "lucide-react";

const tagColors = {
  primary: "bg-primary-50 text-primary-600",
  secondary: "bg-secondary-200 text-secondary-700",
  tertiary: "bg-tertiary-50 text-tertiary-600",
};

const dotColors = {
  primary: "bg-primary-500",
  secondary: "bg-secondary-500",
  tertiary: "bg-tertiary-500",
};

const recentOrders = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1545173168-9f1947eebb7f?w=400&h=250&fit=crop",
    tag: "CUCI SETRIKA",
    tagColor: "primary" as const,
    title: "Paket Reguler – Cuci Setrika 5 Kg",
    staff: "Ahmad Fauzi",
    role: "Staff Laundry",
    liked: false,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1582735689369-4fe89db7114c?w=400&h=250&fit=crop",
    tag: "CUCI KERING",
    tagColor: "secondary" as const,
    title: "Cuci Kering Express – Selesai 6 Jam",
    staff: "Rina Suci",
    role: "Staff Laundry",
    liked: true,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=400&h=250&fit=crop",
    tag: "SETRIKA",
    tagColor: "tertiary" as const,
    title: "Setrika Premium – Pakaian Formal",
    staff: "Dedi Kurniawan",
    role: "Staff Laundry",
    liked: false,
  },
];

export function RecentOrders() {
  const [carouselIndex, setCarouselIndex] = useState(0);
  const maxIndex = recentOrders.length - 1;
  const [likedCards, setLikedCards] = useState<Record<number, boolean>>(
    Object.fromEntries(recentOrders.map((o) => [o.id, o.liked]))
  );

  const toggleLike = (id: number) =>
    setLikedCards((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-neutral-900">Pesanan Terbaru</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setCarouselIndex(Math.max(0, carouselIndex - 1))}
            disabled={carouselIndex === 0}
            className="w-8 h-8 rounded-full border border-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCarouselIndex(Math.min(maxIndex, carouselIndex + 1))}
            disabled={carouselIndex === maxIndex}
            className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 disabled:opacity-30 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex gap-5 transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${carouselIndex * 33.33}%)` }}
        >
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="min-w-[calc(33.333%-14px)] max-w-[calc(33.333%-14px)] flex-shrink-0 bg-white rounded-2xl shadow-sm border border-neutral-100 overflow-hidden hover:shadow-lg transition-shadow group"
              style={{ minWidth: "280px" }}
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={order.image}
                  alt={order.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={() => toggleLike(order.id)}
                  className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${likedCards[order.id] ? "bg-red-500 text-white" : "bg-white/80 text-neutral-500 hover:bg-white"
                    }`}
                >
                  <Heart className="w-4 h-4" fill={likedCards[order.id] ? "currentColor" : "none"} />
                </button>
              </div>
              <div className="p-4">
                <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wide px-2.5 py-1 rounded-full ${tagColors[order.tagColor]}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${dotColors[order.tagColor]}`} />
                  {order.tag}
                </span>
                <p className="mt-2.5 text-sm font-semibold text-neutral-800 leading-snug line-clamp-2">{order.title}</p>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-50">
                  <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-bold">
                    {order.staff.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-neutral-800">{order.staff}</p>
                    <p className="text-[10px] text-neutral-400">{order.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
