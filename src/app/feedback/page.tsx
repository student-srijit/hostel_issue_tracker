"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  MessageSquare,
  Star,
  Send,
  ThumbsUp,
  ThumbsDown,
  Bug,
  Lightbulb,
  HelpCircle,
  Smile,
  Meh,
  Frown,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

const feedbackTypes = [
  { id: "bug", label: "Bug Report", icon: Bug, color: "text-red-500" },
  { id: "feature", label: "Feature Request", icon: Lightbulb, color: "text-yellow-500" },
  { id: "general", label: "General Feedback", icon: MessageSquare, color: "text-blue-500" },
  { id: "help", label: "Need Help", icon: HelpCircle, color: "text-purple-500" },
];

const satisfactionLevels = [
  { value: "5", label: "Very Satisfied", icon: Smile, color: "text-green-500" },
  { value: "3", label: "Neutral", icon: Meh, color: "text-yellow-500" },
  { value: "1", label: "Dissatisfied", icon: Frown, color: "text-red-500" },
];

export default function FeedbackPage() {
  const [feedbackType, setFeedbackType] = useState<string>("");
  const [satisfaction, setSatisfaction] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!feedbackType || !message) {
      toast.error("Please select feedback type and enter your message");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    toast.success("Thank you for your feedback!", {
      description: "We appreciate you taking the time to help us improve.",
    });
    
    // Reset form
    setFeedbackType("");
    setSatisfaction("");
    setSubject("");
    setMessage("");
    setRating(0);
    setIsSubmitting(false);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="h-8 w-8 text-primary" />
            Send Feedback
          </h1>
          <p className="text-muted-foreground">
            Help us improve by sharing your thoughts, reporting bugs, or suggesting new features
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Feedback Type */}
          <Card>
            <CardHeader>
              <CardTitle>What type of feedback do you have?</CardTitle>
              <CardDescription>Select the category that best describes your feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {feedbackTypes.map((type) => (
                  <motion.button
                    key={type.id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setFeedbackType(type.id)}
                    className={cn(
                      "flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all",
                      feedbackType === type.id
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/50"
                    )}
                  >
                    <type.icon className={cn("h-8 w-8", type.color)} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Overall Satisfaction */}
          <Card>
            <CardHeader>
              <CardTitle>How satisfied are you with our system?</CardTitle>
              <CardDescription>Your overall experience with the hostel issue tracker</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Star Rating */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground mr-2">Rating:</span>
                {[1, 2, 3, 4, 5].map((star) => (
                  <motion.button
                    key={star}
                    type="button"
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(0)}
                    onClick={() => setRating(star)}
                    className="focus:outline-none"
                  >
                    <Star
                      className={cn(
                        "h-8 w-8 transition-colors",
                        star <= (hoveredStar || rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-muted-foreground"
                      )}
                    />
                  </motion.button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-muted-foreground">
                    {rating} / 5
                  </span>
                )}
              </div>

              {/* Quick Satisfaction */}
              <div className="flex items-center justify-center gap-6 pt-4">
                {satisfactionLevels.map((level) => (
                  <motion.button
                    key={level.value}
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSatisfaction(level.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl transition-all",
                      satisfaction === level.value
                        ? "bg-muted"
                        : "hover:bg-muted/50"
                    )}
                  >
                    <level.icon className={cn("h-10 w-10", level.color)} />
                    <span className="text-xs text-muted-foreground">{level.label}</span>
                  </motion.button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Feedback Details */}
          <Card>
            <CardHeader>
              <CardTitle>Tell us more</CardTitle>
              <CardDescription>Provide details about your feedback</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject (optional)</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Brief summary of your feedback"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Your Feedback *</Label>
                <Textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    feedbackType === "bug"
                      ? "Please describe the bug, including steps to reproduce it..."
                      : feedbackType === "feature"
                      ? "Describe the feature you'd like to see and why it would be helpful..."
                      : "Share your thoughts, suggestions, or concerns..."
                  }
                  rows={6}
                />
                <p className="text-xs text-muted-foreground">
                  {message.length} / 2000 characters
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Your feedback helps us make the system better for everyone
            </p>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || !feedbackType || !message}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Send className="h-4 w-4" />
                  </motion.div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Feedback
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Quick Stats */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="py-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold text-primary">1,234</p>
                <p className="text-sm text-muted-foreground">Feedback received</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">89%</p>
                <p className="text-sm text-muted-foreground">Issues addressed</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-primary">4.5</p>
                <p className="text-sm text-muted-foreground">Average rating</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
