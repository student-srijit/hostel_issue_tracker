import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatRelativeTime(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks}w ago`;
  }

  return formatDate(d);
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getRandomColor(): string {
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-teal-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case "low":
      return "priority-low";
    case "medium":
      return "priority-medium";
    case "high":
      return "priority-high";
    case "emergency":
      return "priority-emergency";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case "reported":
    case "pending":
      return "status-pending";
    case "assigned":
    case "in-progress":
    case "in_progress":
      return "status-in-progress";
    case "resolved":
    case "completed":
      return "status-resolved";
    case "rejected":
    case "closed":
      return "status-rejected";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getOrdinalSuffix(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function arrayToMap<T extends { id: string }>(
  array: T[]
): Map<string, T> {
  return new Map(array.map((item) => [item.id, item]));
}

export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const key = keyFn(item);
      return {
        ...groups,
        [key]: [...(groups[key] || []), item],
      };
    },
    {} as Record<string, T[]>
  );
}

export function sortByDate<T extends { createdAt: Date | string }>(
  array: T[],
  order: "asc" | "desc" = "desc"
): T[] {
  return [...array].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return order === "desc" ? dateB - dateA : dateA - dateB;
  });
}

export function uniqueBy<T>(array: T[], keyFn: (item: T) => unknown): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 100);
}

export function hexToRgba(hex: string, alpha: number = 1): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

export const ISSUE_CATEGORIES = [
  { id: "plumbing", name: "Plumbing", icon: "Droplets", color: "#3B82F6" },
  { id: "electrical", name: "Electrical", icon: "Zap", color: "#F59E0B" },
  { id: "cleanliness", name: "Cleanliness", icon: "Sparkles", color: "#10B981" },
  { id: "internet", name: "Internet", icon: "Wifi", color: "#8B5CF6" },
  { id: "furniture", name: "Furniture", icon: "Armchair", color: "#EC4899" },
  { id: "structural", name: "Structural", icon: "Building2", color: "#6B7280" },
  { id: "security", name: "Security", icon: "Shield", color: "#EF4444" },
  { id: "ac_heating", name: "AC/Heating", icon: "Thermometer", color: "#06B6D4" },
  { id: "pest_control", name: "Pest Control", icon: "Bug", color: "#84CC16" },
  { id: "other", name: "Other", icon: "MoreHorizontal", color: "#64748B" },
] as const;

export const PRIORITY_LEVELS = [
  { id: "low", name: "Low", color: "#22C55E", description: "Can wait, minor inconvenience" },
  { id: "medium", name: "Medium", color: "#EAB308", description: "Should be addressed soon" },
  { id: "high", name: "High", color: "#F97316", description: "Urgent, affecting daily life" },
  { id: "emergency", name: "Emergency", color: "#EF4444", description: "Immediate attention required" },
] as const;

export const ISSUE_STATUSES = [
  { id: "reported", name: "Reported", color: "#EAB308" },
  { id: "assigned", name: "Assigned", color: "#3B82F6" },
  { id: "in_progress", name: "In Progress", color: "#8B5CF6" },
  { id: "resolved", name: "Resolved", color: "#22C55E" },
  { id: "rejected", name: "Rejected", color: "#EF4444" },
] as const;

// Alias for backward compatibility
export const STATUS_LABELS = ISSUE_STATUSES;

export const USER_ROLES = {
  STUDENT: "student",
  MANAGEMENT: "management",
  MAINTENANCE: "maintenance",
} as const;

export const HOSTELS = [
  "Block A",
  "Block B",
  "Block C",
  "Block D",
  "Block E",
  "Block F",
  "Girls Hostel 1",
  "Girls Hostel 2",
  "International Hostel",
] as const;

export const FLOORS = ["Ground", "1st", "2nd", "3rd", "4th", "5th"] as const;
