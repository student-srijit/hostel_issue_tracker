"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useDropzone } from "react-dropzone";
import {
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
  ArrowRight,
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  Video,
  Mic,
  MicOff,
  Play,
  Pause,
  Loader2,
  Eye,
  EyeOff,
  Info,
  Lightbulb,
  Check,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, ISSUE_CATEGORIES, PRIORITY_LEVELS, HOSTELS, FLOORS, formatFileSize } from "@/lib/utils";

const issueSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(200),
  description: z.string().min(20, "Description must be at least 20 characters").max(5000),
  category: z.string().min(1, "Please select a category"),
  priority: z.enum(["low", "medium", "high", "emergency"]),
  hostel: z.string().min(1, "Please select a hostel"),
  block: z.string().min(1, "Please enter your block"),
  floor: z.string().min(1, "Please select a floor"),
  room: z.string().min(1, "Please enter your room number"),
  isPublic: z.boolean(),
});

type IssueFormData = z.infer<typeof issueSchema>;

const steps = [
  { id: 1, title: "Category", description: "What type of issue?" },
  { id: 2, title: "Priority", description: "How urgent is it?" },
  { id: 3, title: "Details", description: "Describe the issue" },
  { id: 4, title: "Review", description: "Confirm & submit" },
];

const categoryIcons: Record<string, React.ReactNode> = {
  plumbing: <Droplets className="h-8 w-8" />,
  electrical: <Zap className="h-8 w-8" />,
  cleanliness: <Sparkles className="h-8 w-8" />,
  internet: <Wifi className="h-8 w-8" />,
  furniture: <Armchair className="h-8 w-8" />,
  structural: <Building2 className="h-8 w-8" />,
  security: <Shield className="h-8 w-8" />,
  ac_heating: <Thermometer className="h-8 w-8" />,
  pest_control: <Bug className="h-8 w-8" />,
  other: <MoreHorizontal className="h-8 w-8" />,
};

export function IssueReportForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [aiPrediction, setAiPrediction] = useState<{ category: string; confidence: number } | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<IssueFormData>({
    resolver: zodResolver(issueSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "medium",
      hostel: session?.user?.hostel || "",
      block: session?.user?.block || "",
      floor: session?.user?.floor || "",
      room: session?.user?.room || "",
      isPublic: true,
    },
  });

  // Auto-fill location from user profile
  useEffect(() => {
    if (session?.user) {
      if (session.user.hostel) setValue("hostel", session.user.hostel);
      if (session.user.block) setValue("block", session.user.block);
      if (session.user.floor) setValue("floor", session.user.floor);
      if (session.user.room) setValue("room", session.user.room);
    }
  }, [session, setValue]);

  useEffect(() => {
    if (!searchParams) return;
    const hostel = searchParams.get("hostel");
    const block = searchParams.get("block");
    const floor = searchParams.get("floor");
    const room = searchParams.get("room");

    if (hostel) setValue("hostel", hostel);
    if (block) setValue("block", block);
    if (floor) setValue("floor", floor);
    if (room) setValue("room", room);
  }, [searchParams, setValue]);

  const selectedCategory = watch("category");
  const selectedPriority = watch("priority");
  const description = watch("description");
  const isPublic = watch("isPublic");

  // Image dropzone
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.filter(
      (file) => file.type.startsWith("image/") || file.type.startsWith("video/")
    );
    
    if (images.length + newImages.length > 5) {
      toast.error("Maximum 5 files allowed");
      return;
    }

    setImages((prev) => [...prev, ...newImages]);
    
    // Create previews
    newImages.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, [images.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "video/*": [".mp4", ".webm"],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  // AI Category Prediction (Groq-backed)
  useEffect(() => {
    if (!description || description.length < 30) {
      setAiPrediction(null);
      return;
    }

    let active = true;
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch("/api/ai/predict", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ description, action: "predict" }),
        });

        if (!response.ok) {
          throw new Error("Prediction failed");
        }

        const data = await response.json();
        if (active) {
          if (data?.category) {
            setAiPrediction({ category: data.category, confidence: data.confidence ?? 0.7 });
          } else {
            setAiPrediction(null);
          }
        }
      } catch {
        if (active) setAiPrediction(null);
      }
    }, 400);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [description]);

  const nextStep = async () => {
    let isValid = false;

    if (step === 1) {
      isValid = await trigger(["category"]);
    } else if (step === 2) {
      isValid = await trigger(["priority"]);
    } else if (step === 3) {
      isValid = await trigger(["title", "description", "hostel", "block", "floor", "room"]);
    }

    if (isValid) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: IssueFormData) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      
      images.forEach((image) => {
        formData.append("files", image);
      });

      const response = await fetch("/api/issues", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create issue");
      }

      const result = await response.json();
      toast.success("Issue reported successfully!");
      router.push(`/issues/${result.id}`);
    } catch (error) {
      toast.error("Failed to report issue. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (step / steps.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Report an Issue</h1>
        <p className="text-muted-foreground mt-1">
          Help us maintain a better hostel experience
        </p>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((s, index) => (
            <div
              key={s.id}
              className={cn(
                "flex items-center",
                index < steps.length - 1 && "flex-1"
              )}
            >
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all",
                    step > s.id
                      ? "bg-primary border-primary text-primary-foreground"
                      : step === s.id
                      ? "border-primary text-primary"
                      : "border-gray-300 dark:border-gray-600 text-muted-foreground"
                  )}
                >
                  {step > s.id ? <Check className="h-5 w-5" /> : s.id}
                </div>
                <div className="mt-2 text-center hidden sm:block">
                  <p className={cn("text-sm font-medium", step === s.id && "text-primary")}>
                    {s.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{s.description}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-4 transition-colors",
                    step > s.id ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Form Steps */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            <AnimatePresence mode="wait">
              {/* Step 1: Category Selection */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold mb-2">What type of issue are you facing?</h2>
                    <p className="text-muted-foreground">Select the category that best describes your issue</p>
                  </div>

                  {/* AI Suggestion */}
                  {aiPrediction && (
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-700 dark:text-blue-400">
                            AI Suggestion
                          </p>
                          <p className="text-sm text-blue-600 dark:text-blue-300">
                            Based on your description, this looks like a{" "}
                            <span className="font-medium capitalize">
                              {aiPrediction.category.replace("_", " ")}
                            </span>{" "}
                            issue ({Math.round(aiPrediction.confidence * 100)}% confidence)
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => setValue("category", aiPrediction.category)}
                          >
                            Accept Suggestion
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {ISSUE_CATEGORIES.map((category) => (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => setValue("category", category.id)}
                        className={cn(
                          "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all hover:shadow-md",
                          selectedCategory === category.id
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                      >
                        <div
                          className="p-3 rounded-xl"
                          style={{ backgroundColor: `${category.color}20` }}
                        >
                          <span style={{ color: category.color }}>
                            {categoryIcons[category.id]}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-center">
                          {category.name}
                        </span>
                      </button>
                    ))}
                  </div>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category.message}</p>
                  )}
                </motion.div>
              )}

              {/* Step 2: Priority Selection */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold mb-2">How urgent is this issue?</h2>
                    <p className="text-muted-foreground">This helps us prioritize and respond appropriately</p>
                  </div>

                  <div className="grid gap-4">
                    {PRIORITY_LEVELS.map((priority) => (
                      <button
                        key={priority.id}
                        type="button"
                        onClick={() => setValue("priority", priority.id as "low" | "medium" | "high" | "emergency")}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                          selectedPriority === priority.id
                            ? "border-current shadow-md"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                        style={{
                          borderColor: selectedPriority === priority.id ? priority.color : undefined,
                          backgroundColor: selectedPriority === priority.id ? `${priority.color}10` : undefined,
                        }}
                      >
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: priority.color }}
                        />
                        <div className="flex-1">
                          <p className="font-medium">{priority.name}</p>
                          <p className="text-sm text-muted-foreground">{priority.description}</p>
                        </div>
                        <div
                          className={cn(
                            "h-6 w-6 rounded-full border-2 flex items-center justify-center",
                            selectedPriority === priority.id
                              ? "border-current"
                              : "border-gray-300 dark:border-gray-600"
                          )}
                          style={{
                            borderColor: selectedPriority === priority.id ? priority.color : undefined,
                          }}
                        >
                          {selectedPriority === priority.id && (
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: priority.color }}
                            />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Step 3: Details */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Describe the issue</h2>
                    <p className="text-muted-foreground">Provide details to help us understand and resolve your issue</p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Issue Title</Label>
                      <Input
                        id="title"
                        placeholder="Brief summary of the issue"
                        error={!!errors.title}
                        {...register("title")}
                      />
                      {errors.title && (
                        <p className="text-sm text-destructive">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Detailed Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe the issue in detail. Include when it started, what you've noticed, etc."
                        className="min-h-[150px]"
                        showCount
                        maxCount={5000}
                        error={!!errors.description}
                        {...register("description")}
                      />
                      {errors.description && (
                        <p className="text-sm text-destructive">{errors.description.message}</p>
                      )}
                    </div>

                    {/* Image/Video Upload */}
                    <div className="space-y-2">
                      <Label>Attachments (Optional)</Label>
                      <div
                        {...getRootProps()}
                        className={cn(
                          "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
                          isDragActive
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                      >
                        <input {...getInputProps()} />
                        <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-sm text-muted-foreground">
                          {isDragActive ? (
                            "Drop the files here..."
                          ) : (
                            <>
                              Drag & drop images/videos here, or{" "}
                              <span className="text-primary font-medium">click to browse</span>
                            </>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Max 5 files, 10MB each (PNG, JPG, MP4)
                        </p>
                      </div>

                      {/* Image Previews */}
                      {imagePreview.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-4">
                          {imagePreview.map((preview, index) => (
                            <div key={index} className="relative group">
                              <img
                                src={preview}
                                alt={`Preview ${index + 1}`}
                                className="h-24 w-24 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute -top-2 -right-2 h-6 w-6 bg-destructive text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-4 w-4" />
                              </button>
                              <span className="absolute bottom-1 right-1 text-xs bg-black/60 text-white px-1 rounded">
                                {formatFileSize(images[index]?.size || 0)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Hostel</Label>
                        <Select
                          onValueChange={(value) => setValue("hostel", value)}
                          defaultValue={watch("hostel")}
                        >
                          <SelectTrigger error={!!errors.hostel}>
                            <SelectValue placeholder="Select hostel" />
                          </SelectTrigger>
                          <SelectContent>
                            {HOSTELS.map((hostel) => (
                              <SelectItem key={hostel} value={hostel}>
                                {hostel}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="block">Block</Label>
                        <Input
                          id="block"
                          placeholder="A"
                          error={!!errors.block}
                          {...register("block")}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Floor</Label>
                        <Select
                          onValueChange={(value) => setValue("floor", value)}
                          defaultValue={watch("floor")}
                        >
                          <SelectTrigger error={!!errors.floor}>
                            <SelectValue placeholder="Select floor" />
                          </SelectTrigger>
                          <SelectContent>
                            {FLOORS.map((floor) => (
                              <SelectItem key={floor} value={floor}>
                                {floor} Floor
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="room">Room Number</Label>
                        <Input
                          id="room"
                          placeholder="101"
                          error={!!errors.room}
                          {...register("room")}
                        />
                      </div>
                    </div>

                    {/* Visibility Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        {isPublic ? (
                          <Eye className="h-5 w-5 text-blue-500" />
                        ) : (
                          <EyeOff className="h-5 w-5 text-gray-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {isPublic ? "Public Issue" : "Private Issue"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {isPublic
                              ? "Other students can see and upvote this issue"
                              : "Only staff and you can see this issue"}
                          </p>
                        </div>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={isPublic}
                                onCheckedChange={(checked) => setValue("isPublic", checked)}
                              />
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Public issues help identify common problems and get resolved faster through community upvotes.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Review */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Review your report</h2>
                    <p className="text-muted-foreground">Please verify all details before submitting</p>
                  </div>

                  <div className="space-y-4">
                    {/* Summary Card */}
                    <div className="p-6 rounded-xl bg-muted/30 space-y-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge
                            variant={selectedPriority as "low" | "medium" | "high" | "emergency"}
                            className="mb-2"
                          >
                            {selectedPriority}
                          </Badge>
                          <h3 className="text-lg font-semibold">{watch("title") || "Untitled Issue"}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          {categoryIcons[selectedCategory]}
                          <span className="text-sm font-medium capitalize">
                            {selectedCategory?.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      <p className="text-muted-foreground">{watch("description")}</p>

                      {imagePreview.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {imagePreview.map((preview, index) => (
                            <img
                              key={index}
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="h-16 w-16 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                        <div>
                          <p className="text-xs text-muted-foreground">Hostel</p>
                          <p className="font-medium">{watch("hostel")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Block</p>
                          <p className="font-medium">{watch("block")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Floor</p>
                          <p className="font-medium">{watch("floor")}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Room</p>
                          <p className="font-medium">{watch("room")}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-4 border-t">
                        {isPublic ? (
                          <Eye className="h-4 w-4 text-blue-500" />
                        ) : (
                          <EyeOff className="h-4 w-4 text-gray-500" />
                        )}
                        <span className="text-sm">
                          This issue will be{" "}
                          <span className="font-medium">{isPublic ? "public" : "private"}</span>
                        </span>
                      </div>
                    </div>

                    {/* Tips */}
                    <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-start gap-3">
                        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
                        <div className="text-sm text-blue-700 dark:text-blue-300">
                          <p className="font-medium">What happens next?</p>
                          <ul className="mt-2 space-y-1 list-disc list-inside">
                            <li>Your issue will be reviewed by the hostel management</li>
                            <li>A maintenance staff will be assigned based on the category</li>
                            <li>You&apos;ll receive notifications on status updates</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8 pt-6 border-t">
              {step > 1 && (
                <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              )}

              {step < 4 ? (
                <Button type="button" onClick={nextStep} className="flex-1">
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      Submit Report
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
