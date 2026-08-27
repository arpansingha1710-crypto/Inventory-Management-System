import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
} from "chart.js";
import api from "../api";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  async function load() {
    try {
      const res = await api.get("/reports?days=30");
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load dashboard");
    }
  }

  useEffect(() => { load(); }, []);

  if (error) return <ErrorMessage message={error} />;
  if (!data) return <Loader />;

  const chartData = {
    labels: data.topSales.map((x) => x.name),
    datasets: [{
      label: "Units sold",
      data: data.topSales.map((x) => x.sold)
    }]
  };

  return (
    <div>
      <div className="page-heading">
        <div>
          <h2>Dashboard</h2>
          <p>Last 30 days overview.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Total Products" value={data.productCount} />
        <StatCard label="Stock Units" value={data.totalStockUnits} />
        <StatCard label="Sales Revenue" value={money(data.sales.revenue)} />
        <StatCard label="Low Stock" value={data.lowStock.length} />
      </div>

      <div className="dashboard-grid">
        <div className="panel chart-panel">
          <div className="panel-title">
            <h3>Top Selling Products</h3>
            <span>30 days</span>
          </div>
          {data.topSales.length ? <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} /> : <p className="muted">No sales yet.</p>}
        </div>

        <div className="panel">
          <div className="panel-title">
            <h3>Low Stock Alerts</h3>
            <span>{data.lowStock.length}</span>
          </div>
          {data.lowStock.length === 0 ? (
            <p className="success-text">All products have sufficient stock.</p>
          ) : (
            <div className="list">
              {data.lowStock.slice(0, 6).map((p) => (
                <div className="list-row" key={p._id}>
                  <div>
                    <strong>{p.name}</strong>
                    <small>{p.sku}</small>
                  </div>
                  <span className="badge danger">{p.quantity} / min {p.minimumStock}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-title">
          <h3>Reorder Suggestions</h3>
          <span>Based on recent movement</span>
        </div>
        {data.reorderSuggestions.length === 0 ? (
          <p className="success-text">No reorder suggestions right now.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Product</th><th>Sold</th><th>Current Stock</th><th>Est. Days Left</th><th>Action</th></tr></thead>
              <tbody>
                {data.reorderSuggestions.map((p) => (
                  <tr key={p.productId}>
                    <td><strong>{p.name}</strong><small>{p.sku}</small></td>
                    <td>{p.sold}</td>
                    <td>{p.stock}</td>
                    <td>{p.estimatedDaysLeft ?? "—"}</td>
                    <td><span className="badge warning">Reorder</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
