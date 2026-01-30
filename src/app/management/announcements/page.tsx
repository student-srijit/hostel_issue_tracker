"use client";

import { DashboardLayout } from "@/components/layout";
import { AnnouncementsModule } from "@/components/announcements";

export default function ManagementAnnouncementsPage() {
  return (
    <DashboardLayout>
      <AnnouncementsModule showCreateButton />
    </DashboardLayout>
  );
}
