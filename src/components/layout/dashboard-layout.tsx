"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  AlertCircle,
  Megaphone,
  Package,
  QrCode,
  Settings,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  Search,
  ChevronDown,
  Users,
  BarChart3,
  Award,
  User,
  HelpCircle,
  Images,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { SearchModal } from "@/components/layout/search-modal";
import { NotificationsDropdown } from "@/components/layout/notifications-dropdown";

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: { title: string; href: string }[];
}

const studentNavItems: NavItem[] = [
  { title: "My Activity", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { title: "My Community", href: "/dashboard/community", icon: <AlertCircle className="h-5 w-5" /> },
  { title: "My Announcements", href: "/dashboard/announcements", icon: <Megaphone className="h-5 w-5" /> },
  { title: "Gallery", href: "/dashboard/gallery", icon: <Images className="h-5 w-5" /> },
  { title: "Lost & Found", href: "/lost-found", icon: <Package className="h-5 w-5" /> },
  { title: "QR Scanner", href: "/qr-scanner", icon: <QrCode className="h-5 w-5" /> },
];

const managementNavItems: NavItem[] = [
  { title: "Dashboard", href: "/management/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { title: "All Issues", href: "/management/issues", icon: <AlertCircle className="h-5 w-5" /> },
  { title: "Analytics", href: "/management/analytics", icon: <BarChart3 className="h-5 w-5" /> },
  { title: "Staff", href: "/management/staff", icon: <Users className="h-5 w-5" /> },
  { title: "Announcements", href: "/management/announcements", icon: <Megaphone className="h-5 w-5" /> },
  { title: "Lost & Found", href: "/management/lost-found", icon: <Package className="h-5 w-5" /> },
  { title: "Leaderboard", href: "/management/leaderboard", icon: <Award className="h-5 w-5" /> },
];

const maintenanceNavItems: NavItem[] = [
  { title: "Dashboard", href: "/maintenance/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { title: "Assigned Issues", href: "/maintenance/issues", icon: <AlertCircle className="h-5 w-5" /> },
  { title: "My Performance", href: "/maintenance/performance", icon: <BarChart3 className="h-5 w-5" /> },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getNavItems = useCallback(() => {
    switch (session?.user?.role) {
      case "management":
        return managementNavItems;
      case "maintenance":
        return maintenanceNavItems;
      default:
        return studentNavItems;
    }
  }, [session?.user?.role]);

  const navItems = getNavItems();

  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleOpenSearch = () => setIsSearchOpen(true);
    window.addEventListener("open-search", handleOpenSearch);
    return () => window.removeEventListener("open-search", handleOpenSearch);
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Desktop Sidebar - Premium */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out hidden lg:block",
          isSidebarOpen ? "w-72" : "w-20"
        )}
      >
        <div className="flex h-full flex-col glass-ultra border-r border-white/20 dark:border-gray-800/50">
          {/* Logo */}
          <div className="flex h-20 items-center justify-between px-5 border-b border-gray-200/50 dark:border-gray-700/30">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-morph text-white font-bold text-lg shadow-lg shadow-purple-500/30 group-hover:scale-105 transition-transform">
                  H
                </div>
                <div className="absolute inset-0 rounded-xl gradient-morph blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
              </div>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    HostelHub
                  </span>
                  <span className="block text-[10px] text-muted-foreground -mt-0.5">Smart Tracking</span>
                </motion.div>
              )}
            </Link>
            <Button
              variant="ghost"
              size="iconSm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="hidden lg:flex hover:bg-purple-500/10 rounded-xl"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation - Premium */}
          <ScrollArea className="flex-1 px-3 py-6">
            <nav className="space-y-1.5">
              {navItems.map((item, index) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 group",
                        isActive
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                          : "text-gray-600 dark:text-gray-400 hover:bg-purple-500/10 hover:text-purple-600 dark:hover:text-purple-400"
                      )}
                    >
                      <span className={cn(
                        "transition-transform duration-200",
                        !isActive && "group-hover:scale-110"
                      )}>
                        {item.icon}
                      </span>
                      {isSidebarOpen && (
                        <span className="flex-1">{item.title}</span>
                      )}
                      {isSidebarOpen && item.badge && (
                        <Badge 
                          variant="destructive" 
                          className="h-5 min-w-5 justify-center text-[10px] font-bold animate-pulse"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </nav>
          </ScrollArea>

          {/* User Section - Premium */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/30 p-4">
            {isSidebarOpen ? (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 border border-purple-500/10">
                <UserAvatar
                  name={session?.user?.name || "User"}
                  image={session?.user?.image}
                  size="md"
                  showStatus
                  status="online"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{session?.user?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                    {session?.user?.role}
                  </p>
                </div>
              </div>
            ) : (
              <UserAvatar
                name={session?.user?.name || "User"}
                image={session?.user?.image}
                size="md"
                showStatus
                status="online"
              />
            )}
          </div>
        </div>
      </aside>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 h-screen w-80 glass-ultra border-r border-white/20 dark:border-gray-800/50 lg:hidden"
            >
              <div className="flex h-20 items-center justify-between px-5 border-b border-gray-200/50 dark:border-gray-700/30">
                <Link href="/" className="flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl gradient-morph text-white font-bold text-lg">
                      H
                    </div>
                    <div className="absolute inset-0 rounded-xl gradient-morph blur-lg opacity-50" />
                  </div>
                  <div>
                    <span className="font-bold text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      HostelHub
                    </span>
                    <span className="block text-[10px] text-muted-foreground -mt-0.5">Smart Tracking</span>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="iconSm"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="hover:bg-purple-500/10 rounded-xl"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <ScrollArea className="flex-1 px-4 py-6 h-[calc(100vh-9rem)]">
                <nav className="space-y-2">
                  {navItems.map((item, index) => {
                    const isActive = pathname === item.href;
                    return (
                      <motion.div
                        key={item.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            "flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium transition-all",
                            isActive
                              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30"
                              : "text-gray-600 dark:text-gray-400 hover:bg-purple-500/10"
                          )}
                        >
                          {item.icon}
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge variant="destructive" className="ml-auto text-[10px] animate-pulse">
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      </motion.div>
                    );
                  })}
                </nav>
              </ScrollArea>

              <div className="border-t border-gray-200/50 dark:border-gray-700/30 p-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                  <UserAvatar
                    name={session?.user?.name || "User"}
                    image={session?.user?.image}
                    size="md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate">{session?.user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{session?.user?.role}</p>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div
        className={cn(
          "min-h-screen transition-all duration-300",
          isSidebarOpen ? "lg:pl-72" : "lg:pl-20"
        )}
      >
        {/* Header - Premium */}
        <header className="sticky top-0 z-30 glass-ultra border-b border-white/20 dark:border-gray-800/50">
          <div className="flex h-20 items-center justify-between px-4 md:px-6">
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden rounded-xl hover:bg-purple-500/10"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Search - Premium */}
            <Button
              variant="outline"
              className="hidden sm:flex items-center gap-3 w-80 justify-start text-muted-foreground rounded-xl h-11 border-gray-200/50 dark:border-gray-700/50 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-4 w-4 text-purple-500" />
              <span>Search anything...</span>
              <kbd className="ml-auto pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 px-2 font-mono text-[10px] font-medium text-purple-600 dark:text-purple-400 border border-purple-500/20">
                <span className="text-[10px] font-semibold">Cmd</span>
                <span className="text-[10px] font-semibold">K</span>
              </kbd>
            </Button>

            {/* Right Side Actions - Premium */}
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="rounded-xl hover:bg-purple-500/10 group"
                >
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5 group-hover:text-amber-500 transition-colors group-hover:rotate-45 duration-300" />
                  ) : (
                    <Moon className="h-5 w-5 group-hover:text-purple-500 transition-colors group-hover:-rotate-12 duration-300" />
                  )}
                </Button>
              )}

              {/* Help */}
              <Button variant="ghost" size="icon" className="rounded-xl hidden sm:flex hover:bg-purple-500/10">
                <HelpCircle className="h-5 w-5" />
              </Button>

              {/* Notifications */}
              <NotificationsDropdown />

              {/* User Menu - Premium */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2 rounded-xl hover:bg-purple-500/10">
                    <div className="relative">
                      <UserAvatar
                        name={session?.user?.name || "User"}
                        image={session?.user?.image}
                        size="sm"
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
                    </div>
                    <ChevronDown className="h-4 w-4 hidden sm:block" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-60 glass-card-premium p-2">
                  <DropdownMenuLabel className="p-3">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={session?.user?.name || "User"}
                        image={session?.user?.image}
                        size="md"
                      />
                      <div className="flex flex-col">
                        <p className="text-sm font-semibold">{session?.user?.name}</p>
                        <p className="text-xs text-muted-foreground">{session?.user?.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer hover:bg-purple-500/10 focus:bg-purple-500/10">
                    <Link href="/profile" className="flex items-center py-2.5">
                      <User className="mr-3 h-4 w-4 text-purple-500" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-lg cursor-pointer hover:bg-purple-500/10 focus:bg-purple-500/10">
                    <Link href="/settings" className="flex items-center py-2.5">
                      <Settings className="mr-3 h-4 w-4 text-purple-500" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-200/50 dark:bg-gray-700/50" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="rounded-lg cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-500/10 focus:bg-red-500/10 py-2.5"
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* Search Modal */}
      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </div>
  );
}
