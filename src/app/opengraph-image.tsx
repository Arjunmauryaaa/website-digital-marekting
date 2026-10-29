import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const alt = `${site.name}: digital marketing and website development`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg,#0B1020 55%,#2b3bd9)", color: "#fff", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 40, fontWeight: 700 }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: "linear-gradient(135deg,#5267FF,#4DE2D0)", display: "flex", alignItems: "center", justifyContent: "center", color: "#0B1020" }}>{site.name.charAt(0).toUpperCase()}</div>
          {site.name}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 74, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2, maxWidth: 980 }}>Build a stronger digital presence.</div>
          <div style={{ fontSize: 30, color: "#a9b2c6" }}>Digital marketing and website development, working worldwide.</div>
        </div>
      </div>
    ),
    size,
  );
}
