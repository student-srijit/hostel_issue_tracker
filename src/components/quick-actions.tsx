"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Plus,
  AlertTriangle,
  MessageSquare,
  Package,
  X,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const quickActions = [
  {
    id: "new-issue",
    label: "Report Issue",
    icon: AlertTriangle,
    href: "/issues/new",
    color: "bg-red-500 hover:bg-red-600",
  },
  {
    id: "lost-found",
    label: "Lost & Found",
    icon: Package,
    href: "/lost-found",
    color: "bg-blue-500 hover:bg-blue-600",
  },
  {
    id: "feedback",
    label: "Send Feedback",
    icon: MessageSquare,
    href: "/feedback",
    color: "bg-green-500 hover:bg-green-600",
  },
];

export function QuickActions() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  return (
    <TooltipProvider>
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute bottom-16 right-0 flex flex-col gap-3"
            >
              {quickActions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        className={cn(
                          "h-12 w-12 rounded-full shadow-lg",
                          action.color
                        )}
                        onClick={() => {
                          router.push(action.href);
                          setIsOpen(false);
                        }}
                      >
                        <action.icon className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">{action.label}</TooltipContent>
                  </Tooltip>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "h-14 w-14 rounded-full shadow-xl flex items-center justify-center transition-colors",
            isOpen
              ? "bg-muted text-muted-foreground"
              : "bg-primary text-primary-foreground"
          )}
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Plus className="h-6 w-6" />
          )}
        </motion.button>

        {/* Sparkle effect */}
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute -top-1 -right-1"
          >
            <Sparkles className="h-4 w-4 text-yellow-400" />
          </motion.div>
        )}
      </div>
    </TooltipProvider>
  );
}
