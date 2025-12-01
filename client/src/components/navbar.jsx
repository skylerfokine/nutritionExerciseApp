import React from 'react';

//creates navigation bar at the top of the screen
export default function Navbar({setPage}) {
    return (
        <nav style={styles.nav}>
            <div style={styles.left}>
                <button style={styles.linkButton}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#ddd")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#fff")}
                  onClick={() => setPage("home")}
                >
                  Dashboard
                </button>
                <button style={styles.linkButton}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#ddd")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#fff")}
                >
                  Friends
                </button>
            </div>

            <div style={styles.right}>
                <button style={styles.authButton}  
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#ddd")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#fff")}
                  onClick={() => setPage("login")}
                >               
                  Login
                </button>
                <button style={styles.authButton}  
                  onMouseEnter={(e) => (e.target.style.backgroundColor = "#ddd")}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = "#fff")}
                  onClick={() => setPage("register")}
                >
                  Register
                </button>
            </div>
        </nav>
    );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#000",   // black background
    borderBottom: "1px solid #444",
    width: "100%",  //spans full width of page
    position: "fixed",  //fixed at top
    top: 0, //at the very top
    left: 0,
    zIndex: 1000,
    boxSizing: "border-box",
  },
  left: {
    display: "flex",
    gap: "10px",
  },
  right: {
    display: "flex",
    gap: "10px",
  },
  linkButton: {
    backgroundColor: "#fff",  // white button
    color: "#000",            // black text
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.2s",
  },
  authButton: {
    backgroundColor: "#fff",  // white button
    color: "#000",            // black text
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "0.2s",
  },
};

