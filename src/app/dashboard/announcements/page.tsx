"use client";

import { DashboardLayout } from "@/components/layout";
import { AnnouncementsModule } from "@/components/announcements";

export default function DashboardAnnouncementsPage() {
  return (
    <DashboardLayout>
      <AnnouncementsModule showCreateButton onlyMine />
    </DashboardLayout>
  );
}