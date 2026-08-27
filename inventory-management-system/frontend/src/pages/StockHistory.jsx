import React, { useEffect, useState } from "react";
import api from "../api";
import Loader from "../components/Loader";
import ErrorMessage from "../components/ErrorMessage";

export default function StockHistory() {
  const [items,setItems]=useState([]);
  const [error,setError]=useState("");

  useEffect(()=>{api.get("/stock-history").then(r=>setItems(r.data)).catch(e=>setError(e.response?.data?.message||"Could not load history"))},[]);

  if(error) return <ErrorMessage message={error}/>;
  if(!items) return <Loader/>;

  return <div>
    <div className="page-heading"><div><h2>Stock History</h2><p>Track every stock movement.</p></div></div>
    <div className="panel"><div className="table-wrap"><table>
      <thead><tr><th>Date</th><th>Product</th><th>Type</th><th>Quantity</th><th>Before</th><th>After</th><th>Reference</th></tr></thead>
      <tbody>{items.map(x=><tr key={x._id}><td>{new Date(x.createdAt).toLocaleString()}</td><td><strong>{x.product?.name}</strong><small>{x.product?.sku}</small></td><td><span className={`badge ${x.type==="IN"?"success":"danger"}`}>{x.type}</span></td><td>{x.quantity}</td><td>{x.previousStock}</td><td>{x.newStock}</td><td>{x.referenceType}</td></tr>)}</tbody>
    </table></div></div>
  </div>
}
