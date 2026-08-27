import React, { useEffect, useState } from "react";
import api from "../api";
import Modal from "../components/Modal";
import ErrorMessage from "../components/ErrorMessage";
import Loader from "../components/Loader";

const empty = {
  name: "", category: "General", sku: "", description: "",
  purchasePrice: 0, sellingPrice: 0, quantity: 0, minimumStock: 5, supplier: ""
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      setLoading(true);
      const [p, s] = await Promise.all([api.get("/products"), api.get("/suppliers")]);
      setProducts(p.data);
      setSuppliers(s.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load products");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setForm(empty);
    setError("");
    setOpen(true);
  }

  function openEdit(product) {
    setEditing(product._id);
    setForm({
      name: product.name,
      category: product.category,
      sku: product.sku,
      description: product.description || "",
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      quantity: product.quantity,
      minimumStock: product.minimumStock,
      supplier: product.supplier?._id || product.supplier || ""
    });
    setError("");
    setOpen(true);
  }

  async function save(e) {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        ...form,
        purchasePrice: Number(form.purchasePrice),
        sellingPrice: Number(form.sellingPrice),
        quantity: Number(form.quantity),
        minimumStock: Number(form.minimumStock),
        supplier: form.supplier || null
      };

      if (editing) await api.put(`/products/${editing}`, payload);
      else await api.post("/products", payload);

      setOpen(false);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save product");
    }
  }

  async function remove(id) {
    if (!confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete product");
    }
  }

  const filtered = products.filter((p) =>
    `${p.name} ${p.sku} ${p.category}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div>
      <div className="page-heading">
        <div><h2>Products</h2><p>Manage your inventory items.</p></div>
        <button className="primary-button" onClick={openAdd}>+ Add Product</button>
      </div>

      <ErrorMessage message={error} />

      <div className="panel">
        <input className="search-input" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="table-wrap">
          <table>
            <thead><tr><th>Product</th><th>Category</th><th>Prices</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p._id}>
                  <td><strong>{p.name}</strong><small>{p.sku}</small></td>
                  <td>{p.category}</td>
                  <td>Buy {p.purchasePrice}<br />Sell {p.sellingPrice}</td>
                  <td>{p.quantity}</td>
                  <td>{p.quantity <= p.minimumStock ? <span className="badge danger">Low stock</span> : <span className="badge success">In stock</span>}</td>
                  <td className="actions">
                    <button className="secondary-button" onClick={() => openEdit(p)}>Edit</button>
                    <button className="danger-button" onClick={() => remove(p._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {!filtered.length && <tr><td colSpan="6" className="empty">No products found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <Modal title={editing ? "Edit Product" : "Add Product"} onClose={() => setOpen(false)}>
          <form className="form" onSubmit={save}>
            <div className="form-grid">
              <label>Product Name<input required value={form.name} onChange={e => setForm({...form, name:e.target.value})} /></label>
              <label>SKU<input required value={form.sku} onChange={e => setForm({...form, sku:e.target.value})} /></label>
              <label>Category<input value={form.category} onChange={e => setForm({...form, category:e.target.value})} /></label>
              <label>Supplier
                <select value={form.supplier} onChange={e => setForm({...form, supplier:e.target.value})}>
                  <option value="">No supplier</option>
                  {suppliers.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </label>
              <label>Purchase Price<input type="number" min="0" step="0.01" required value={form.purchasePrice} onChange={e => setForm({...form, purchasePrice:e.target.value})} /></label>
              <label>Selling Price<input type="number" min="0" step="0.01" required value={form.sellingPrice} onChange={e => setForm({...form, sellingPrice:e.target.value})} /></label>
              <label>Quantity<input type="number" min="0" required value={form.quantity} onChange={e => setForm({...form, quantity:e.target.value})} /></label>
              <label>Minimum Stock<input type="number" min="0" required value={form.minimumStock} onChange={e => setForm({...form, minimumStock:e.target.value})} /></label>
            </div>
            <label>Description<textarea value={form.description} onChange={e => setForm({...form, description:e.target.value})} /></label>
            <div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setOpen(false)}>Cancel</button><button className="primary-button">Save Product</button></div>
          </form>
        </Modal>
      )}
    </div>
  );
}
