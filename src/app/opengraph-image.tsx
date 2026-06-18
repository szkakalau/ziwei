import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const alt = "DestinyBlueprint — Daily Zi Wei Dou Shu Horoscopes";
export const contentType = "image/png";
export const runtime = "edge";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0c0c14",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Top gold accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, transparent 0%, #d4a843 50%, transparent 100%)",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 20,
            position: "relative",
            zIndex: 10,
          }}
        >
          {/* Compass icon (CSS-drawn simplified compass) */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "2px solid rgba(212, 168, 67, 0.3)",
              background: "rgba(212, 168, 67, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              color: "#d4a843",
            }}
          >
            DB
          </div>

          {/* Brand name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#e8e4f0",
              letterSpacing: "-0.02em",
            }}
          >
            DestinyBlueprint
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 28,
              color: "rgba(212, 168, 67, 0.85)",
              letterSpacing: "0.02em",
            }}
          >
            Daily Zi Wei Dou Shu Horoscopes
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 20,
              color: "rgba(180, 175, 200, 0.6)",
              marginTop: 8,
              fontFamily: "sans-serif",
            }}
          >
            Personalized readings based on your exact birth chart
          </div>
        </div>

        {/* URL at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 32,
            fontSize: 18,
            color: "rgba(180, 175, 200, 0.35)",
            fontFamily: "monospace",
          }}
        >
          destinyblueprint.xyz
        </div>
      </div>
    ),
    { ...size }
  );
}
