"use client";

import { DashboardLayout } from "@/components/layout";
import { LostFoundModule } from "@/components/lost-found";

export default function LostFoundPage() {
  return (
    <DashboardLayout>
      <LostFoundModule />
    </DashboardLayout>
  );
}
