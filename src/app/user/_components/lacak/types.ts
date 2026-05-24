import type { LucideIcon } from "lucide-react";

export type TrackingPageStatus = "loading" | "error" | "empty" | "ready";

export type TrackingStepStatus = "done" | "current" | "upcoming";

export type TrackingOrderTone = "active" | "scheduled";

export type TrackingStep = {
  id: string;
  title: string;
  description: string;
  time: string;
  status: TrackingStepStatus;
  icon: LucideIcon;
};

export type TrackingLocation = {
  label: string;
  address: string;
  note: string;
};

export type TrackingCourier = {
  name: string;
  avatar: string;
  rating: number;
  vehicle: string;
  distance: string;
  responseTime: string;
};

export type TrackingOrder = {
  id: string;
  service: string;
  statusLabel: string;
  statusDescription: string;
  tone: TrackingOrderTone;
  eta: string;
  progress: number;
  updatedAt: string;
  weight: string;
  total: string;
  pickupWindow: string;
  outlet: string;
  payment: string | null;
  pickup: TrackingLocation;
  dropoff: TrackingLocation;
  courier: TrackingCourier | null;
  timeline: TrackingStep[];
};

export type TrackingInsight = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

export type TrackingCheckpoint = {
  title: string;
  description: string;
  icon: LucideIcon;
};
