"use client";

import Link from "next/link";
import { AppShell } from "@/components/layout";
import { IssuesList } from "@/components/issues";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function IssuesPage() {
  return (
    <AppShell title="Community">
      <div className="space-y-6">
        <Card className="border-white/10 bg-white/5">
          <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Share a hostel issue</h2>
              <p className="text-sm text-white/60">
                Post a new report so your hostel community can upvote and track resolution.
              </p>
            </div>
            <Link href="/issues/new">
              <Button className="w-full md:w-auto">Start a Report</Button>
            </Link>
          </CardContent>
        </Card>
        <IssuesList
          title="Community Issues"
          showFilters
          showViewToggle
          showSearch
          defaultView="grid"
          queryParams={{ scope: "college" }}
        />
      </div>
    </AppShell>
  );
}
