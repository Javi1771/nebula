import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 8,
        }}
      >
        <div
          style={{
            width: 22,
            height: 22,
            borderRadius: "50%",
            display: "flex",
            background: "linear-gradient(135deg, #C4B6FF 0%, #6C4CF5 45%, #E94E92 100%)",
          }}
        />
      </div>
    ),
    size
  );
}
