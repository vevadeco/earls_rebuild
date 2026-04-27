export const metadata = {
  title: "Site Suspended",
};

export default function SuspendedPage() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          backgroundColor: "#f8f9fa",
          color: "#1a1a1a",
        }}
      >
        <div
          style={{
            maxWidth: 520,
            textAlign: "center",
            padding: "2rem",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚠️</div>
          <h1 style={{ fontSize: "1.75rem", marginBottom: "0.75rem" }}>
            Website Suspended
          </h1>
          <p
            style={{
              fontSize: "1.1rem",
              lineHeight: 1.6,
              color: "#555",
              marginBottom: "1.5rem",
            }}
          >
            This website has been temporarily suspended due to non-payment.
            Please get in touch with your technical representative to restart
            your subscription and restore access.
          </p>
          <p style={{ fontSize: "0.9rem", color: "#888" }}>
            We apologize for the inconvenience.
          </p>
        </div>
      </body>
    </html>
  );
}
