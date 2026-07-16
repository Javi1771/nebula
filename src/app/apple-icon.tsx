import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon: the two overlapping brand blocks over deep-ocean ink. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0f2d3c",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 40,
            width: 62,
            height: 62,
            borderRadius: 16,
            background: "#ffffff",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 40,
            right: 40,
            width: 62,
            height: 62,
            borderRadius: 16,
            background: "#1ebe91",
            display: "flex",
          }}
        />
      </div>
    ),
    size
  );
}
