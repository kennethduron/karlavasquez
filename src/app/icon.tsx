import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "3px solid #cf922b",
        borderRadius: "50%",
        background: "#031b36",
        color: "#f7ead0",
        fontFamily: "Georgia, serif",
        fontSize: 22,
        letterSpacing: 2,
      }}
    >
      KNV
    </div>,
    size,
  );
}
