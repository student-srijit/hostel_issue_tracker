"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Bell, Home, LayoutDashboard, MessageSquare, QrCode, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/avatar";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
}

export function AppShell({ children, title }: AppShellProps) {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500" />
            <div>
              <p className="text-xs text-white/60">HostelHub</p>
              <p className="text-lg font-semibold">{title || "Community"}</p>
            </div>
          </Link>
          <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
            <Link href="/" className="flex items-center gap-2 hover:text-white">
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link href="/issues" className="flex items-center gap-2 hover:text-white">
              <MessageSquare className="h-4 w-4" />
              Community
            </Link>
            <Link href="/gallery" className="flex items-center gap-2 hover:text-white">
              <Images className="h-4 w-4" />
              Hostel Gallery
            </Link>
            <Link href="/announcements" className="hover:text-white">Announcements</Link>
            <Link href="/qr-scanner" className="flex items-center gap-2 hover:text-white">
              <QrCode className="h-4 w-4" />
              QR Scan
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Link href="/dashboard">
              <Button variant="outline" className="hidden sm:flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                My Activity
              </Button>
            </Link>
            {session?.user && (
              <Link
                href="/profile"
                className="rounded-full ring-offset-background transition hover:ring-2 hover:ring-purple-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500/60"
                aria-label="Open profile"
              >
                <UserAvatar
                  name={session.user.name || "User"}
                  image={session.user.image}
                  size="sm"
                />
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16 pt-8">
        {children}
      </main>
    </div>
  );
}