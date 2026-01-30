"use client";

import { AppShell } from "@/components/layout";
import { AnnouncementsModule } from "@/components/announcements";

export default function AnnouncementsPage() {
  return (
    <AppShell title="Announcements">
      <AnnouncementsModule showCreateButton />
    </AppShell>
  );
}
