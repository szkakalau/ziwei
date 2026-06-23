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
          background: "#FBF9F6",
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
        {/* Top indigo accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "linear-gradient(90deg, transparent 0%, #3730A3 50%, transparent 100%)",
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
          {/* Compass icon */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              border: "2px solid rgba(55, 48, 163, 0.25)",
              background: "rgba(55, 48, 163, 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 32,
              color: "#3730A3",
            }}
          >
            DB
          </div>

          {/* Brand name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#1C1C1C",
              letterSpacing: "-0.02em",
            }}
          >
            DestinyBlueprint.xyz
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 28,
              color: "#3730A3",
              letterSpacing: "0.02em",
            }}
          >
            Daily Zi Wei Dou Shu Horoscopes
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 20,
              color: "rgba(0, 0, 0, 0.45)",
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
            color: "rgba(0, 0, 0, 0.25)",
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
