"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Trash2,
  Download,
  Waves,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface VoiceNoteRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  maxDuration?: number; // in seconds
}

export function VoiceNoteRecorder({
  onRecordingComplete,
  maxDuration = 120, // 2 minutes default
}: VoiceNoteRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(20).fill(0));

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, [audioUrl]);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Set up audio context for visualization
      audioContextRef.current = new AudioContext();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 64;
      source.connect(analyserRef.current);

      // Start visualization
      const updateVisualizer = () => {
        if (!analyserRef.current) return;
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);
        const normalized = Array.from(dataArray.slice(0, 20)).map((v) => v / 255);
        setVisualizerData(normalized);
        if (isRecording) {
          animationRef.current = requestAnimationFrame(updateVisualizer);
        }
      };

      // Set up media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        onRecordingComplete(blob, duration);
        stream.getTracks().forEach((track) => track.stop());
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        setVisualizerData(new Array(20).fill(0));
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      // Start visualizer
      animationRef.current = requestAnimationFrame(updateVisualizer);
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  }, [maxDuration, onRecordingComplete, duration]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      }
      setIsPaused(!isPaused);
    }
  }, [isRecording, isPaused]);

  const deleteRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBlob(null);
    setDuration(0);
    setPlaybackProgress(0);
    setIsPlaying(false);
  }, [audioUrl]);

  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleAudioTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setPlaybackProgress(progress);
    }
  }, []);

  const handleAudioEnded = useCallback(() => {
    setIsPlaying(false);
    setPlaybackProgress(0);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Recording State */}
        {!audioUrl && (
          <div className="space-y-4">
            {/* Visualizer */}
            <div className="h-16 flex items-center justify-center gap-1 bg-muted/50 rounded-lg px-4">
              <AnimatePresence>
                {isRecording ? (
                  visualizerData.map((value, index) => (
                    <motion.div
                      key={index}
                      initial={{ height: 4 }}
                      animate={{ height: Math.max(4, value * 48) }}
                      className="w-1.5 bg-primary rounded-full"
                      transition={{ duration: 0.1 }}
                    />
                  ))
                ) : (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mic className="h-5 w-5" />
                    <span className="text-sm">Click to start recording</span>
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Timer */}
            {isRecording && (
              <div className="text-center">
                <span className="text-2xl font-mono font-bold">{formatTime(duration)}</span>
                <span className="text-muted-foreground text-sm ml-2">/ {formatTime(maxDuration)}</span>
              </div>
            )}

            {/* Progress bar */}
            {isRecording && (
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${(duration / maxDuration) * 100}%` }}
                />
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              {!isRecording ? (
                <Button
                  size="lg"
                  className="gap-2 px-8"
                  onClick={startRecording}
                >
                  <Mic className="h-5 w-5" />
                  Start Recording
                </Button>
              ) : (
                <>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={pauseRecording}
                    className="h-12 w-12"
                  >
                    {isPaused ? (
                      <Play className="h-5 w-5" />
                    ) : (
                      <Pause className="h-5 w-5" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={stopRecording}
                    className="h-14 w-14"
                  >
                    <Square className="h-6 w-6" />
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Playback State */}
        {audioUrl && (
          <div className="space-y-4">
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleAudioTimeUpdate}
              onEnded={handleAudioEnded}
            />

            {/* Waveform placeholder */}
            <div className="h-16 flex items-center justify-center gap-0.5 bg-muted/50 rounded-lg px-4">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1 rounded-full transition-all",
                    i < (playbackProgress / 100) * 40
                      ? "bg-primary"
                      : "bg-muted-foreground/30"
                  )}
                  style={{ height: `${Math.random() * 80 + 20}%` }}
                />
              ))}
            </div>

            {/* Duration */}
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{formatTime(Math.round((playbackProgress / 100) * duration))}</span>
              <span>{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <Button
                size="icon"
                variant="outline"
                onClick={deleteRecording}
                className="h-10 w-10 text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                size="icon"
                onClick={togglePlayback}
                className="h-14 w-14"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="h-6 w-6 ml-0.5" />
                )}
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={() => {
                  if (audioBlob) {
                    const a = document.createElement("a");
                    a.href = audioUrl;
                    a.download = `voice-note-${Date.now()}.webm`;
                    a.click();
                  }
                }}
                className="h-10 w-10"
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>

            {/* Re-record */}
            <div className="text-center">
              <Button variant="ghost" size="sm" onClick={deleteRecording}>
                <Mic className="h-4 w-4 mr-2" />
                Record Again
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface VoiceNotePlayerProps {
  audioUrl: string;
  duration: number;
  className?: string;
}

export function VoiceNotePlayer({ audioUrl, duration, className }: VoiceNotePlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlayback = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={cn("flex items-center gap-3 p-3 bg-muted/50 rounded-lg", className)}>
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }
        }}
        onEnded={() => {
          setIsPlaying(false);
          setProgress(0);
        }}
      />
      
      <Button
        size="icon"
        variant="ghost"
        onClick={togglePlayback}
        className="h-8 w-8 flex-shrink-0"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>

      <div className="flex-1 space-y-1">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatTime((progress / 100) * duration)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      <Waves className="h-4 w-4 text-muted-foreground flex-shrink-0" />
    </div>
  );
}
