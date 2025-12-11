import React from "react";

export default function Navbar({ setPage, isAuthenticated, onLogout }) {
  return (
    <header style={styles.nav}>
      <div style={styles.left}>
        <button
          style={styles.brand}
          onClick={() =>
            setPage && setPage(isAuthenticated ? "dashboard" : "auth")
          }
          title="Home"
        >
          FitTrack
        </button>
      </div>

      <div style={styles.right}>
        <button
          style={styles.link}
          onClick={() => setPage && setPage("dashboard")}
          disabled={!isAuthenticated}
          title={isAuthenticated ? "Go to Dashboard" : "Login first"}
        >
          Dashboard
        </button>

        {!isAuthenticated ? (
          <button
            style={styles.auth}
            onClick={() => setPage && setPage("auth")}
            title="Login or Register"
          >
            Login / Register
          </button>
        ) : (
          <button style={styles.auth} onClick={onLogout} title="Sign out">
            Logout
          </button>
        )}
        {/* NEW: Leaderboards (public) */}
        <button
          style={styles.link}
          onClick={() => setPage && setPage("leaderboards")}
          title="See top users & popular exercises"
        >
          Leaderboards
        </button>
      </div>
    </header>
  );
}

const styles = {
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 16px",
    background: "rgba(2,6,23,.7)",
    borderBottom: "1px solid #1f2a37",
    backdropFilter: "blur(8px)",
  },
  left: { display: "flex", alignItems: "center", gap: 8 },
  right: { display: "flex", alignItems: "center", gap: 8 },
  brand: {
    fontWeight: 800,
    fontSize: "1.05rem",
    color: "#e5e7eb",
    background: "transparent",
    border: "none",
    cursor: "pointer",
  },
  link: {
    padding: "8px 10px",
    borderRadius: 8,
    background: "rgba(30,41,59,.6)",
    color: "#e5e7eb",
    border: "1px solid #334155",
    cursor: "pointer",
  },
  auth: {
    padding: "8px 10px",
    borderRadius: 8,
    background: "#0ea5e9",
    color: "#001018",
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
  },
};
