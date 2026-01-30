"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Building2,
  Layers,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  ChevronUp,
  ChevronDown,
  Wrench,
  Droplets,
  Zap,
  Wind,
  Shield,
  Bug,
  Wifi,
  Trash2,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn, HOSTELS, FLOORS, ISSUE_CATEGORIES, STATUS_LABELS } from "@/lib/utils";

const categoryIcons: Record<string, any> = {
  plumbing: Droplets,
  electrical: Zap,
  furniture: Wrench,
  cleanliness: Trash2,
  pest_control: Bug,
  security: Shield,
  internet: Wifi,
  ac_heating: Wind,
  other: AlertCircle,
};

interface FloorData {
  total: number;
  critical: number;
  high: number;
  pending: number;
}

function HeatmapCell({ data, onClick }: { data: FloorData; onClick: () => void }) {
  const intensity = useMemo(() => {
    if (data.critical >= 2) return "critical";
    if (data.critical >= 1 || data.high >= 2) return "high";
    if (data.high >= 1 || data.total >= 3) return "medium";
    if (data.total >= 1) return "low";
    return "none";
  }, [data]);

  const colors = {
    critical: "bg-red-500 hover:bg-red-600",
    high: "bg-orange-500 hover:bg-orange-600",
    medium: "bg-yellow-500 hover:bg-yellow-600",
    low: "bg-green-500 hover:bg-green-600",
    none: "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            className={cn(
              "w-full h-16 rounded-lg transition-colors flex items-center justify-center",
              colors[intensity],
              intensity !== "none" && "text-white"
            )}
          >
            <span className="font-bold text-lg">{data.total}</span>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="top" className="p-3">
          <div className="space-y-1">
            <p className="font-medium">Total Issues: {data.total}</p>
            <div className="text-xs space-y-0.5">
              <p className="text-red-400">Critical: {data.critical}</p>
              <p className="text-orange-400">High: {data.high}</p>
              <p className="text-yellow-400">Pending: {data.pending}</p>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function BuildingView({ hostel, block, data }: { 
  hostel: string; 
  block: string; 
  data: Record<string, FloorData> 
}) {
  const floors = ["3rd", "2nd", "1st", "Ground"];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Block {block}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {floors.map((floor) => (
            <div key={floor} className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground w-16">{floor}</span>
              <div className="flex-1">
                <HeatmapCell
                  data={data[floor] || { total: 0, critical: 0, high: 0, pending: 0 }}
                  onClick={() => console.log(`View ${hostel} Block ${block} ${floor} Floor`)}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function HostelOverview({ hostel, data }: { 
  hostel: string; 
  data: Record<string, Record<string, FloorData>> 
}) {
  const stats = useMemo(() => {
    let total = 0, critical = 0, high = 0, pending = 0;
    Object.values(data).forEach((block) => {
      Object.values(block).forEach((floor) => {
        total += floor.total;
        critical += floor.critical;
        high += floor.high;
        pending += floor.pending;
      });
    });
    return { total, critical, high, pending };
  }, [data]);

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Total Issues</div>
        </Card>
        <Card className="p-4 text-center border-red-200 bg-red-50 dark:bg-red-950/20">
          <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          <div className="text-xs text-red-600">Critical</div>
        </Card>
        <Card className="p-4 text-center border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
          <div className="text-xs text-orange-600">High Priority</div>
        </Card>
        <Card className="p-4 text-center border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-xs text-yellow-600">Pending</div>
        </Card>
      </div>

      {/* Building Views */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(data).map(([block, floorData]) => (
          <BuildingView
            key={block}
            hostel={hostel}
            block={block}
            data={floorData}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryHeatmap({ issues }: { issues: any[] }) {
  const categories = ISSUE_CATEGORIES.map((c) => c.id);
  
  const categoryData = useMemo(() => {
    const map: Record<string, { total: number; resolved: number; pending: number }> = {};
    issues.forEach((issue: any) => {
      const category = issue.category || "other";
      if (!map[category]) map[category] = { total: 0, resolved: 0, pending: 0 };
      map[category].total += 1;
      if (issue.status === "resolved") map[category].resolved += 1;
      if (["reported", "assigned", "in_progress"].includes(issue.status)) map[category].pending += 1;
    });
    return map;
  }, [issues]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {categories.map((category) => {
        const Icon = categoryIcons[category] || AlertCircle;
        const data = categoryData[category] || { total: 0, resolved: 0, pending: 0 };
        const resolveRate = data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 0;

        return (
          <Card key={category} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    resolveRate >= 80 ? "bg-green-100 text-green-600" :
                    resolveRate >= 60 ? "bg-yellow-100 text-yellow-600" :
                    "bg-red-100 text-red-600"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium capitalize">
                      {category.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {data.total} total issues
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-lg font-bold",
                    resolveRate >= 80 ? "text-green-600" :
                    resolveRate >= 60 ? "text-yellow-600" :
                    "text-red-600"
                  )}>
                    {resolveRate}%
                  </p>
                  <p className="text-xs text-muted-foreground">resolved</p>
                </div>
              </div>
              
              {/* Progress bar */}
              <div className="mt-3 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={cn(
                    "h-full transition-all",
                    resolveRate >= 80 ? "bg-green-500" :
                    resolveRate >= 60 ? "bg-yellow-500" :
                    "bg-red-500"
                  )}
                  style={{ width: `${resolveRate}%` }}
                />
              </div>

              <div className="mt-3 flex justify-between text-xs">
                <span className="text-green-600">{data.resolved} resolved</span>
                <span className="text-orange-600">{data.pending} pending</span>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function TimelineHeatmap() {
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  // Generate random-ish data for visualization
  const data = days.map((day) =>
    hours.map((hour) => {
      // More issues during morning and evening hours
      const baseIntensity = (hour >= 8 && hour <= 10) || (hour >= 18 && hour <= 21) ? 0.6 : 0.2;
      return Math.floor(Math.random() * 5 * baseIntensity);
    })
  );

  const getColor = (value: number) => {
    if (value === 0) return "bg-gray-100 dark:bg-gray-800";
    if (value === 1) return "bg-green-200 dark:bg-green-900";
    if (value === 2) return "bg-yellow-300 dark:bg-yellow-800";
    if (value === 3) return "bg-orange-400 dark:bg-orange-700";
    return "bg-red-500 dark:bg-red-600";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Issue Reporting Timeline</CardTitle>
        <CardDescription>When issues are most commonly reported</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="min-w-[600px]">
            {/* Hours header */}
            <div className="flex mb-2">
              <div className="w-12" />
              {hours.filter((h) => h % 3 === 0).map((hour) => (
                <div key={hour} className="flex-1 text-xs text-muted-foreground text-center">
                  {hour}:00
                </div>
              ))}
            </div>

            {/* Grid */}
            {days.map((day, dayIndex) => (
              <div key={day} className="flex items-center gap-1 mb-1">
                <div className="w-12 text-xs text-muted-foreground">{day}</div>
                {hours.map((hour) => (
                  <TooltipProvider key={hour}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={cn(
                            "flex-1 h-4 rounded-sm transition-colors cursor-pointer hover:ring-2 ring-primary/50",
                            getColor(data[dayIndex][hour])
                          )}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{day} at {hour}:00 - {data[dayIndex][hour]} issues</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>
            ))}

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
              <span>Less</span>
              {[0, 1, 2, 3, 4].map((value) => (
                <div
                  key={value}
                  className={cn("w-4 h-4 rounded-sm", getColor(value))}
                />
              ))}
              <span>More</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function HostelMapPage() {
  const [selectedHostel, setSelectedHostel] = useState<string>(HOSTELS[0]);
  const [viewType, setViewType] = useState<"building" | "category" | "timeline">("building");
  const [issues, setIssues] = useState<any[]>([]);
  const [issueData, setIssueData] = useState<Record<string, Record<string, Record<string, FloorData>>>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchIssues = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await fetch("/api/issues?limit=500&sortBy=createdAt&sortOrder=desc");
        if (!response.ok) {
          throw new Error("Failed to fetch issues");
        }
        const data = await response.json();
        const issueList = data.issues || [];

        const map: Record<string, Record<string, Record<string, FloorData>>> = {};
        issueList.forEach((issue: any) => {
          const hostel = issue.hostel || "Unknown";
          const block = issue.block || "Unknown";
          const floor = issue.floor || "Unknown";

          if (!map[hostel]) map[hostel] = {};
          if (!map[hostel][block]) map[hostel][block] = {};
          if (!map[hostel][block][floor]) {
            map[hostel][block][floor] = { total: 0, critical: 0, high: 0, pending: 0 };
          }

          const cell = map[hostel][block][floor];
          cell.total += 1;
          if (issue.priority === "emergency") cell.critical += 1;
          if (issue.priority === "high") cell.high += 1;
          if (["reported", "assigned", "in_progress"].includes(issue.status)) cell.pending += 1;
        });

        if (isMounted) {
          setIssues(issueList);
          setIssueData(map);
        }
      } catch (error) {
        if (isMounted) {
          setIssues([]);
          setIssueData({});
          setLoadError("Failed to load issue data");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchIssues();
    return () => {
      isMounted = false;
    };
  }, []);

  const hostelData = issueData[selectedHostel] || {};

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MapPin className="h-8 w-8 text-primary" />
              Hostel Map
            </h1>
            <p className="text-muted-foreground">
              Visual overview of issues across hostel locations
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Select value={selectedHostel} onValueChange={setSelectedHostel}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {HOSTELS.map((hostel) => (
                  <SelectItem key={hostel} value={hostel}>{hostel}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading && (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              Loading hostel map data...
            </CardContent>
          </Card>
        )}

        {loadError && !isLoading && (
          <Card>
            <CardContent className="py-6 text-center text-sm text-red-500">
              {loadError}
            </CardContent>
          </Card>
        )}

        {/* View Toggle */}
        <Tabs value={viewType} onValueChange={(v) => setViewType(v as any)}>
          <TabsList>
            <TabsTrigger value="building" className="gap-2">
              <Building2 className="h-4 w-4" />
              Building View
            </TabsTrigger>
            <TabsTrigger value="category" className="gap-2">
              <Layers className="h-4 w-4" />
              Category View
            </TabsTrigger>
            <TabsTrigger value="timeline" className="gap-2">
              <Clock className="h-4 w-4" />
              Timeline View
            </TabsTrigger>
          </TabsList>

          <TabsContent value="building" className="mt-6">
            <HostelOverview hostel={selectedHostel} data={hostelData} />
          </TabsContent>

          <TabsContent value="category" className="mt-6">
            <CategoryHeatmap issues={issues} />
          </TabsContent>

          <TabsContent value="timeline" className="mt-6">
            <TimelineHeatmap />
          </TabsContent>
        </Tabs>

        {/* Legend */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Legend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-red-500" />
                <span className="text-sm">Critical (≥2 critical issues)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-orange-500" />
                <span className="text-sm">High (1 critical or ≥2 high)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-yellow-500" />
                <span className="text-sm">Medium (1 high or ≥3 total)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-500" />
                <span className="text-sm">Low (1-2 issues)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700" />
                <span className="text-sm">No issues</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
