import type { LucideIcon } from "lucide-react";

export type OrderPageStatus = "loading" | "error" | "empty" | "ready";

export type ServiceOption = {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: "kg" | "item";
  eta: string;
  badge: string;
  minQuantity: number;
  maxQuantity: number;
  step: number;
  icon: LucideIcon;
};

export type PickupSlot = {
  id: string;
  day: string;
  date: string;
  window: string;
  capacity: string;
  recommended?: boolean;
};

export type AddressOption = {
  id: string;
  label: string;
  recipient: string;
  address: string;
  note: string;
  icon: LucideIcon;
};

export type AddOnOption = {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: LucideIcon;
};

export type PaymentOption = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
};
