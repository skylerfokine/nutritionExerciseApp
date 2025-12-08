import React, { useState } from "react";
import { apiPost, apiGet } from "../lib/api";

export default function Login({ onSuccess }) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiPost("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      const me = await apiGet("/auth/me");
      onSuccess?.(me);
    } catch (err) {
      setError(err?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Log in</h2>

        <label style={styles.label}>
          Email
          <input
            style={styles.input}
            type="email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>

        <label style={styles.label}>
          Password
          <input
            style={styles.input}
            type="password"
            name="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>

        {error && <div style={styles.error}>{error}</div>}

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    padding: "2rem 1.5rem 3rem",
  },
  form: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    padding: "2rem",
    borderRadius: "12px",
    border: "1px solid #444",
    minWidth: "280px",
    maxWidth: "360px",
    width: "100%",
    color: "#f9fafb",
  },
  title: { margin: 0, marginBottom: "1rem", fontSize: "1.25rem" },
  label: {
    display: "block",
    marginBottom: "0.75rem",
    fontSize: "0.95rem",
  },
  input: {
    marginTop: "0.35rem",
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #555",
    background: "rgba(2,6,23,.7)",
    color: "#f9fafb",
    outline: "none",
  },
  button: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#0ea5e9",
    color: "#001018",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "0.5rem",
  },
  error: {
    background: "rgba(239,68,68,.15)",
    border: "1px solid rgba(239,68,68,.35)",
    color: "#fecaca",
    padding: "8px 10px",
    borderRadius: "6px",
    margin: "0.5rem 0",
    fontSize: "0.9rem",
  },
};
