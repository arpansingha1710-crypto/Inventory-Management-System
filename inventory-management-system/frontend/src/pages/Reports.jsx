import React, { useEffect, useState } from "react";
import api from "../api";
import StatCard from "../components/StatCard";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

const money = (n) => `₹${Number(n || 0).toLocaleString("en-IN", {maximumFractionDigits:2})}`;

export default function Reports() {
  const [days,setDays]=useState(30);
  const [data,setData]=useState(null);
  const [error,setError]=useState("");

  useEffect(()=>{setData(null); api.get(`/reports?days=${days}`).then(r=>setData(r.data)).catch(e=>setError(e.response?.data?.message||"Could not load reports"))},[days]);

  if(error) return <ErrorMessage message={error}/>;
  if(!data) return <Loader/>;

  return <div>
    <div className="page-heading"><div><h2>Reports</h2><p>Business and inventory summary.</p></div><select className="period-select" value={days} onChange={e=>setDays(e.target.value)}><option value="7">Last 7 days</option><option value="30">Last 30 days</option><option value="90">Last 90 days</option><option value="365">Last 365 days</option></select></div>

    <div className="stats-grid">
      <StatCard label="Sales Revenue" value={money(data.sales.revenue)} hint={`${data.sales.units} units sold`}/>
      <StatCard label="Purchase Cost" value={money(data.purchases.cost)} hint={`${data.purchases.units} units purchased`}/>
      <StatCard label="Stock Value" value={money(data.stockValue)} hint={`${data.totalStockUnits} units in stock`}/>
      <StatCard label="Low Stock Items" value={data.lowStock.length}/>
    </div>

    <div className="panel"><div className="panel-title"><h3>Top Selling Products</h3><span>{days} days</span></div>
      <div className="table-wrap"><table><thead><tr><th>Product</th><th>Units Sold</th><th>Revenue</th><th>Current Stock</th></tr></thead><tbody>
        {data.topSales.map(p=><tr key={p.productId}><td><strong>{p.name}</strong><small>{p.sku}</small></td><td>{p.sold}</td><td>{money(p.revenue)}</td><td>{p.stock}</td></tr>)}
        {!data.topSales.length&&<tr><td colSpan="4" className="empty">No sales in this period.</td></tr>}
      </tbody></table></div>
    </div>

    <div className="panel"><div className="panel-title"><h3>Reorder Suggestions</h3><span>Basic demand-based rule</span></div>
      <div className="table-wrap"><table><thead><tr><th>Product</th><th>Sold</th><th>Stock</th><th>Daily Rate</th><th>Estimated Days Left</th></tr></thead><tbody>
      {data.reorderSuggestions.map(p=><tr key={p.productId}><td><strong>{p.name}</strong></td><td>{p.sold}</td><td>{p.stock}</td><td>{p.dailyRate}</td><td>{p.estimatedDaysLeft ?? "—"}</td></tr>)}
      {!data.reorderSuggestions.length&&<tr><td colSpan="5" className="empty">No reorder suggestions.</td></tr>}
      </tbody></table></div>
    </div>
  </div>
}
