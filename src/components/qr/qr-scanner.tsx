"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";
import { NotFoundException } from "@zxing/library";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Camera, ExternalLink, Loader2, QrCode, RefreshCw, AlertTriangle } from "lucide-react";

interface ScanInfo {
  hostel?: string;
  block?: string;
  floor?: string;
  room?: string;
  location?: string;
  description?: string;
  url?: string;
  code?: string;
}

const normalizeCode = (value: string) => {
  try {
    const url = new URL(value, window.location.origin);
    return url.toString();
  } catch {
    return value.trim();
  }
};

export function QrScanner() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [shouldScan, setShouldScan] = useState(false);
  const [scanInfo, setScanInfo] = useState<ScanInfo | null>(null);
  const [scanInfoError, setScanInfoError] = useState<string | null>(null);
  const [scanInfoLoading, setScanInfoLoading] = useState(false);
  const [scanSession, setScanSession] = useState(0);

  const isCameraSupported = isMounted && typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isCameraSupported) return;
    const handleDeviceChange = () => {
      navigator.mediaDevices.enumerateDevices().then((allDevices) => {
        const videoDevices = allDevices.filter((device) => device.kind === "videoinput");
        setDevices(videoDevices);
        if (!selectedDeviceId && videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        }
      }).catch(() => undefined);
    };

    navigator.mediaDevices.addEventListener?.("devicechange", handleDeviceChange);
    let isMounted = true;
    const reader = new BrowserMultiFormatReader();
    readerRef.current = reader;

    const initDevices = async () => {
      try {
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
        tempStream.getTracks().forEach((track) => track.stop());
      } catch {
        if (!isMounted) return;
        setScanError("Camera access is blocked. Allow camera permissions and refresh.");
      }

      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        if (!isMounted) return;
        const videoDevices = allDevices.filter((device) => device.kind === "videoinput");
        setDevices(videoDevices);
        if (videoDevices.length > 0) {
          setSelectedDeviceId(videoDevices[0].deviceId);
        } else {
          setScanError("No cameras detected. Connect a camera or use manual input.");
        }
      } catch {
        if (!isMounted) return;
        setScanError("Unable to list cameras. Check permissions and refresh.");
      }
    };

    initDevices();

    return () => {
      isMounted = false;
      controlsRef.current?.stop?.();
      controlsRef.current = null;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      navigator.mediaDevices.removeEventListener?.("devicechange", handleDeviceChange);
    };
  }, [isCameraSupported]);

  useEffect(() => {
    if (!isCameraSupported || scanResult || !shouldScan) return;
    if (!videoRef.current) return;
    const reader = readerRef.current ?? new BrowserMultiFormatReader();
    readerRef.current = reader;

    setScanError(null);

    reader
      .decodeFromVideoDevice(selectedDeviceId || undefined, videoRef.current, (result, err) => {
        if (result) {
          setScanResult(result.getText());
          setIsScanning(false);
          controlsRef.current?.stop?.();
          controlsRef.current = null;
          return;
        }
        if (err && !(err instanceof NotFoundException)) {
          setScanError("Unable to read QR code. Try adjusting the camera.");
        }
      })
      .then((controls) => {
        controlsRef.current = controls;
        setIsScanning(true);
      })
      .catch(() => {
        setScanError("Unable to start camera. Check permissions and refresh.");
        setIsScanning(false);
      });

    return () => {
      controlsRef.current?.stop?.();
      controlsRef.current = null;
      setIsScanning(false);
    };
  }, [isCameraSupported, selectedDeviceId, scanResult, scanSession, shouldScan]);

  const issueUrl = useMemo(() => {
    if (!scanResult || !isMounted) return null;
    try {
      const url = new URL(scanResult, window.location.origin);
      if (url.pathname === "/issues/new") return url.toString();
      return null;
    } catch {
      return null;
    }
  }, [scanResult]);

  const normalizedCode = useMemo(() => {
    if (!scanResult || !isMounted) return null;
    return normalizeCode(scanResult);
  }, [scanResult]);

  useEffect(() => {
    if (!normalizedCode) return;

    let active = true;
    const fetchScanInfo = async () => {
      setScanInfoLoading(true);
      setScanInfoError(null);
      try {
        const response = await fetch("/api/qr/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: normalizedCode, action: "view" }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data?.error || "QR code not recognized");
        }

        const data = await response.json();
        if (active) {
          setScanInfo(data.qr || null);
        }
      } catch (error) {
        if (active) {
          setScanInfo(null);
          setScanInfoError(error instanceof Error ? error.message : "QR code not recognized");
        }
      } finally {
        if (active) {
          setScanInfoLoading(false);
        }
      }
    };

    fetchScanInfo();

    return () => {
      active = false;
    };
  }, [normalizedCode]);

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return;
    setShouldScan(false);
    setScanResult(manualCode.trim());
    setManualCode("");
  };

  const handleRescan = () => {
    setScanResult(null);
    setScanInfo(null);
    setScanInfoError(null);
    setShouldScan(true);
    setScanSession((prev) => prev + 1);
  };

  const handleStartScan = async () => {
    setScanError(null);

    if (!isCameraSupported) {
      setScanError("Camera access is not supported in this browser.");
      return;
    }

    try {
      const constraints: MediaStreamConstraints = selectedDeviceId
        ? { video: { deviceId: { exact: selectedDeviceId } } }
        : { video: { facingMode: "environment" } };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setShouldScan(true);
      setScanSession((prev) => prev + 1);
    } catch {
      setScanError("Camera access is blocked. Allow camera permissions and refresh.");
    }
  };

  const handleStopScan = () => {
    controlsRef.current?.stop?.();
    controlsRef.current = null;
    setIsScanning(false);
    setShouldScan(false);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Scan QR Code
          </CardTitle>
          <CardDescription>
            Scan a hostel QR code to auto-fill location details for reporting an issue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isCameraSupported && (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Camera access is not supported in this browser. Use manual input instead.
            </div>
          )}

          {isCameraSupported && (
            <div className="space-y-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Camera className="h-4 w-4" />
                  <span>Camera</span>
                </div>
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm sm:w-80"
                  value={selectedDeviceId}
                  onChange={(event) => setSelectedDeviceId(event.target.value)}
                >
                  {devices.length === 0 ? (
                    <option value="">No cameras detected</option>
                  ) : (
                    devices.map((device, index) => (
                      <option key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${index + 1}`}
                      </option>
                    ))
                  )}
                </select>
                <Badge variant={isScanning ? "secondary" : "outline"}>
                  {isScanning ? "Scanning" : scanResult ? "Paused" : shouldScan ? "Starting" : "Ready"}
                </Badge>
                {!scanResult && (
                  <Button
                    size="sm"
                    variant={shouldScan ? "outline" : "default"}
                    onClick={shouldScan ? handleStopScan : handleStartScan}
                  >
                    {shouldScan ? "Stop" : "Start camera"}
                  </Button>
                )}
              </div>

              <div className="relative overflow-hidden rounded-xl border bg-muted">
                <video
                  ref={videoRef}
                  className={cn("h-72 w-full object-cover", scanResult && "opacity-40")}
                  muted
                  autoPlay
                  playsInline
                  disablePictureInPicture
                />
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground">
                      Align the QR code within the frame
                    </div>
                  </div>
                )}
                {scanResult && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/70 text-center">
                    <Badge variant="secondary">QR detected</Badge>
                    <Button variant="outline" size="sm" onClick={handleRescan}>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Scan again
                    </Button>
                  </div>
                )}
              </div>

              {scanError && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  <AlertTriangle className="h-4 w-4" />
                  {scanError}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Manual QR code</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={manualCode}
                onChange={(event) => setManualCode(event.target.value)}
                placeholder="Paste QR code URL or text"
              />
              <Button variant="outline" onClick={handleManualSubmit}>
                Use code
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Scan Result</CardTitle>
          <CardDescription>Review the scanned QR data before opening the issue form.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!scanResult && <p className="text-sm text-muted-foreground">No QR scanned yet.</p>}

          {scanResult && (
            <div className="space-y-3">
              <div className="rounded-lg border bg-muted/40 p-3 text-sm break-words">
                {scanResult}
              </div>

              {scanInfoLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Fetching QR details...
                </div>
              )}

              {scanInfoError && (
                <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {scanInfoError}
                </div>
              )}

              {scanInfo && (
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                  {scanInfo.hostel && (
                    <div>
                      <span className="text-muted-foreground">Hostel:</span> {scanInfo.hostel}
                    </div>
                  )}
                  {scanInfo.block && (
                    <div>
                      <span className="text-muted-foreground">Block:</span> {scanInfo.block}
                    </div>
                  )}
                  {scanInfo.floor && (
                    <div>
                      <span className="text-muted-foreground">Floor:</span> {scanInfo.floor}
                    </div>
                  )}
                  {scanInfo.room && (
                    <div>
                      <span className="text-muted-foreground">Room:</span> {scanInfo.room}
                    </div>
                  )}
                  {scanInfo.location && (
                    <div>
                      <span className="text-muted-foreground">Location:</span> {scanInfo.location}
                    </div>
                  )}
                </div>
              )}

              {issueUrl && (
                <div className="flex flex-wrap gap-2">
                  <Link href={issueUrl}>
                    <Button>
                      Continue to issue report
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => window.open(issueUrl, "_blank", "noopener,noreferrer")}
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open in new tab
                  </Button>
                </div>
              )}

              {!issueUrl && scanResult && (
                <Button
                  variant="outline"
                  onClick={() => window.open(normalizedCode || scanResult, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open scanned link
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
