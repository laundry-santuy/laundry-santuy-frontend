// src/app/user/beranda/_components/order-tracking.tsx
import {
  Shirt,
  PackageCheck,
  WashingMachine,
  CheckCircle2,
  Phone,
  MessageCircle,
  Check,
} from "lucide-react";

const activeOrder = {
  id: "#LS-004",
  service: "Cuci + Setrika",
  weight: "2.5 kg",
  eta: "2 jam",
  currentStep: 2,
  driver: {
    name: "Ahmad",
    role: "Kurir",
    rating: 4.8,
    vehicle: "Honda Beat B 1234 XY",
    initials: "AH",
  },
};

const trackingSteps = [
  { label: "Diterima", icon: PackageCheck },
  { label: "Dicuci", icon: WashingMachine },
  { label: "Disetrika", icon: Shirt },
  { label: "Selesai", icon: CheckCircle2 },
];

export function OrderTracking() {
  return (
    <div className="bg-white rounded-3xl p-5">
      {/* Order info row */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2 bg-neutral-50 rounded-xl px-4 py-3">
        <span className="text-sm font-bold text-neutral-900">{activeOrder.id}</span>
        <span className="text-sm text-neutral-500">{activeOrder.service}</span>
        <span className="text-sm text-neutral-500">{activeOrder.weight}</span>
        <span className="text-sm font-semibold text-primary-500">ETA: {activeOrder.eta}</span>
      </div>

      {/* Horizontal stepper */}
      <div className="flex items-start mb-5 px-4">
        {trackingSteps.map((step, i) => {
          const isCompleted = i < activeOrder.currentStep;
          const isActive = i === activeOrder.currentStep;
          const isLast = i === trackingSteps.length - 1;

          return (
            <div key={step.label} className="flex items-start flex-1">
              {/* Step circle + label */}
              <div className="flex flex-col items-center">
                <span
                  className={`flex items-center justify-center w-8 h-8 rounded-full ring-4 ring-white transition-all ${isCompleted
                    ? "bg-primary-500 text-white"
                    : isActive
                      ? "bg-primary-500 text-white shadow-md shadow-primary-200"
                      : "bg-neutral-100 text-neutral-400"
                    }`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <step.icon className="w-4 h-4" />
                  )}
                </span>
                <span
                  className={`mt-2 text-xs font-medium text-center ${isActive ? "text-neutral-900 font-bold" : isCompleted ? "text-primary-600" : "text-neutral-400"
                    }`}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mt-4 mx-1">
                  <div
                    className={`h-0.5 w-full ${isCompleted ? "bg-primary-500" : "bg-neutral-200"
                      }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Driver info */}
      <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
            {activeOrder.driver.initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">
              {activeOrder.driver.name} - {activeOrder.driver.role}
            </p>
            <p className="text-xs text-neutral-500 flex items-center gap-1">
              <span className="text-amber-500">★</span> {activeOrder.driver.rating} · {activeOrder.driver.vehicle}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="w-9 h-9 rounded-full bg-primary-500 text-white flex items-center justify-center hover:bg-primary-600 transition-colors">
            <MessageCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
