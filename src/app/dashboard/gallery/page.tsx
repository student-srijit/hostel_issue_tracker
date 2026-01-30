"use client";

import Link from "next/link";
import { Camera } from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { GalleryUploadCard } from "@/components/gallery/gallery-upload-card";

export default function GalleryUploadPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Hostel Gallery</h1>
            <p className="text-sm text-muted-foreground">
              Share hostel moments with your community.
            </p>
          </div>
          <Link href="/gallery">
            <Button variant="outline" className="gap-2">
              <Camera className="h-4 w-4" />
              View main gallery
            </Button>
          </Link>
        </div>

        <GalleryUploadCard
          title="Upload photo"
          description="Post one photo to the Hostel Gallery feed."
        />
      </div>
    </DashboardLayout>
  );
}