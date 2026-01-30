"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  QrCode,
  Download,
  Copy,
  Plus,
  Trash2,
  Printer,
  MapPin,
  Building2,
  Layers,
  DoorOpen,
  Eye,
  RefreshCw,
} from "lucide-react";
import { DashboardLayout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HOSTELS, FLOORS } from "@/lib/utils";

interface GeneratedQR {
  id: string;
  dataUrl: string;
  svg: string;
  url: string;
  location: string;
  hostel: string;
  block?: string;
  floor?: string;
  room?: string;
}

export default function QRCodePage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generatedQRs, setGeneratedQRs] = useState<GeneratedQR[]>([]);
  const [selectedQR, setSelectedQR] = useState<GeneratedQR | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state
  const [location, setLocation] = useState("");
  const [hostel, setHostel] = useState("");
  const [block, setBlock] = useState("");
  const [floor, setFloor] = useState("");
  const [room, setRoom] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchQRs = async () => {
      setIsLoading(true);
      setLoadError(null);
      try {
        const response = await fetch("/api/qr/generate?limit=50");
        if (!response.ok) {
          throw new Error("Failed to fetch QR codes");
        }
        const data = await response.json();
        if (isMounted) {
          setGeneratedQRs(
            (data.qrCodes || []).map((qr: any) => ({
              id: qr._id || qr.id,
              dataUrl: qr.dataUrl || "",
              svg: qr.svg || "",
              url: qr.url,
              location: qr.location,
              hostel: qr.hostel,
              block: qr.block,
              floor: qr.floor,
              room: qr.room,
            }))
          );
        }
      } catch (error) {
        if (isMounted) {
          setLoadError("Failed to load QR codes");
          setGeneratedQRs([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchQRs();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleGenerate = async () => {
    if (!location || !hostel) {
      toast.error("Please enter location and select hostel");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/qr/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location,
          hostel,
          block: block || undefined,
          floor: floor || undefined,
          room: room || undefined,
          description: description || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to generate QR code");

      const data = await response.json();
      setGeneratedQRs((prev) => [data.qrCode, ...prev]);
      toast.success("QR code generated successfully!");
      
      // Reset form
      setLocation("");
      setBlock("");
      setFloor("");
      setRoom("");
      setDescription("");
      setDialogOpen(false);
    } catch (error) {
      toast.error("Failed to generate QR code");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (qr: GeneratedQR, format: "png" | "svg") => {
    const element = document.createElement("a");
    
    if (format === "png") {
      element.href = qr.dataUrl;
      element.download = `qr-${qr.location.replace(/\s+/g, "-")}.png`;
    } else {
      const blob = new Blob([qr.svg], { type: "image/svg+xml" });
      element.href = URL.createObjectURL(blob);
      element.download = `qr-${qr.location.replace(/\s+/g, "-")}.svg`;
    }
    
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Downloaded QR code as ${format.toUpperCase()}`);
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const handlePrint = (qr: GeneratedQR) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code - ${qr.location}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .container {
              text-align: center;
              padding: 40px;
              border: 2px solid #e5e7eb;
              border-radius: 16px;
            }
            img {
              width: 300px;
              height: 300px;
            }
            h1 {
              margin: 20px 0 10px;
              font-size: 24px;
              color: #111827;
            }
            p {
              margin: 5px 0;
              color: #6b7280;
              font-size: 14px;
            }
            .location {
              font-size: 16px;
              font-weight: 600;
              color: #374151;
            }
            .scan-text {
              margin-top: 20px;
              padding: 10px 20px;
              background: #f3f4f6;
              border-radius: 8px;
              font-size: 14px;
              color: #4b5563;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${qr.dataUrl}" alt="QR Code" />
            <h1>Report an Issue</h1>
            <p class="location">${qr.location}</p>
            <p>${qr.hostel}${qr.block ? ` - Block ${qr.block}` : ""}${qr.floor ? ` - ${qr.floor}` : ""}</p>
            <p class="scan-text">📱 Scan to report maintenance issues</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleDelete = (id: string) => {
    setGeneratedQRs((prev) => prev.filter((qr) => qr.id !== id));
    toast.success("QR code removed");
  };

  const allQRs = generatedQRs;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <QrCode className="h-8 w-8 text-primary" />
              QR Code Generator
            </h1>
            <p className="text-muted-foreground">
              Generate QR codes for quick issue reporting at different locations
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Generate QR Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Generate New QR Code</DialogTitle>
                <DialogDescription>
                  Create a QR code that pre-fills location details for issue reporting
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Location Name *
                  </Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g., Common Room, Bathroom, Kitchen"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Hostel *
                    </Label>
                    <Select value={hostel} onValueChange={setHostel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select hostel" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOSTELS.map((h) => (
                          <SelectItem key={h} value={h}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="block" className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Block
                    </Label>
                    <Input
                      id="block"
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      placeholder="A, B, C"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Floor
                    </Label>
                    <Select value={floor} onValueChange={setFloor}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select floor" />
                      </SelectTrigger>
                      <SelectContent>
                        {FLOORS.map((f) => (
                          <SelectItem key={f} value={f}>{f}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="room" className="flex items-center gap-2">
                      <DoorOpen className="h-4 w-4" />
                      Room Number
                    </Label>
                    <Input
                      id="room"
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      placeholder="101"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Additional notes about this location"
                    rows={2}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <QrCode className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* QR Codes Grid */}
        {isLoading && (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              Loading QR codes...
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

        {!isLoading && !loadError && allQRs.length === 0 && (
          <Card>
            <CardContent className="py-6 text-center text-sm text-muted-foreground">
              No QR codes yet. Generate your first QR code to see it here.
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {allQRs.map((qr, index) => (
              <motion.div
                key={qr.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center">
                      {/* QR Code Display */}
                      <div className="w-48 h-48 bg-white rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center mb-4">
                        {qr.dataUrl && qr.dataUrl.length > 100 ? (
                          <img
                            src={qr.dataUrl}
                            alt={`QR Code for ${qr.location}`}
                            className="w-full h-full p-2"
                          />
                        ) : (
                          <div className="text-center text-muted-foreground">
                            <QrCode className="h-16 w-16 mx-auto mb-2" />
                            <p className="text-xs">QR Preview</p>
                          </div>
                        )}
                      </div>

                      {/* Location Info */}
                      <div className="text-center mb-4">
                        <h3 className="font-semibold text-lg">{qr.location}</h3>
                        <div className="flex flex-wrap justify-center gap-1 mt-2">
                          <Badge variant="outline">{qr.hostel}</Badge>
                          {qr.block && <Badge variant="outline">Block {qr.block}</Badge>}
                          {qr.floor && <Badge variant="outline">{qr.floor} Floor</Badge>}
                          {qr.room && <Badge variant="outline">Room {qr.room}</Badge>}
                        </div>
                      </div>

                      <Separator className="my-4 w-full" />

                      {/* Actions */}
                      <div className="flex flex-wrap justify-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedQR(qr);
                            setPreviewOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDownload(qr, "png")}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopyUrl(qr.url)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrint(qr)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDelete(qr.id)}
                          className="text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Preview Dialog */}
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>QR Code Preview</DialogTitle>
              <DialogDescription>
                {selectedQR?.location}
              </DialogDescription>
            </DialogHeader>
            {selectedQR && (
              <div className="flex flex-col items-center py-4">
                <div className="w-64 h-64 bg-white rounded-xl border flex items-center justify-center">
                  {selectedQR.dataUrl && selectedQR.dataUrl.length > 100 ? (
                    <img
                      src={selectedQR.dataUrl}
                      alt="QR Code"
                      className="w-full h-full p-2"
                    />
                  ) : (
                    <QrCode className="h-32 w-32 text-muted-foreground" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-4 break-all px-4 text-center">
                  {selectedQR.url}
                </p>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setPreviewOpen(false)}>
                Close
              </Button>
              {selectedQR && (
                <Button onClick={() => handleDownload(selectedQR, "png")}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Instructions Card */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>How to Use QR Codes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">1</span>
                </div>
                <div>
                  <h4 className="font-medium">Generate</h4>
                  <p className="text-sm text-muted-foreground">
                    Create QR codes for specific locations in your hostel
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">2</span>
                </div>
                <div>
                  <h4 className="font-medium">Print & Display</h4>
                  <p className="text-sm text-muted-foreground">
                    Print and place QR codes at relevant locations
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold">3</span>
                </div>
                <div>
                  <h4 className="font-medium">Scan & Report</h4>
                  <p className="text-sm text-muted-foreground">
                    Students scan to instantly report issues with pre-filled location
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
