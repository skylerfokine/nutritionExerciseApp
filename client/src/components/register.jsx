import React, { useState } from "react";

export default function Register({ onSuccess }) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Register data:", formData);

    // TODO: plug in real registration API here
    if (onSuccess) {
      onSuccess(formData);
    }
  };

  return (
    <div style={styles.wrapper}>
      <form style={styles.form} onSubmit={handleSubmit}>
        <h2 style={styles.title}>Create your account</h2>

        <label style={styles.label}>
          Username
          <input
            style={styles.input}
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
        </label>

        <label style={styles.label}>
          Email
          <input
            style={styles.input}
            type="email"
            name="email"
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
            value={formData.password}
            onChange={handleChange}
            required
          />
        </label>

        <button style={styles.button} type="submit">
          Register
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
    boxShadow: "0 18px 40px rgba(0, 0, 0, 0.7)",
  },
  title: {
    marginTop: 0,
    marginBottom: "1.5rem",
    textAlign: "center",
  },
  label: {
    display: "block",
    fontSize: "0.9rem",
    marginBottom: "1rem",
  },
  input: {
    width: "100%",
    padding: "8px 10px",
    marginTop: "4px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "16px",
  },
  button: {
    width: "100%",
    padding: "10px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "#000",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
};
