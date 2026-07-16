import { ImageResponse } from "next/og";

export const alt = "Nebula — compra y renta películas";
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
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "80px",
          background: "#14121C",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -140,
            right: -100,
            width: 560,
            height: 560,
            borderRadius: "50%",
            display: "flex",
            background: "linear-gradient(135deg, #6C4CF5 0%, #E94E92 100%)",
            opacity: 0.55,
            filter: "blur(2px)",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              display: "flex",
              background: "linear-gradient(135deg, #C4B6FF 0%, #6C4CF5 45%, #E94E92 100%)",
            }}
          />
          <div style={{ fontSize: 56, fontWeight: 700, color: "#F5F1EA", letterSpacing: -1.5 }}>
            nebula
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 30,
            color: "rgba(245,241,234,0.75)",
            maxWidth: 720,
          }}
        >
          Compra o renta tus películas favoritas
        </div>
      </div>
    ),
    size
  );
}
