"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  AlertTriangle,
  Zap,
  Shield,
  QrCode,
  Bell,
  TrendingUp,
  ArrowRight,
  Play,
  ChevronRight,
  Lock,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: AlertTriangle,
    title: "Instant Issue Reporting",
    description: "Report maintenance issues in seconds with our AI-powered multi-step form",
    color: "from-orange-500 to-red-500",
  },
  {
    icon: QrCode,
    title: "Smart QR Scanning",
    description: "Scan location QR codes for instant pre-filled issue reports",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Cpu,
    title: "AI Categorization",
    description: "Machine learning automatically categorizes and prioritizes issues",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingUp,
    title: "Real-time Analytics",
    description: "Track metrics, trends, and KPIs with interactive dashboards",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    description: "Get instant alerts for updates, assignments, and resolutions",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Lock,
    title: "Enterprise Security",
    description: "Role-based access control with end-to-end encryption",
    color: "from-indigo-500 to-purple-500",
  },
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading while mounting
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center animate-pulse">
            <Building2 className="h-8 w-8 text-white" />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "0s" }} />
            <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "0.2s" }} />
            <div className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl px-6 py-4">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/25">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-white">HostelHub</span>
                  <p className="text-[10px] text-slate-400 -mt-1">Smart Issue Tracking</p>
                </div>
              </Link>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-8">
                {["Features", "Analytics", "Security", "Pricing"].map((item) => (
                  <Link
                    key={item}
                    href={`#${item.toLowerCase()}`}
                    className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </nav>

              {/* Auth Buttons */}
              <div className="flex items-center gap-3">
                <Link href="/auth/login">
                  <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold shadow-lg shadow-purple-500/25">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto grid gap-12 items-center lg:grid-cols-[1.1fr_0.9fr] text-left">
          <div className="flex flex-col">
            {/* Badge */}
            <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 mb-8 w-fit"
            >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-sm font-medium text-slate-300">Trusted by hostels worldwide</span>
            <ChevronRight className="h-4 w-4 text-slate-500" />
            </motion.div>

          {/* Main Heading */}
            <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight"
            >
            <span className="text-white">The Future of</span>
            <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
              Hostel Management
            </span>
            </motion.h1>

          {/* Description */}
            <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl"
            >
            AI-powered issue tracking that transforms chaos into clarity.
            <br />
            <span className="text-white font-medium">Report. Track. Resolve. Repeat.</span>
            </motion.p>

          {/* CTA Buttons */}
            <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-16"
            >
            <Link href="/auth/signup">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-lg px-8 py-6 font-semibold shadow-2xl shadow-purple-500/25 group">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-slate-700 text-white hover:bg-slate-800 group">
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
            </motion.div>

          {/* Trust Badges */}
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center gap-8 text-slate-500"
            >
            {["Hostels", "Wardens", "Maintenance teams", "Student councils", "Security"].map((name) => (
              <div key={name} className="flex items-center gap-2 text-sm font-medium hover:text-slate-300 transition-colors">
                <Building2 className="h-4 w-4" />
                {name}
              </div>
            ))}
            </motion.div>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative"
        >
          <div className="hero-illustration tilt-surface shadow-soft min-h-[360px]">
            <div className="absolute inset-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm" />
            <div className="absolute left-10 top-10 h-32 w-32 rounded-2xl bg-white/5 border border-white/10 floating-panel" />
            <div className="absolute right-12 top-20 h-36 w-48 rounded-2xl bg-white/5 border border-white/10 floating-panel delay" />
            <div className="absolute bottom-12 left-12 right-12 h-44 rounded-3xl border border-white/10 bg-white/5" />
            <div className="glow-ring absolute -right-8 -bottom-10" />
          </div>
          <div className="absolute -bottom-8 left-6 right-6 grid gap-4 md:grid-cols-2">
            <div className="image-frame tilt-surface h-24">
              <div className="image-layer" />
            </div>
            <div className="image-frame tilt-surface h-24">
              <div className="image-layer" />
            </div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <span className="text-xs font-medium">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-6 h-10 rounded-full border-2 border-slate-700 flex items-start justify-center p-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="text-center mb-20"
          >
            <span className="inline-block px-4 py-1 rounded-full text-sm font-medium bg-purple-500/20 text-purple-400 mb-4">
              Powerful Features
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Everything you need to
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">manage efficiently</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              From instant reporting to AI-powered analytics, we have got every aspect covered.
            </p>
          </motion.div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: index * 0.1 }}
                className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-2xl p-8 hover:border-slate-700 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={cn(
                  "w-14 h-14 rounded-2xl bg-gradient-to-br flex items-center justify-center mb-6",
                  feature.color
                )}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            className="relative overflow-hidden rounded-3xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500" />
            <div className="relative p-12 md:p-20 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Ready to transform your
                <br />
                hostel management?
              </h2>
              <p className="text-xl opacity-90 mb-10 max-w-2xl mx-auto text-white/80">
                Bring your hostel operations together with a single, secure platform.
                Start your free trial today, no credit card required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/auth/signup">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-white/90 text-lg px-8 py-6 font-semibold group">
                    Get Started Free
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white/30 text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-4 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-white">HostelHub</span>
              </Link>
              <p className="text-slate-500 max-w-sm">
                The most advanced hostel issue tracking platform. Powered by AI, built for efficiency.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-slate-500">
                <li><Link href="#" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Roadmap</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-slate-500">
                <li><Link href="#" className="hover:text-white transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Careers</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-800">
            <p className="text-sm text-slate-500">
              2026 HostelHub. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
