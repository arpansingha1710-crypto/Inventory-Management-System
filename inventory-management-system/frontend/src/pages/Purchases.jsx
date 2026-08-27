import React, { useEffect, useState } from "react";
import api from "../api";
import Modal from "../components/Modal";
import ErrorMessage from "../components/ErrorMessage";
import Loader from "../components/Loader";

export default function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [products, setProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [form, setForm] = useState({
    supplier: "",
    product: "",
    quantity: 1,
    purchasePrice: 0,
    date: new Date().toISOString().slice(0, 10),
    note: ""
  });

  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  // --------------------------------
  // LOAD DATA
  // --------------------------------

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      // Fetch each API separately.
      // This prevents products and suppliers from getting mixed up.

      const purchasesResponse = await api.get("/purchases");
      const productsResponse = await api.get("/products");
      const suppliersResponse = await api.get("/suppliers");

      setPurchases(purchasesResponse.data);
      setProducts(productsResponse.data);
      setSuppliers(suppliersResponse.data);

      console.log("PRODUCTS:", productsResponse.data);
      console.log("SUPPLIERS:", suppliersResponse.data);

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Could not load purchase data."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // --------------------------------
  // OPEN PURCHASE FORM
  // --------------------------------

  function openPurchaseForm() {
    setError("");

    // First product
    const firstProduct = products.length > 0
      ? products[0]
      : null;

    // First supplier
    const firstSupplier = suppliers.length > 0
      ? suppliers[0]
      : null;

    setForm({
      supplier: firstSupplier?._id || "",
      product: firstProduct?._id || "",
      quantity: 1,
      purchasePrice: firstProduct?.purchasePrice || 0,
      date: new Date().toISOString().slice(0, 10),
      note: ""
    });

    setOpen(true);
  }

  // --------------------------------
  // PRODUCT CHANGE
  // --------------------------------

  function handleProductChange(productId) {
    const selectedProduct = products.find(
      product => product._id === productId
    );

    setForm(previous => ({
      ...previous,
      product: productId,
      purchasePrice: selectedProduct
        ? selectedProduct.purchasePrice
        : 0
    }));
  }

  // --------------------------------
  // SAVE PURCHASE
  // --------------------------------

  async function savePurchase(event) {
    event.preventDefault();

    setError("");

    if (!form.supplier) {
      setError("Please select a supplier.");
      return;
    }

    if (!form.product) {
      setError("Please select a product.");
      return;
    }

    if (Number(form.quantity) <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }

    try {
      await api.post("/purchases", {
        supplier: form.supplier,
        product: form.product,
        quantity: Number(form.quantity),
        purchasePrice: Number(form.purchasePrice),
        date: form.date,
        note: form.note
      });

      setOpen(false);

      // Reload all data after purchase
      await loadData();

    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Could not record purchase."
      );
    }
  }

  // --------------------------------
  // LOADING
  // --------------------------------

  if (loading) {
    return <Loader />;
  }

  // --------------------------------
  // PAGE
  // --------------------------------

  return (
    <div>

      {/* PAGE HEADER */}

      <div className="page-heading">

        <div>
          <h2>Purchases</h2>
          <p>Record stock received from suppliers.</p>
        </div>

        <button
          className="primary-button"
          onClick={openPurchaseForm}
          disabled={
            products.length === 0 ||
            suppliers.length === 0
          }
        >
          + New Purchase
        </button>

      </div>

      {/* ERROR */}

      <ErrorMessage message={error} />

      {/* PURCHASE TABLE */}

      <div className="panel">

        <div className="table-wrap">

          <table>

            <thead>
              <tr>
                <th>Date</th>
                <th>Supplier</th>
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>

              {purchases.map(purchase => (

                <tr key={purchase._id}>

                  <td>
                    {new Date(
                      purchase.date
                    ).toLocaleDateString()}
                  </td>

                  <td>
                    {purchase.supplier?.name || "—"}
                  </td>

                  <td>
                    <strong>
                      {purchase.product?.name || "—"}
                    </strong>

                    <small>
                      {purchase.product?.sku || ""}
                    </small>
                  </td>

                  <td>
                    {purchase.quantity}
                  </td>

                  <td>
                    ₹{purchase.purchasePrice}
                  </td>

                  <td>
                    ₹{Number(
                      purchase.totalAmount || 0
                    ).toLocaleString("en-IN")}
                  </td>

                </tr>

              ))}

              {purchases.length === 0 && (

                <tr>

                  <td
                    colSpan="6"
                    className="empty"
                  >
                    No purchases recorded yet.

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

      {/* PURCHASE MODAL */}

      {open && (

        <Modal
          title="Record Purchase"
          onClose={() => setOpen(false)}
        >

          <form
            className="form"
            onSubmit={savePurchase}
          >

            {/* SUPPLIER */}

            <label>

              Supplier

              <select
                required
                value={form.supplier}
                onChange={(event) =>
                  setForm(previous => ({
                    ...previous,
                    supplier: event.target.value
                  }))
                }
              >

                <option value="">
                  Select Supplier
                </option>

                {suppliers.map(supplier => (

                  <option
                    key={supplier._id}
                    value={supplier._id}
                  >
                    {supplier.name}
                  </option>

                ))}

              </select>

            </label>

            {/* PRODUCT */}

            <label>

              Product

              <select
                required
                value={form.product}
                onChange={(event) =>
                  handleProductChange(
                    event.target.value
                  )
                }
              >

                <option value="">
                  Select Product
                </option>

                {products.map(product => (

                  <option
                    key={product._id}
                    value={product._id}
                  >
                    {product.name} (
                    {product.quantity} in stock)
                  </option>

                ))}

              </select>

            </label>

            {/* QUANTITY + PRICE */}

            <div className="form-grid">

              <label>

                Quantity

                <input
                  type="number"
                  min="1"
                  required
                  value={form.quantity}
                  onChange={(event) =>
                    setForm(previous => ({
                      ...previous,
                      quantity: event.target.value
                    }))
                  }
                />

              </label>

              <label>

                Purchase Price

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={form.purchasePrice}
                  onChange={(event) =>
                    setForm(previous => ({
                      ...previous,
                      purchasePrice: event.target.value
                    }))
                  }
                />

              </label>

            </div>

            {/* DATE */}

            <label>

              Date

              <input
                type="date"
                value={form.date}
                onChange={(event) =>
                  setForm(previous => ({
                    ...previous,
                    date: event.target.value
                  }))
                }
              />

            </label>

            {/* NOTE */}

            <label>

              Note

              <textarea
                value={form.note}
                onChange={(event) =>
                  setForm(previous => ({
                    ...previous,
                    note: event.target.value
                  }))
                }
              />

            </label>

            {/* BUTTONS */}

            <div className="modal-actions">

              <button
                type="button"
                className="secondary-button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
              >
                Save Purchase
              </button>

            </div>

          </form>

        </Modal>

      )}

    </div>
  );
}