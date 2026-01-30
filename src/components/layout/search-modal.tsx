"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  AlertCircle,
  Megaphone,
  Package,
  LayoutDashboard,
  Settings,
  Plus,
  Search,
  QrCode,
  User,
} from "lucide-react";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();

  const runCommand = useCallback(
    (command: () => void) => {
      onOpenChange(false);
      command();
    },
    [onOpenChange]
  );

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Quick Actions">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/issues/new"))}
          >
            <Plus className="mr-2 h-4 w-4" />
            <span>Report New Issue</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/qr-scanner"))}
          >
            <QrCode className="mr-2 h-4 w-4" />
            <span>Scan QR Code</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Navigation">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard"))}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <span>My Activity</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/issues"))}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>Community Feed</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard/community"))}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            <span>My Community Posts</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/announcements"))}
          >
            <Megaphone className="mr-2 h-4 w-4" />
            <span>Announcements</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/dashboard/announcements"))}
          >
            <Megaphone className="mr-2 h-4 w-4" />
            <span>My Announcements</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/lost-found"))}
          >
            <Package className="mr-2 h-4 w-4" />
            <span>Lost & Found</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Settings">
          <CommandItem
            onSelect={() => runCommand(() => router.push("/profile"))}
          >
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </CommandItem>
          <CommandItem
            onSelect={() => runCommand(() => router.push("/settings"))}
          >
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
