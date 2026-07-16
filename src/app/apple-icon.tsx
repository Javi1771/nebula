import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#14121C",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 118,
            height: 118,
            borderRadius: "50%",
            display: "flex",
            background: "linear-gradient(135deg, #C4B6FF 0%, #6C4CF5 45%, #E94E92 100%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 22,
              right: 18,
              width: 14,
              height: 14,
              borderRadius: "50%",
              background: "#ffffff",
              opacity: 0.9,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 26,
              left: 24,
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#ffffff",
              opacity: 0.55,
              display: "flex",
            }}
          />
        </div>
      </div>
    ),
    size
  );
}
