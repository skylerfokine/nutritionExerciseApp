import React from "react";

// Top nav with Dashboard, Profile, and Login/Register
export default function Navbar({ setPage, isAuthenticated }) {
  const handleClick = (target) => {
    if (setPage) setPage(target);
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <span style={styles.brand}>nutrifit</span>

        <button
          type="button"
          style={styles.linkButton}
          onClick={() => handleClick("dashboard")}
        >
          Dashboard
        </button>

        <button
          type="button"
          style={styles.linkButton}
          onClick={() => handleClick("profile")}
        >
          Profile
        </button>
      </div>

      <div style={styles.right}>
        <button
          type="button"
          style={styles.authButton}
          onClick={() => handleClick("auth")}
        >
          Login / Register
        </button>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "56px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 16px",
    // darker, spacey gradient instead of pure white
    backgroundImage:
      "radial-gradient(circle at 0% 0%, #1d4ed8 0, #020617 40%, #020617 100%)",
    borderBottom: "1px solid #1f2937",
    zIndex: 1000,
    boxSizing: "border-box",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.45)",
    color: "#e5e7eb",
  },
  left: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  brand: {
    fontWeight: 800,
    fontSize: "1.05rem",
    marginRight: "8px",
    letterSpacing: "0.08em",
    textTransform: "uppercase",
    color: "#e5e7eb",
  },
  linkButton: {
    border: "none",
    backgroundColor: "transparent",
    padding: "6px 10px",
    borderRadius: "999px",
    cursor: "pointer",
    fontSize: "0.9rem",
    color: "#e5e7eb",
    transition: "background-color 0.15s ease, color 0.15s ease, transform 0.1s",
  },
  authButton: {
    backgroundColor: "#0ea5e9",
    color: "#0b1120",
    border: "none",
    borderRadius: "999px",
    padding: "6px 14px",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 600,
    boxShadow: "0 6px 15px rgba(14, 165, 233, 0.5)",
  },
};
