import { ImageResponse } from "next/og";

export const alt = "Karla Norin Vásquez — Bufete Legal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        alignItems: "center",
        background: "#031b36",
        color: "#fffdf7",
        padding: "72px 88px",
        fontFamily: "Georgia, serif",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 420,
          height: 420,
          border: "2px solid rgba(207,146,43,.42)",
          borderRadius: 210,
          right: -70,
          top: -80,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 290,
          height: 290,
          border: "1px solid rgba(255,255,255,.14)",
          borderRadius: 145,
          right: 35,
          top: -15,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: 900,
          gap: 26,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            color: "#e0ad54",
            fontFamily: "Arial, sans-serif",
            fontSize: 24,
            letterSpacing: 6,
            textTransform: "uppercase",
          }}
        >
          <span style={{ width: 68, height: 2, background: "#cf922b" }} />
          Bufete Legal
        </div>
        <div style={{ display: "flex", fontSize: 76, lineHeight: 1.05 }}>
          Karla Norin Vásquez
        </div>
        <div
          style={{
            display: "flex",
            fontFamily: "Arial, sans-serif",
            fontSize: 31,
            lineHeight: 1.45,
            color: "#dbe5ee",
          }}
        >
          Asesoría legal con honestidad, confiabilidad y precisión.
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 88,
          right: 88,
          bottom: 52,
          height: 1,
          background: "linear-gradient(90deg, #cf922b, rgba(207,146,43,0))",
        }}
      />
    </div>,
    size,
  );
}
