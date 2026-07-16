import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/** Favicon: the two overlapping brand blocks (ink + emerald) from Logo.tsx. */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0f2d3c",
          borderRadius: 8,
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 5,
            left: 5,
            width: 13,
            height: 13,
            borderRadius: 4,
            background: "#ffffff",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 5,
            right: 5,
            width: 13,
            height: 13,
            borderRadius: 4,
            background: "#1ebe91",
            display: "flex",
          }}
        />
      </div>
    ),
    size
  );
}
