import React, { useState } from "react";
import api from "../api";
import ErrorMessage from "../components/ErrorMessage";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="brand centered">
          <div className="brand-icon">I</div>
          <div>
            <strong>Inventory</strong>
            <span>Management</span>
          </div>
        </div>

        <h1>Welcome back</h1>
        <p className="muted">Sign in to manage your inventory.</p>

        <ErrorMessage message={error} />

        <form onSubmit={submit} className="form">
          <label>Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>
          <label>Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </label>
          <button className="primary-button" disabled={loading}>
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <div className="demo-box">
          Demo: <strong>admin@example.com</strong> / <strong>admin123</strong>
        </div>
      </div>
    </div>
  );
}
