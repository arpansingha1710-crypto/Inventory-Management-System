import React, { useEffect, useState } from "react";
import api from "../api";
import Modal from "../components/Modal";
import ErrorMessage from "../components/ErrorMessage";
import Loader from "../components/Loader";

export default function Sales() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ product:"", quantity:1, sellingPrice:0, customerName:"", date:new Date().toISOString().slice(0,10), note:"" });
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try {
      const [s,p] = await Promise.all([api.get("/sales"), api.get("/products")]);
      setItems(s.data); setProducts(p.data);
    } catch(err) { setError(err.response?.data?.message || "Could not load sales"); }
  }
  useEffect(()=>{load()},[]);

  function add() {
    const p=products[0];
    setForm({product:p?._id||"", quantity:1, sellingPrice:p?.sellingPrice||0, customerName:"", date:new Date().toISOString().slice(0,10), note:""});
    setError(""); setOpen(true);
  }

  function changeProduct(id) {
    const p=products.find(x=>x._id===id);
    setForm({...form, product:id, sellingPrice:p?.sellingPrice||0});
  }

  async function save(e) {
    e.preventDefault();
    try {
      await api.post("/sales", {...form, quantity:Number(form.quantity), sellingPrice:Number(form.sellingPrice)});
      setOpen(false); load();
    } catch(err) { setError(err.response?.data?.message || "Could not record sale"); }
  }

  if (!products.length && !error) return <Loader />;

  return <div>
    <div className="page-heading"><div><h2>Sales</h2><p>Record products sold to customers.</p></div><button className="primary-button" onClick={add} disabled={!products.length}>+ New Sale</button></div>
    <ErrorMessage message={error}/>
    <div className="panel"><div className="table-wrap"><table>
      <thead><tr><th>Date</th><th>Product</th><th>Customer</th><th>Quantity</th><th>Price</th><th>Total</th></tr></thead>
      <tbody>{items.map(x=><tr key={x._id}><td>{new Date(x.date).toLocaleDateString()}</td><td><strong>{x.product?.name}</strong><small>{x.product?.sku}</small></td><td>{x.customerName||"Walk-in"}</td><td>{x.quantity}</td><td>₹{x.sellingPrice}</td><td>₹{x.totalAmount.toLocaleString("en-IN")}</td></tr>)}</tbody>
    </table></div></div>

    {open && <Modal title="Record Sale" onClose={()=>setOpen(false)}>
      <form className="form" onSubmit={save}>
        <label>Product<select required value={form.product} onChange={e=>changeProduct(e.target.value)}>{products.map(p=><option key={p._id} value={p._id}>{p.name} — {p.quantity} available</option>)}</select></label>
        <div className="form-grid"><label>Quantity<input type="number" min="1" required value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})}/></label><label>Selling Price<input type="number" min="0" step="0.01" required value={form.sellingPrice} onChange={e=>setForm({...form,sellingPrice:e.target.value})}/></label></div>
        <label>Customer Name<input value={form.customerName} onChange={e=>setForm({...form,customerName:e.target.value})}/></label>
        <label>Date<input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})}/></label>
        <label>Note<textarea value={form.note} onChange={e=>setForm({...form,note:e.target.value})}/></label>
        <div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setOpen(false)}>Cancel</button><button className="primary-button">Save Sale</button></div>
      </form>
    </Modal>}
  </div>
}
