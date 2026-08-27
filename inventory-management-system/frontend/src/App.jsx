import React, { useEffect, useState } from "react";
import { Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import api from "./api";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Suppliers from "./pages/Suppliers";
import Purchases from "./pages/Purchases";
import Sales from "./pages/Sales";
import StockHistory from "./pages/StockHistory";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Login from "./pages/Login";

const navItems = [
  ["Dashboard", "/"],
  ["Products", "/products"],
  ["Suppliers", "/suppliers"],
  ["Purchases", "/purchases"],
  ["Sales", "/sales"],
  ["Stock History", "/stock-history"],
  ["Reports", "/reports"],
  ["Profile", "/profile"]
];

function ProtectedLayout({ user, onLogout }) {
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">I</div>
          <div>
            <strong>Inventory</strong>
            <span>Management</span>
          </div>
        </div>

        <nav>
          {navItems.map(([label, path]) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}
              end={path === "/"}
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <button className="logout-button" onClick={onLogout}>Logout</button>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <h1>Inventory Management System</h1>
            <p>Monitor products, stock, purchases and sales.</p>
          </div>
          <div className="user-chip">
            <span className="avatar">{user?.name?.[0]?.toUpperCase() || "A"}</span>
            <div>
              <strong>{user?.name}</strong>
              <small>{user?.email}</small>
            </div>
          </div>
        </header>

        <section className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/suppliers" element={<Suppliers />} />
            <Route path="/purchases" element={<Purchases />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/stock-history" element={<StockHistory />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile onUserChange={(u) => {
              localStorage.setItem("user", JSON.stringify(u));
              navigate("/profile");
            }} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </section>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) setUser(null);
  }, []);

  if (!user) {
    return <Routes><Route path="*" element={<Login onLogin={setUser} />} /></Routes>;
  }

  return <ProtectedLayout user={user} onLogout={logout} />;
}
