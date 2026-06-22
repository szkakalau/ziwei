"use client";

import { useRef, useState, useCallback } from "react";
import { Download } from "lucide-react";
import { formatStarName } from "@/lib/zwdsNaming";

interface ShareCardProps {
  horoscopeText: string;
  highlightedStars: string[];
  date: string;
  streak: number;
}

export function ShareCard({ horoscopeText, highlightedStars, date, streak }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);

  const generateImage = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Canvas dimensions (Instagram story ratio)
    canvas.width = 1080;
    canvas.height = 1350;

    // Dark background
    ctx.fillStyle = "#0a0a0f";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle radial gradient
    const gradient = ctx.createRadialGradient(540, 200, 0, 540, 1350, 1200);
    gradient.addColorStop(0, "rgba(251, 191, 36, 0.06)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Top: date
    ctx.fillStyle = "rgba(251, 191, 36, 0.5)";
    ctx.font = "400 28px system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(date, 540, 80);

    // Streak badge
    if (streak > 0) {
      ctx.fillStyle = "rgba(251, 191, 36, 0.35)";
      ctx.font = "500 22px system-ui, sans-serif";
      ctx.fillText(`🔥 Day ${streak}`, 540, 120);
    }

    // Divider line
    ctx.strokeStyle = "rgba(251, 191, 36, 0.12)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(340, 150);
    ctx.lineTo(740, 150);
    ctx.stroke();

    // Horoscope text
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.font = "400 36px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";

    // Wrap text honoring paragraph breaks (\n). Canvas fillText ignores
    // newlines, so split into paragraphs first, then word-wrap each.
    const paragraphs = horoscopeText.split(/\n+/);
    let line = "";
    let y = 220;
    const lineHeight = 52;
    const maxWidth = 800;

    for (const para of paragraphs) {
      const words = para.split(" ");
      for (const word of words) {
        if (y > 1280) break; // Overflow guard
        const testLine = line ? `${line} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line) {
          ctx.fillText(line, 540, y);
          line = word;
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      // Flush the last line of this paragraph, then advance for the next.
      if (line && y <= 1280) {
        ctx.fillText(line, 540, y);
        y += lineHeight;
      }
      line = "";
      if (y > 1280) break;
    }

    // Stars section
    y += 80;
    ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
    ctx.font = "400 20px system-ui, sans-serif";
    ctx.fillText("Today's Stars", 540, y);

    y += 50;
    ctx.fillStyle = "rgba(251, 191, 36, 0.7)";
    ctx.font = "500 26px system-ui, sans-serif";
    const starText = highlightedStars.slice(0, 3).map((s) => formatStarName(s)).join("  ·  ");
    ctx.fillText(starText, 540, y);

    // Bottom branding
    ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
    ctx.font = "400 20px system-ui, sans-serif";
    ctx.fillText("DestinyBlueprint — Zi Wei Dou Shu Daily", 540, 1300);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/png");
    });
  }, [horoscopeText, highlightedStars, date, streak]);

  const handleShare = async () => {
    setGenerating(true);
    try {
      const blob = await generateImage();
      if (!blob) return;

      const file = new File([blob], "destinyblueprint-horoscope.png", { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: "My Zi Wei Dou Shu Daily Horoscope",
          text: horoscopeText.slice(0, 100) + "...",
          files: [file],
        });
      } else if (navigator.share) {
        await navigator.share({
          title: "My Zi Wei Dou Shu Daily Horoscope",
          text: horoscopeText.slice(0, 200) + "...",
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "destinyblueprint-horoscope.png";
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch {
      // User cancelled share — ignore
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      {/* Hidden canvas for rendering */}
      <canvas ref={canvasRef} className="hidden" />

      <button
        onClick={handleShare}
        disabled={generating}
        className="flex items-center gap-2 px-5 py-3 rounded-xl
                   border border-amber-500/15 text-amber-300/70 text-sm
                   hover:border-amber-500/30 hover:text-amber-200
                   disabled:opacity-40 transition-colors"
      >
        {generating ? (
          <>
            <span className="h-4 w-4 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
            Generating...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Share as image
          </>
        )}
      </button>
    </>
  );
}
