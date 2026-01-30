"use client";

import { DashboardLayout } from "@/components/layout";
import { IssuesList } from "@/components/issues";

export default function DashboardCommunityPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <IssuesList
          title="My Community Posts"
          showFilters
          showViewToggle
          showSearch
          defaultView="list"
          queryParams={{ onlyMine: "true" }}
        />
      </div>
    </DashboardLayout>
  );
}