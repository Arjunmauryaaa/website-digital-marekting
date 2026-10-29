import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 16, background: "linear-gradient(135deg,#5267FF,#4DE2D0)", color: "#0B1020", fontSize: 40, fontWeight: 800 }}>
        {site.name.trim().charAt(0).toUpperCase()}
      </div>
    ),
    size,
  );
}
