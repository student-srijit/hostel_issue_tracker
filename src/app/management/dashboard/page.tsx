"use client";

import { ManagementDashboard } from "@/components/dashboard/management-dashboard";
import { DashboardLayout } from "@/components/layout";

export default function ManagementDashboardPage() {
  return (
    <DashboardLayout>
      <ManagementDashboard />
    </DashboardLayout>
  );
}
