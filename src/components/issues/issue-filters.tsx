"use client";

import { useState } from "react";
import {
  Filter,
  SortAsc,
  X,
  Droplets,
  Zap,
  Sparkles,
  Wifi,
  Armchair,
  Building2,
  Shield,
  Thermometer,
  Bug,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, ISSUE_CATEGORIES, PRIORITY_LEVELS, STATUS_LABELS, HOSTELS } from "@/lib/utils";

export interface FilterState {
  categories: string[];
  priorities: string[];
  statuses: string[];
  hostels: string[];
  sortBy: string;
  sortOrder: "asc" | "desc";
}

interface IssueFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
}

const categoryIcons: Record<string, React.ReactNode> = {
  plumbing: <Droplets className="h-4 w-4" />,
  electrical: <Zap className="h-4 w-4" />,
  cleanliness: <Sparkles className="h-4 w-4" />,
  internet: <Wifi className="h-4 w-4" />,
  furniture: <Armchair className="h-4 w-4" />,
  structural: <Building2 className="h-4 w-4" />,
  security: <Shield className="h-4 w-4" />,
  ac_heating: <Thermometer className="h-4 w-4" />,
  pest_control: <Bug className="h-4 w-4" />,
  other: <MoreHorizontal className="h-4 w-4" />,
};

const sortOptions = [
  { id: "createdAt", label: "Date Created" },
  { id: "updatedAt", label: "Last Updated" },
  { id: "upvotes", label: "Most Upvoted" },
  { id: "priority", label: "Priority" },
  { id: "views", label: "Most Viewed" },
];

export function IssueFilters({ filters, onChange, onClear }: IssueFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount =
    filters.categories.length +
    filters.priorities.length +
    filters.statuses.length +
    filters.hostels.length;

  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onChange({ ...filters, categories: newCategories });
  };

  const togglePriority = (priority: string) => {
    const newPriorities = filters.priorities.includes(priority)
      ? filters.priorities.filter((p) => p !== priority)
      : [...filters.priorities, priority];
    onChange({ ...filters, priorities: newPriorities });
  };

  const toggleStatus = (status: string) => {
    const newStatuses = filters.statuses.includes(status)
      ? filters.statuses.filter((s) => s !== status)
      : [...filters.statuses, status];
    onChange({ ...filters, statuses: newStatuses });
  };

  const toggleHostel = (hostel: string) => {
    const newHostels = filters.hostels.includes(hostel)
      ? filters.hostels.filter((h) => h !== hostel)
      : [...filters.hostels, hostel];
    onChange({ ...filters, hostels: newHostels });
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      {/* Filter Popover */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <ScrollArea className="h-[400px]">
            <div className="p-4 space-y-6">
              {/* Category Filter */}
              <div>
                <h4 className="font-medium mb-3">Category</h4>
                <div className="grid grid-cols-2 gap-2">
                  {ISSUE_CATEGORIES.map((category) => (
                    <div
                      key={category.id}
                      className={cn(
                        "flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors",
                        filters.categories.includes(category.id)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      )}
                      onClick={() => toggleCategory(category.id)}
                    >
                      <Checkbox
                        checked={filters.categories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <span style={{ color: category.color }}>
                        {categoryIcons[category.id]}
                      </span>
                      <span className="text-sm truncate">{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Priority Filter */}
              <div>
                <h4 className="font-medium mb-3">Priority</h4>
                <div className="space-y-2">
                  {PRIORITY_LEVELS.map((priority) => (
                    <div
                      key={priority.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors",
                        filters.priorities.includes(priority.id)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      )}
                      onClick={() => togglePriority(priority.id)}
                    >
                      <Checkbox
                        checked={filters.priorities.includes(priority.id)}
                        onCheckedChange={() => togglePriority(priority.id)}
                      />
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: priority.color }}
                      />
                      <span className="text-sm">{priority.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Status Filter */}
              <div>
                <h4 className="font-medium mb-3">Status</h4>
                <div className="space-y-2">
                  {STATUS_LABELS.map((status) => (
                    <div
                      key={status.id}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors",
                        filters.statuses.includes(status.id)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      )}
                      onClick={() => toggleStatus(status.id)}
                    >
                      <Checkbox
                        checked={filters.statuses.includes(status.id)}
                        onCheckedChange={() => toggleStatus(status.id)}
                      />
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: status.color }}
                      />
                      <span className="text-sm">{status.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Hostel Filter */}
              <div>
                <h4 className="font-medium mb-3">Hostel</h4>
                <div className="space-y-2">
                  {HOSTELS.map((hostel) => (
                    <div
                      key={hostel}
                      className={cn(
                        "flex items-center gap-3 p-2 rounded-lg border cursor-pointer transition-colors",
                        filters.hostels.includes(hostel)
                          ? "border-primary bg-primary/5"
                          : "hover:bg-muted"
                      )}
                      onClick={() => toggleHostel(hostel)}
                    >
                      <Checkbox
                        checked={filters.hostels.includes(hostel)}
                        onCheckedChange={() => toggleHostel(hostel)}
                      />
                      <span className="text-sm">{hostel}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>

          <div className="p-4 border-t flex justify-between">
            <Button variant="ghost" size="sm" onClick={onClear}>
              Clear all
            </Button>
            <Button size="sm" onClick={() => setIsOpen(false)}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      {/* Sort Select */}
      <Select
        value={filters.sortBy}
        onValueChange={(value) => onChange({ ...filters, sortBy: value })}
      >
        <SelectTrigger className="w-[180px]">
          <SortAsc className="h-4 w-4 mr-2" />
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sort Order Toggle */}
      <Button
        variant="outline"
        size="icon"
        onClick={() =>
          onChange({
            ...filters,
            sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
          })
        }
      >
        <SortAsc
          className={cn(
            "h-4 w-4 transition-transform",
            filters.sortOrder === "desc" && "rotate-180"
          )}
        />
      </Button>

      {/* Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <Separator orientation="vertical" className="h-6" />
          
          {filters.categories.map((cat) => {
            const category = ISSUE_CATEGORIES.find((c) => c.id === cat);
            return (
              <Badge
                key={cat}
                variant="secondary"
                className="gap-1.5 px-2 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => toggleCategory(cat)}
              >
                <span style={{ color: category?.color }}>{categoryIcons[cat]}</span>
                {category?.name}
                <X className="h-3 w-3" />
              </Badge>
            );
          })}

          {filters.priorities.map((pri) => {
            const priority = PRIORITY_LEVELS.find((p) => p.id === pri);
            return (
              <Badge
                key={pri}
                variant="secondary"
                className="gap-1.5 px-2 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => togglePriority(pri)}
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: priority?.color }}
                />
                {priority?.name}
                <X className="h-3 w-3" />
              </Badge>
            );
          })}

          {filters.statuses.map((stat) => {
            const status = STATUS_LABELS.find((s) => s.id === stat);
            return (
              <Badge
                key={stat}
                variant="secondary"
                className="gap-1.5 px-2 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => toggleStatus(stat)}
              >
                <div
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: status?.color }}
                />
                {status?.name}
                <X className="h-3 w-3" />
              </Badge>
            );
          })}

          {filters.hostels.map((hostel) => (
            <Badge
              key={hostel}
              variant="secondary"
              className="gap-1.5 px-2 cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => toggleHostel(hostel)}
            >
              {hostel}
              <X className="h-3 w-3" />
            </Badge>
          ))}

          <Button variant="ghost" size="sm" onClick={onClear} className="text-xs">
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
