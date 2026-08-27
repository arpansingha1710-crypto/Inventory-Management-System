import React, { useEffect, useState } from "react";
import api from "../api";
import Modal from "../components/Modal";
import ErrorMessage from "../components/ErrorMessage";
import Loader from "../components/Loader";

const empty = { name: "", phone: "", email: "", address: "" };

export default function Suppliers() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    try { setItems((await api.get("/suppliers")).data); }
    catch (err) { setError(err.response?.data?.message || "Could not load suppliers"); }
  }
  useEffect(() => { load(); }, []);

  function add() { setEditing(null); setForm(empty); setError(""); setOpen(true); }
  function edit(x) { setEditing(x._id); setForm({ name:x.name, phone:x.phone, email:x.email, address:x.address }); setError(""); setOpen(true); }

  async function save(e) {
    e.preventDefault();
    try {
      if (editing) await api.put(`/suppliers/${editing}`, form);
      else await api.post("/suppliers", form);
      setOpen(false); load();
    } catch (err) { setError(err.response?.data?.message || "Could not save supplier"); }
  }

  async function remove(id) {
    if (!confirm("Delete this supplier?")) return;
    try { await api.delete(`/suppliers/${id}`); load(); }
    catch (err) { setError(err.response?.data?.message || "Could not delete supplier"); }
  }

  if (!items && !error) return <Loader />;

  return (
    <div>
      <div className="page-heading"><div><h2>Suppliers</h2><p>Manage supplier information.</p></div><button className="primary-button" onClick={add}>+ Add Supplier</button></div>
      <ErrorMessage message={error} />
      <div className="panel">
        <div className="table-wrap"><table>
          <thead><tr><th>Supplier</th><th>Phone</th><th>Email</th><th>Address</th><th>Actions</th></tr></thead>
          <tbody>{items.map(x => <tr key={x._id}><td><strong>{x.name}</strong></td><td>{x.phone || "—"}</td><td>{x.email || "—"}</td><td>{x.address || "—"}</td><td className="actions"><button className="secondary-button" onClick={() => edit(x)}>Edit</button><button className="danger-button" onClick={() => remove(x._id)}>Delete</button></td></tr>)}</tbody>
        </table></div>
      </div>

      {open && <Modal title={editing ? "Edit Supplier" : "Add Supplier"} onClose={() => setOpen(false)}>
        <form className="form" onSubmit={save}>
          <label>Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label>
          <label>Phone<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label>
          <label>Email<input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label>
          <label>Address<textarea value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label>
          <div className="modal-actions"><button type="button" className="secondary-button" onClick={()=>setOpen(false)}>Cancel</button><button className="primary-button">Save Supplier</button></div>
        </form>
      </Modal>}
    </div>
  );
}
