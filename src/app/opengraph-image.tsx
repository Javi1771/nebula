import { ImageResponse } from "next/og";

export const alt = "Nébula — compra y renta películas";
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
          background: "#0f2d3c",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -160,
            right: -120,
            width: 560,
            height: 560,
            borderRadius: "50%",
            display: "flex",
            background: "linear-gradient(135deg, #1ebe91 0%, #41cff0 100%)",
            opacity: 0.4,
            filter: "blur(4px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -200,
            left: -100,
            width: 480,
            height: 480,
            borderRadius: "50%",
            display: "flex",
            background: "linear-gradient(135deg, #005073 0%, #005546 100%)",
            opacity: 0.6,
            filter: "blur(4px)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <div style={{ position: "relative", width: 84, height: 84, display: "flex" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "#ffffff",
                display: "flex",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: 0,
                right: 0,
                width: 52,
                height: 52,
                borderRadius: 14,
                background: "#1ebe91",
                display: "flex",
              }}
            />
          </div>
          <div style={{ fontSize: 60, fontWeight: 700, color: "#eef3f5", letterSpacing: -1.5 }}>
            Nébula
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 36,
            fontSize: 30,
            color: "rgba(200,210,215,0.8)",
            maxWidth: 720,
          }}
        >
          Compra o renta tus películas y series favoritas
        </div>
      </div>
    ),
    size
  );
}
