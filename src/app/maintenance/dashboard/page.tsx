"use client";

import { MaintenanceDashboard } from "@/components/dashboard/maintenance-dashboard";
import { DashboardLayout } from "@/components/layout";

export default function MaintenanceDashboardPage() {
  return (
    <DashboardLayout>
      <MaintenanceDashboard />
    </DashboardLayout>
  );
}
