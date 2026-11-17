import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const alt = `${site.name} — ${site.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "76px",
          background: "linear-gradient(135deg, #050507 0%, #0b1220 58%, #050507 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "6px", height: "42px" }}>
            {[18, 30, 42, 26, 14].map((height, index) => (
              <div
                key={index}
                style={{ width: "7px", height: `${height}px`, borderRadius: "4px", background: "#2f80ff", display: "flex" }}
              />
            ))}
          </div>
          <div style={{ display: "flex", fontSize: "40px", fontWeight: 800, letterSpacing: "-1px" }}>
            vibe<span style={{ color: "#2f80ff" }}>shift</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
          <div style={{ display: "flex", fontSize: "68px", fontWeight: 700, lineHeight: 1.06, letterSpacing: "-2.5px", maxWidth: "930px" }}>
            Cape Town&apos;s event crew, side by side.
          </div>
          <div style={{ display: "flex", fontSize: "30px", color: "#a9b6c8", maxWidth: "900px", lineHeight: 1.4 }}>
            Compare DJs, sound engineers, lighting crews, photographers, videographers and venues by rate, availability and gear.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "24px", color: "#7f8ea3" }}>
          <span style={{ display: "flex" }}>vibeshift.co.za</span>
          <span style={{ display: "flex" }}>Cape Town · Western Cape</span>
        </div>
      </div>
    ),
    size,
  );
}
