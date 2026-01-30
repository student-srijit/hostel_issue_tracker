"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, ImagePlus, Loader2, X } from "lucide-react";
import { HOSTELS, cn } from "@/lib/utils";

interface GalleryUploadCardProps {
  title?: string;
  description?: string;
  className?: string;
}

export function GalleryUploadCard({
  title = "Add to Gallery",
  description = "Upload a hostel moment to the main gallery feed.",
  className,
}: GalleryUploadCardProps) {
  const { data: session } = useSession();
  const [hostel, setHostel] = useState(session?.user?.hostel || HOSTELS[0]);
  const [caption, setCaption] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user?.hostel) {
      setHostel(session.user.hostel);
    }
  }, [session?.user?.hostel]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const nextFile = acceptedFiles.find((f) => f.type.startsWith("image/"));
    if (!nextFile) {
      toast.error("Please upload a valid image file");
      return;
    }
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
    maxFiles: 1,
  });

  const hasFile = useMemo(() => Boolean(file), [file]);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Please add a photo before posting");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("caption", caption);
      formData.append("hostel", hostel);
      formData.append("file", file);

      const response = await fetch("/api/gallery", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload");
      }

      toast.success("Photo added to main gallery");
      setCaption("");
      setFile(null);
      setPreview(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className={cn("glass-card-premium", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5 text-purple-500" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Hostel</Label>
            <Select value={hostel} onValueChange={setHostel}>
              <SelectTrigger>
                <SelectValue placeholder="Select hostel" />
              </SelectTrigger>
              <SelectContent>
                {HOSTELS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Caption</Label>
            <Textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              placeholder="Add a short caption"
              rows={3}
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label>Photo</Label>
          <div
            {...getRootProps()}
            className={cn(
              "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-muted-foreground/40 px-6 py-8 text-center text-sm transition-colors",
              isDragActive && "border-purple-500/70 bg-purple-500/5",
              hasFile && "border-purple-500/60"
            )}
          >
            <input {...getInputProps()} />
            <ImagePlus className="h-5 w-5 text-muted-foreground" />
            <p className="text-muted-foreground">
              {isDragActive ? "Drop the image here" : "Drag & drop an image, or click to browse"}
            </p>
            {hasFile && <Badge variant="secondary">Ready to upload</Badge>}
          </div>
        </div>

        {preview && (
          <div className="relative overflow-hidden rounded-2xl border">
            <div className="relative aspect-[4/3]">
              <Image src={preview} alt="Gallery preview" fill className="object-cover" />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="absolute right-3 top-3"
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            {isSubmitting ? "Uploading..." : "Post to gallery"}
          </Button>
          {hasFile && (
            <span className="text-xs text-muted-foreground">1 image selected</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}