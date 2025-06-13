import React from "react";

function GlobalLoader() {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(255,255,255,0.7)",
      zIndex: 9999,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "2rem",
      color: "#C01722",
      fontWeight: "bold"
    }}>
      Getting data from server...
    </div>
  );
}

export default GlobalLoader;