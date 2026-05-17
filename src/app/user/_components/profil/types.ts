import type { LucideIcon } from "lucide-react";

export type ProfilePageStatus = "loading" | "error" | "empty" | "ready";

export type ProfileMetric = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

export type ProfileAddress = {
  id: string;
  label: string;
  address: string;
  note: string;
  isPrimary?: boolean;
  icon: LucideIcon;
};

export type ProfilePreference = {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  icon: LucideIcon;
};

export type PaymentMethod = {
  id: string;
  name: string;
  description: string;
  status: string;
  icon: LucideIcon;
};

export type SecurityItem = {
  id: string;
  label: string;
  description: string;
  status: string;
  icon: LucideIcon;
};

export type ProfileActivity = {
  id: string;
  title: string;
  description: string;
  time: string;
  icon: LucideIcon;
};

export type UserProfile = {
  name: string;
  initials: string;
  email: string;
  phone: string;
  gender: string;
  birthDate: string;
  joinedAt: string;
  memberLevel: string;
  profileCompletion: number;
  favoriteService: string;
  defaultOutlet: string;
};
