"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useSession, signIn } from "next-auth/react";
import {
  Zap,
  Shield,
  Bell,
  Building2,
  Mail,
  Lock,
  EyeOff,
  Eye,
  Loader2,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

// Animated grid background component
function GridPattern() {
  return (
    <div className="absolute inset-0 overflow-hidden opacity-40">
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

// Feature carousel data
const features = [
  {
    icon: Zap,
    title: "Lightning Fast Reporting",
    description: "Report issues in under 30 seconds with our AI-assisted form",
  },
  {
    icon: Shield,
    title: "Enterprise Security",
    description: "Bank-grade encryption protects all your data end-to-end",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get instant updates on issue progress and resolutions",
  },
];

function LoginPageInner() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      window.location.href = callbackUrl;
    }
  }, [status, session, callbackUrl]);

  // Auto-rotate features
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
        setIsLoading(false);
      } else if (result?.ok) {
        toast.success("Welcome back!");
        window.location.href = callbackUrl;
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Premium Decorative Panel */}
      <div className="hidden lg:flex lg:w-[55%] relative">
        {/* Animated gradient background */}
        <div className="absolute inset-0 gradient-morph" />
        <div className="absolute inset-0 bg-black/10" />
        <GridPattern />

        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-3xl float" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl float-delayed" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-pink-500/10 rounded-full blur-3xl" style={{ animation: "float 8s ease-in-out infinite" }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 h-full w-full">
          {/* Top - Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="absolute inset-0 rounded-xl bg-white/10 blur-lg" />
            </div>
            <div>
              <span className="text-2xl font-bold text-white">HostelHub</span>
              <span className="block text-xs text-white/60 -mt-0.5">Enterprise</span>
            </div>
          </motion.div>

          {/* Center - Main content */}
          <div className="flex-1 flex flex-col justify-center max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                <span className="text-sm text-white/90 font-medium">Campus community live now</span>
              </div>

              <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                Welcome to the
                <br />
                <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
                  Future of Hostel Management
                </span>
              </h1>

              <p className="text-lg text-white/70 mb-12 leading-relaxed">
                Experience seamless issue tracking with AI-powered automation,
                real-time updates, and enterprise-grade security.
              </p>

              {/* Feature Carousel */}
              <div className="relative h-32">
                <AnimatePresence mode="wait">
                  {features.map((feature, index) => (
                    index === activeFeature ? (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                        className="absolute inset-0"
                      >
                        <div className="glass-ultra p-6 rounded-2xl border border-white/10 bg-white/5">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                              <feature.icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-1">{feature.title}</h3>
                              <p className="text-white/60">{feature.description}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ) : null
                  ))}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2 mt-6">
                {features.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setActiveFeature(index)}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-300",
                      index === activeFeature
                        ? "w-8 bg-white"
                        : "w-1.5 bg-white/30 hover:bg-white/50"
                    )}
                    aria-label={`Show feature ${index + 1}`}
                  />
                ))}
              </div>

              <div className="flex items-center gap-6 mt-10 text-white/40">
                {[
                  "Trusted campuses",
                  "Verified staff",
                  "Always on support",
                ].map((name) => (
                  <div key={name} className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm font-medium">{name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom - Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex items-center gap-8"
          >
            {[
              "Campus teams",
              "Facilities",
              "Resident support",
            ].map((name) => (
              <div key={name} className="flex items-center gap-2 text-white/40">
                <Building2 className="h-4 w-4" />
                <span className="text-sm font-medium">{name}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-3 mb-8 lg:hidden"
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
          <div className="glass-card-premium p-8 sm:p-10">
            <div className="text-center mb-8">
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold mb-2"
              >
                Welcome back
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-muted-foreground"
              >
                Sign in to continue to your home
              </motion.p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    className={cn(
                      "pl-12 h-12 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800",
                      "focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all",
                      errors.email && "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    )}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500 flex items-center gap-1"
                  >
                    {errors.email.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-medium">
                    Password
                  </Label>
                  <Link
                    href="/auth/forgot-password"
                    className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn(
                      "pl-12 pr-12 h-12 bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800",
                      "focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all",
                      errors.password && "border-red-500 focus:ring-red-500/20 focus:border-red-500"
                    )}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-red-500"
                  >
                    {errors.password.message}
                  </motion.p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex items-center space-x-2"
              >
                <Checkbox id="remember" {...register("remember")} className="rounded" />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer text-muted-foreground">
                  Remember me for 30 days
                </Label>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Button
                  type="submit"
                  className="w-full h-12 btn-premium text-base font-semibold group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Sign in to Dashboard
                      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>

            {/* Sign up link */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 text-center"
            >
              <p className="text-muted-foreground">
                New to HostelHub?{" "}
                <Link
                  href="/auth/signup"
                  className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-semibold inline-flex items-center gap-1 group"
                >
                  Create an account
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </p>
            </motion.div>
          </div>

          {/* Bottom text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-8 text-center text-sm text-muted-foreground"
          >
            By signing in, you agree to our{" "}
            <Link href="#" className="underline hover:text-foreground">Terms of Service</Link>
            {" "}and{" "}
            <Link href="#" className="underline hover:text-foreground">Privacy Policy</Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}> 
      <LoginPageInner />
    </Suspense>
  );
}
