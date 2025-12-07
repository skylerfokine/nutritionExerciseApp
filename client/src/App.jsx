import { useState } from "react";
import "./App.css";
import Navbar from "./components/navbar";
import Login from "./components/login";
import Register from "./components/register";
import Dashboard from "./components/Dashboard";

// basic stub user, will be overridden after login/register
const defaultUser = {
  id: "user-12345",
  username: "DemoUser",
  email: "demo@example.com",
  avatarUrl: "",
};

function App() {
  // "auth" = login/register screen, "dashboard" = main app
  const [pageInternal, setPageInternal] = useState("auth");
  const [user, setUser] = useState(defaultUser);

  const isAuthenticated = pageInternal === "dashboard";

  // wrapper so Navbar can still call setPage("home" | "login" | "register")
  const setPage = (target) => {
    if (target === "home" || target === "dashboard") {
      setPageInternal("dashboard");
    } else if (target === "login" || target === "register" || target === "auth") {
      setPageInternal("auth");
    } else {
      setPageInternal(target);
    }
  };

  const handleAuthSuccess = (authUser) => {
    // merge new info with existing user object
    setUser((prev) => ({
      ...prev,
      ...authUser,
    }));
    setPageInternal("dashboard");
  };

  const handleUserUpdate = (partial) => {
    setUser((prev) => ({ ...prev, ...partial }));
  };

  return (
    <div className="app-shell">
      <Navbar setPage={setPage} isAuthenticated={isAuthenticated} />

      <main className="app-main">
        {pageInternal === "auth" && (
          <AuthScreen onAuthSuccess={handleAuthSuccess} />
        )}

        {pageInternal === "dashboard" && (
          <Dashboard user={user} onUserUpdate={handleUserUpdate} />
        )}
      </main>
    </div>
  );
}

function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // "login" | "register"

  const handleLoginSuccess = (formData) => {
    const u = {
      id: "user-12345",
      username: formData.email?.split("@")[0] || "User",
      email: formData.email,
    };
    onAuthSuccess(u);
  };

  const handleRegisterSuccess = (formData) => {
    const u = {
      id: "user-12345",
      username: formData.username,
      email: formData.email,
    };
    onAuthSuccess(u);
  };

  return (
    <div className="auth-screen">
      <div className="auth-toggle">
        <button
          type="button"
          className={`auth-tab ${mode === "login" ? "auth-tab--active" : ""}`}
          onClick={() => setMode("login")}
        >
          Login
        </button>
        <button
          type="button"
          className={`auth-tab ${mode === "register" ? "auth-tab--active" : ""}`}
          onClick={() => setMode("register")}
        >
          Register
        </button>
      </div>

      {/* We reuse your existing Login / Register components, just with a callback */}
      {mode === "login" ? (
        <Login onSuccess={handleLoginSuccess} />
      ) : (
        <Register onSuccess={handleRegisterSuccess} />
      )}
    </div>
  );
}

export default App;
