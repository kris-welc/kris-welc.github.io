import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const alt = "Kris Welc";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          backgroundColor: "#0a0908",
          backgroundImage:
            "radial-gradient(ellipse 80% 60% at 20% 15%, rgba(229,162,26,0.16) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 85% 85%, rgba(197,42,42,0.12) 0%, transparent 55%)",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 26,
            letterSpacing: 6,
            color: "#e5a21a",
          }}
        >
          KRIS WELC
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div
            style={{
              display: "flex",
              fontSize: 92,
              fontWeight: 700,
              color: "#ede6d4",
              letterSpacing: -2,
            }}
          >
            Field notes that hold up
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 34,
              color: "#c9bc9e",
              maxWidth: 900,
              lineHeight: 1.35,
            }}
          >
            AI agents and adaptive systems outside the demo. Patterns, numbers,
            and setups you can reuse.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            fontSize: 24,
            color: "#8a8071",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 60,
              height: 3,
              background: "#e5a21a",
            }}
          />
          kris-welc.github.io
        </div>
      </div>
    ),
    size
  );
}
