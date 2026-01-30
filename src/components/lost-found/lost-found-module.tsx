"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { useSession } from "next-auth/react";
import {
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  User,
  Eye,
  MessageSquare,
  Check,
  X,
  MoreHorizontal,
  Package,
  Briefcase,
  Smartphone,
  Key,
  Wallet,
  CreditCard,
  Book,
  Headphones,
  Watch,
  Gift,
  Edit2,
  Trash2,
  Send,
  Clock,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn, HOSTELS } from "@/lib/utils";

interface LostFoundItem {
  _id: string;
  title: string;
  description: string;
  type: "lost" | "found";
  category: string;
  location?: string;
  hostel?: string;
  images?: string[];
  status: string;
  createdAt: string;
  reportedBy?: { name?: string; avatar?: string; isVerified?: boolean };
  views?: number;
  contactInfo?: string;
}

const categoryIcons: Record<string, React.ReactNode> = {
  electronics: <Smartphone className="h-5 w-5" />,
  wallet: <Wallet className="h-5 w-5" />,
  keys: <Key className="h-5 w-5" />,
  cards: <CreditCard className="h-5 w-5" />,
  books: <Book className="h-5 w-5" />,
  accessories: <Headphones className="h-5 w-5" />,
  bags: <Briefcase className="h-5 w-5" />,
  other: <Package className="h-5 w-5" />,
};

const categories = [
  { id: "electronics", name: "Electronics", icon: Smartphone },
  { id: "wallet", name: "Wallet/Purse", icon: Wallet },
  { id: "keys", name: "Keys", icon: Key },
  { id: "cards", name: "ID/Cards", icon: CreditCard },
  { id: "books", name: "Books/Notes", icon: Book },
  { id: "accessories", name: "Accessories", icon: Headphones },
  { id: "bags", name: "Bags", icon: Briefcase },
  { id: "other", name: "Other", icon: Package },
];

export function LostFoundModule() {
  const { data: session } = useSession();
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "lost" | "found">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;

    const fetchItems = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await fetch("/api/lost-found?limit=100");
        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }
        const data = await response.json();
        if (isMounted) {
          setItems(data.items || []);
        }
      } catch {
        if (isMounted) {
          setLoadError("Failed to load items");
          setItems([]);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchItems();
    return () => {
      isMounted = false;
    };
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === "all" || item.type === activeTab;
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Lost & Found</h2>
          <p className="text-muted-foreground">
            Help reunite lost items with their owners
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Report Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Report Lost/Found Item</DialogTitle>
              <DialogDescription>
                Help others find their lost items or report what you&apos;ve found
              </DialogDescription>
            </DialogHeader>
            <CreateItemForm
              onClose={() => setIsCreateOpen(false)}
              onCreated={(item) => setItems((prev) => [item, ...prev])}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabs and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="flex-1">
          <TabsList>
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="lost" className="gap-2">
              <Search className="h-4 w-4" />
              Lost ({items.filter((i) => i.type === "lost").length})
            </TabsTrigger>
            <TabsTrigger value="found" className="gap-2">
              <Gift className="h-4 w-4" />
              Found ({items.filter((i) => i.type === "found").length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  <cat.icon className="h-4 w-4" />
                  {cat.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Items Grid */}
      <AnimatePresence mode="popLayout">
          {isLoading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Loading items...</h3>
              <p className="text-muted-foreground">Fetching the latest lost & found reports</p>
            </motion.div>
          ) : loadError ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">{loadError}</h3>
              <p className="text-muted-foreground">Please refresh to try again.</p>
            </motion.div>
          ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No items found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "No items match your search"
                : "Be the first to report a lost or found item"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface ItemCardProps {
  item: LostFoundItem;
}

function ItemCard({ item }: ItemCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const images = item.images || [];
  const reporterName = item.reportedBy?.name || "Unknown";
  const reporterInitial = reporterName ? reporterName[0] : "U";
  const reporterBadge = item.reportedBy?.isVerified ? "Verified Hosteler" : null;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card className="overflow-hidden hover:shadow-lg transition-all cursor-pointer" onClick={() => setIsDetailOpen(true)}>
          {images.length > 0 && (
            <div className="aspect-video relative overflow-hidden">
              <img
                src={images[0]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <Badge
                className={cn(
                  "absolute top-2 right-2",
                  item.type === "lost"
                    ? "bg-red-500 text-white"
                    : "bg-green-500 text-white"
                )}
              >
                {item.type === "lost" ? "Lost" : "Found"}
              </Badge>
            </div>
          )}

          <CardHeader className={cn("pb-3", !images.length && "pt-6")}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-muted shrink-0">
                  {categoryIcons[item.category]}
                </div>
                <div>
                  {!images.length && (
                    <Badge
                      className={cn(
                        "mb-2",
                        item.type === "lost"
                          ? "bg-red-500 text-white"
                          : "bg-green-500 text-white"
                      )}
                    >
                      {item.type === "lost" ? "Lost" : "Found"}
                    </Badge>
                  )}
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </div>
              </div>
              {item.status === "claimed" && (
                <Badge variant="secondary" className="gap-1">
                  <Check className="h-3 w-3" />
                  Claimed
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="pb-3">
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {item.description}
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{item.location || "Location not provided"}</span>
            </div>
          </CardContent>

          <CardFooter className="pt-3 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={item.reportedBy?.avatar || ""} />
                <AvatarFallback>{reporterInitial}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{reporterName}</span>
              {reporterBadge && (
                <Badge variant="secondary" className="text-xs">
                  {reporterBadge}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {item.views ?? 0}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
              </div>
            </div>
          </CardFooter>
        </Card>
      </motion.div>

      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                {categoryIcons[item.category]}
              </div>
              <div>
                <Badge
                  className={cn(
                    "mb-1",
                    item.type === "lost"
                      ? "bg-red-500 text-white"
                      : "bg-green-500 text-white"
                  )}
                >
                  {item.type === "lost" ? "Lost" : "Found"}
                </Badge>
                <DialogTitle>{item.title}</DialogTitle>
              </div>
            </div>
          </DialogHeader>

          {images.length > 0 && (
            <div className="aspect-video rounded-lg overflow-hidden">
              <img
                src={images[0]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="space-y-4">
            <p className="text-muted-foreground">{item.description}</p>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{item.location || "Location not provided"}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {item.type === "lost" ? "Lost" : "Found"}{" "}
                  {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted space-y-2">
              <p className="text-sm font-medium">Contact Information</p>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={item.reportedBy?.avatar || ""} />
                  <AvatarFallback>{reporterInitial}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{reporterName}</p>
                    {reporterBadge && (
                      <Badge variant="secondary" className="text-xs">
                        {reporterBadge}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {item.contactInfo || "Contact via hostel office"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
            {item.status === "open" && (
              <Button>
                <MessageSquare className="mr-2 h-4 w-4" />
                Contact Reporter
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface CreateItemFormProps {
  onClose: () => void;
  onCreated: (item: LostFoundItem) => void;
}

function CreateItemForm({ onClose, onCreated }: CreateItemFormProps) {
  const { data: session } = useSession();
  const [type, setType] = useState<"lost" | "found">("lost");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title || !description || !category || !location) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/lost-found", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title,
          description,
          category,
          location,
          hostel: session?.user?.hostel,
          contactInfo: contactPhone,
          images: [],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create item");
      }

      const created = await response.json();
      onCreated(created);
      onClose();
      setTitle("");
      setDescription("");
      setCategory("");
      setLocation("");
      setContactPhone("");
      setType("lost");
    } catch {
      // noop
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Type Selection */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => setType("lost")}
          className={cn(
            "p-4 rounded-xl border-2 text-center transition-all",
            type === "lost"
              ? "border-red-500 bg-red-50 dark:bg-red-900/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
          )}
        >
          <Search className={cn("h-8 w-8 mx-auto mb-2", type === "lost" ? "text-red-500" : "text-muted-foreground")} />
          <p className="font-medium">I Lost Something</p>
          <p className="text-xs text-muted-foreground mt-1">Report a lost item</p>
        </button>

        <button
          type="button"
          onClick={() => setType("found")}
          className={cn(
            "p-4 rounded-xl border-2 text-center transition-all",
            type === "found"
              ? "border-green-500 bg-green-50 dark:bg-green-900/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
          )}
        >
          <Gift className={cn("h-8 w-8 mx-auto mb-2", type === "found" ? "text-green-500" : "text-muted-foreground")} />
          <p className="font-medium">I Found Something</p>
          <p className="text-xs text-muted-foreground mt-1">Report a found item</p>
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Item Name</Label>
          <Input
            id="title"
            placeholder="e.g., Blue iPhone 14, Black Leather Wallet"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the item in detail (color, brand, distinguishing features)"
            className="min-h-[100px]"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <cat.icon className="h-4 w-4" />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Where was it lost/found?"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Contact Phone</Label>
          <Input
            id="phone"
            placeholder="+91 XXXXX XXXXX"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!title || !description || !category || !location || isSubmitting}
          className={type === "lost" ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"}
        >
          <Send className="mr-2 h-4 w-4" />
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </Button>
      </DialogFooter>
    </div>
  );
}
