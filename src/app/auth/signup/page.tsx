"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Building2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Phone,
  Home,
  GraduationCap,
  Wrench,
  Briefcase,
  CheckCircle,
  Shield,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HOSTELS, FLOORS } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { filterColleges } from "@/lib/colleges";

const signupSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    role: z.enum(["student", "management", "maintenance"]),
    studentId: z.string().optional(),
    college: z.string().min(2, "Please select your college"),
    hostel: z.string().min(1, "Please select a hostel"),
    block: z.string().min(1, "Please enter your block"),
    floor: z.string().min(1, "Please select a floor"),
    room: z.string().min(1, "Please enter your room number"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

const steps = [
  { id: 1, title: "Account Details", description: "Your basic information", icon: User },
  { id: 2, title: "Select Role", description: "Choose your access level", icon: Shield },
  { id: 3, title: "Location Info", description: "Your hostel details", icon: Building2 },
];

const roles = [
  {
    id: "student",
    title: "Student",
    description: "Report issues and track resolutions",
    icon: GraduationCap,
    color: "from-blue-500 to-cyan-500",
    features: ["Report maintenance issues", "Track issue status", "View announcements"],
  },
  {
    id: "maintenance",
    title: "Maintenance Staff",
    description: "Resolve assigned maintenance tasks",
    icon: Wrench,
    color: "from-orange-500 to-amber-500",
    features: ["View assigned issues", "Update issue status", "Performance tracking"],
  },
  {
    id: "management",
    title: "Management",
    description: "Full administrative access",
    icon: Briefcase,
    color: "from-purple-500 to-pink-500",
    features: ["Dashboard analytics", "Assign staff", "Manage all users"],
  },
];

// Animated grid background
function GridPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-30">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "student",
      studentId: "",
      college: "",
      hostel: "",
      block: "",
      floor: "",
      room: "",
    },
  });

  const selectedRole = watch("role");
  const collegeValue = watch("college");
  const [collegeOptions, setCollegeOptions] = useState<string[]>([]);
  const [collegeLoading, setCollegeLoading] = useState(false);
  const [collegeOpen, setCollegeOpen] = useState(false);

  const nextStep = async () => {
    let isValid = false;

    if (step === 1) {
      isValid = await trigger(["name", "email", "password", "confirmPassword", "college"]);
    } else if (step === 2) {
      isValid = await trigger(["role"]);
    }

    if (isValid) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create account");
      }

      toast.success("Account created successfully!");
      router.push("/auth/login?signup=success");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const progress = (step / steps.length) * 100;

  useEffect(() => {
    const query = collegeValue?.trim();
    if (!query || query.length < 2) {
      setCollegeOptions([]);
      return;
    }

    let isActive = true;
    const timeout = setTimeout(async () => {
      setCollegeLoading(true);
      try {
        const response = await fetch(`/api/colleges/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        if (isActive) {
          const results = Array.isArray(data?.results) ? data.results : [];
          setCollegeOptions(results.length ? results : filterColleges(query));
        }
      } catch {
        if (isActive) {
          setCollegeOptions(filterColleges(query));
        }
      } finally {
        if (isActive) setCollegeLoading(false);
      }
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [collegeValue]);

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Premium Decorative Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-0 gradient-morph opacity-50" />
        <div className="absolute inset-0 bg-black/10" />
        <GridPattern />

        {/* Floating orbs */}
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-white/10 rounded-full blur-3xl float" />
        <div className="absolute bottom-1/3 left-1/4 w-[350px] h-[350px] bg-pink-500/20 rounded-full blur-3xl float-delayed" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 h-full w-full">
          {/* Top - Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Link href="/" className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="absolute inset-0 rounded-xl bg-white/10 blur-lg" />
              </div>
              <div>
                <span className="text-2xl font-bold text-white">HostelHub</span>
                <span className="block text-xs text-white/60 -mt-0.5">Create Account</span>
              </div>
            </Link>
          </motion.div>

          {/* Center - Progress Steps */}
          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
                Join Our
                <br />
                <span className="bg-gradient-to-r from-white via-pink-200 to-white bg-clip-text text-transparent">
                  Community
                </span>
              </h1>
              <p className="text-white/70 mb-12">
                Create your account and start managing hostel issues efficiently.
              </p>

              {/* Step Progress */}
              <div className="space-y-6">
                {steps.map((s, index) => {
                  const isCompleted = step > s.id;
                  const isCurrent = step === s.id;
                  const StepIcon = s.icon;

                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-xl transition-all duration-300",
                        isCurrent && "bg-white/10 backdrop-blur-sm border border-white/20",
                        !isCurrent && !isCompleted && "opacity-50"
                      )}
                    >
                      <div
                        className={cn(
                          "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
                          isCompleted
                            ? "bg-green-500"
                            : isCurrent
                            ? "bg-white text-purple-600"
                            : "bg-white/20"
                        )}
                      >
                        {isCompleted ? (
                          <CheckCircle className="h-6 w-6 text-white" />
                        ) : (
                          <StepIcon className={cn("h-6 w-6", isCurrent ? "text-purple-600" : "text-white")} />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{s.title}</p>
                        <p className="text-sm text-white/60">{s.description}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Bottom - Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex items-center gap-3 text-white/50 text-sm"
          >
            <Shield className="h-4 w-4" />
            <span>256-bit encryption • GDPR compliant • SOC2 certified</span>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          {/* Mobile Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-6 lg:hidden"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-xl gradient-morph flex items-center justify-center">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="absolute inset-0 rounded-xl gradient-morph blur-lg opacity-50" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              HostelHub
            </span>
          </motion.div>

          {/* Form Card */}
          <div className="glass-card-premium p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Create account</h2>
                <p className="text-muted-foreground text-sm mt-1">{steps[step - 1].description}</p>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  {step}/{steps.length}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full mb-8 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait">
                {/* Step 1: Basic Info */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-sm font-medium">Full Name</Label>
                      <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
                        <Input
                          id="name"
                          placeholder="John Doe"
                          className={cn(
                            "pl-12 h-12 bg-white/50 dark:bg-gray-900/50",
                            errors.name && "border-red-500"
                          )}
                          {...register("name")}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-sm text-red-500">{errors.name.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                      <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          className={cn(
                            "pl-12 h-12 bg-white/50 dark:bg-gray-900/50",
                            errors.email && "border-red-500"
                          )}
                          {...register("email")}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-sm text-red-500">{errors.email.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="college" className="text-sm font-medium">College</Label>
                      <div className="relative group">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
                        <Input
                          id="college"
                          placeholder="Start typing your college name"
                          className={cn(
                            "pl-12 h-12 bg-white/50 dark:bg-gray-900/50",
                            errors.college && "border-red-500"
                          )}
                          value={collegeValue || ""}
                          onChange={(event) => {
                            setValue("college", event.target.value, { shouldValidate: true });
                            setCollegeOpen(true);
                          }}
                          onFocus={() => setCollegeOpen(true)}
                          onBlur={() => setTimeout(() => setCollegeOpen(false), 150)}
                          autoComplete="off"
                        />
                        {collegeOpen && (
                          <div className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-950">
                            {collegeLoading && (
                              <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Searching colleges...
                              </div>
                            )}
                            {!collegeLoading && collegeOptions.length === 0 && (
                              <div className="px-4 py-3 text-sm text-muted-foreground">
                                No matches. Keep typing.
                              </div>
                            )}
                            {!collegeLoading && collegeOptions.length > 0 && (
                              <div className="max-h-60 overflow-auto py-2">
                                {collegeOptions.map((college) => (
                                  <button
                                    type="button"
                                    key={college}
                                    className="block w-full px-4 py-2 text-left text-sm hover:bg-slate-100 dark:hover:bg-slate-900"
                                    onClick={() => {
                                      setValue("college", college, { shouldValidate: true });
                                      setCollegeOpen(false);
                                    }}
                                  >
                                    {college}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      {errors.college && (
                        <p className="text-sm text-red-500">{errors.college.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">Phone (optional)</Label>
                      <div className="relative group">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+91 98765 43210"
                          className="pl-12 h-12 bg-white/50 dark:bg-gray-900/50"
                          {...register("phone")}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
                          <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••"
                            className={cn(
                              "pl-12 pr-12 h-12 bg-white/50 dark:bg-gray-900/50",
                              errors.password && "border-red-500"
                            )}
                            {...register("password")}
                          />
                          <button
                            type="button"
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {errors.password && (
                          <p className="text-sm text-red-500">{errors.password.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm</Label>
                        <div className="relative group">
                          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="••••••"
                            className={cn(
                              "pl-12 h-12 bg-white/50 dark:bg-gray-900/50",
                              errors.confirmPassword && "border-red-500"
                            )}
                            {...register("confirmPassword")}
                          />
                        </div>
                        {errors.confirmPassword && (
                          <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Role Selection */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <Label className="text-sm font-medium">Select your role</Label>
                    <div className="space-y-3">
                      {roles.map((role) => {
                        const isSelected = selectedRole === role.id;
                        const RoleIcon = role.icon;

                        return (
                          <div
                            key={role.id}
                            onClick={() => setValue("role", role.id as "student" | "maintenance" | "management")}
                            className={cn(
                              "relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 group",
                              isSelected
                                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                            )}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={cn(
                                  "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 transition-transform duration-300",
                                  role.color,
                                  isSelected && "scale-110"
                                )}
                              >
                                <RoleIcon className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <p className="font-semibold">{role.title}</p>
                                  <div
                                    className={cn(
                                      "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                      isSelected
                                        ? "border-purple-500 bg-purple-500"
                                        : "border-gray-300 dark:border-gray-600"
                                    )}
                                  >
                                    {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                                  </div>
                                </div>
                                <p className="text-sm text-muted-foreground">{role.description}</p>
                                {isSelected && (
                                  <motion.ul
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="mt-3 space-y-1"
                                  >
                                    {role.features.map((feature, i) => (
                                      <li key={i} className="text-xs text-muted-foreground flex items-center gap-2">
                                        <CheckCircle className="h-3 w-3 text-green-500" />
                                        {feature}
                                      </li>
                                    ))}
                                  </motion.ul>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedRole === "student" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="studentId" className="text-sm font-medium">Student ID (optional)</Label>
                        <Input
                          id="studentId"
                          placeholder="STU2024001"
                          className="h-12 bg-white/50 dark:bg-gray-900/50"
                          {...register("studentId")}
                        />
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Step 3: Location Details */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Hostel</Label>
                      <Select
                        onValueChange={(value) => setValue("hostel", value)}
                        defaultValue={watch("hostel")}
                      >
                        <SelectTrigger className={cn("h-12", errors.hostel && "border-red-500")}>
                          <SelectValue placeholder="Select your hostel" />
                        </SelectTrigger>
                        <SelectContent>
                          {HOSTELS.map((hostel) => (
                            <SelectItem key={hostel} value={hostel}>
                              {hostel}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.hostel && (
                        <p className="text-sm text-red-500">{errors.hostel.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="block" className="text-sm font-medium">Block</Label>
                        <div className="relative group">
                          <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
                          <Input
                            id="block"
                            placeholder="A"
                            className={cn(
                              "pl-12 h-12 bg-white/50 dark:bg-gray-900/50",
                              errors.block && "border-red-500"
                            )}
                            {...register("block")}
                          />
                        </div>
                        {errors.block && (
                          <p className="text-sm text-red-500">{errors.block.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Floor</Label>
                        <Select
                          onValueChange={(value) => setValue("floor", value)}
                          defaultValue={watch("floor")}
                        >
                          <SelectTrigger className={cn("h-12", errors.floor && "border-red-500")}>
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
                        {errors.floor && (
                          <p className="text-sm text-red-500">{errors.floor.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="room" className="text-sm font-medium">Room Number</Label>
                      <div className="relative group">
                        <Home className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-purple-500 transition-colors" />
                        <Input
                          id="room"
                          placeholder="101"
                          className={cn(
                            "pl-12 h-12 bg-white/50 dark:bg-gray-900/50",
                            errors.room && "border-red-500"
                          )}
                          {...register("room")}
                        />
                      </div>
                      {errors.room && (
                        <p className="text-sm text-red-500">{errors.room.message}</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1 h-12 text-base"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back
                  </Button>
                )}

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 h-12 btn-premium text-base group"
                  >
                    Continue
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    className="flex-1 h-12 btn-premium text-base group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        Create Account
                        <Sparkles className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>

            {/* Sign in link */}
            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-semibold inline-flex items-center gap-1 group"
                >
                  Sign in
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </p>
            </div>
          </div>

          {/* Terms */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 text-center text-sm text-muted-foreground"
          >
            By creating an account, you agree to our{" "}
            <Link href="#" className="underline hover:text-foreground">Terms</Link>
            {" "}and{" "}
            <Link href="#" className="underline hover:text-foreground">Privacy Policy</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}
