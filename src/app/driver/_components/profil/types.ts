import type { LucideIcon } from "lucide-react";

export type DriverProfileField = {
  label: string;
  value: string;
  icon: LucideIcon;
  fullWidth?: boolean;
};

export type DriverProfileStatTone = "primary" | "emerald" | "tertiary";

export type DriverProfileStat = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone: DriverProfileStatTone;
};

export type DriverProfileActivityTone = "success" | "warning" | "primary";

export type DriverProfileActivity = {
  id: string;
  title: string;
  time: string;
  icon: LucideIcon;
  rightValue?: string;
  rightCaption?: string;
  tone: DriverProfileActivityTone;
};

