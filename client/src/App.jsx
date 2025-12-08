import { useEffect, useState } from "react";
import "./App.css";

import Navbar from "./components/navbar";
import Login from "./components/login";
import Register from "./components/register";
import Dashboard from "./components/Dashboard";

import { apiGet, apiPost } from "./lib/api";

export default function App() {
  // auth/session state
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  // simple “routing” for this MVP
  const [page, setPage] = useState("auth"); // 'auth' | 'dashboard'
  const [mode, setMode] = useState("login"); // 'login' | 'register'

  // on first load, see if a session already exists
  useEffect(() => {
    (async () => {
      try {
        const me = await apiGet("/auth/me");
        setUser(me);
        setPage("dashboard");
      } catch {
        setUser(null);
        setPage("auth");
      } finally {
        setBooting(false);
      }
    })();
  }, []);

  // callbacks passed to children
  async function handleLoginSuccess() {
    const me = await apiGet("/auth/me");
    setUser(me);
    setPage("dashboard");
  }

  async function handleRegisterSuccess() {
    const me = await apiGet("/auth/me");
    setUser(me);
    setPage("dashboard");
  }

  async function handleLogout() {
    try {
      await apiPost("/auth/logout", {});
    } catch (_) {}
    setUser(null);
    setPage("auth");
  }

  // loading screen while we check session
  if (booting) {
    return (
      <div className="app-shell">
        <Navbar
          setPage={setPage}
          isAuthenticated={!!user}
          onLogout={handleLogout}
        />
        <main className="app-main">
          <div className="loading">Loading…</div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar
        setPage={setPage}
        isAuthenticated={!!user}
        onLogout={handleLogout}
      />

      <main className="app-main">
        {page === "auth" && (
          <div className="auth-container">
            <div className="auth-toggle">
              <button
                className={mode === "login" ? "auth-tab active" : "auth-tab"}
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button
                className={mode === "register" ? "auth-tab active" : "auth-tab"}
                onClick={() => setMode("register")}
              >
                Register
              </button>
            </div>

            {mode === "login" ? (
              <Login onSuccess={handleLoginSuccess} />
            ) : (
              <Register onSuccess={handleRegisterSuccess} />
            )}
          </div>
        )}

        {page === "dashboard" && <Dashboard user={user} />}
      </main>
    </div>
  );
}
