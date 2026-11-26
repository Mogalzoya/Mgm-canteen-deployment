import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import { rupees } from "../format.js";
import Stepper from "../components/Stepper.jsx";
import { Empty, ErrorNote } from "../components/Notice.jsx";

export default function Cart() {
  const { user } = useAuth();
  const { items, setQuantity, clear, total, count, maxQty } = useCart();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const placeOrder = async () => {
    setError("");
    setBusy(true);
    try {
      const order = await api.placeOrder(user.id, items);
      clear();
      navigate("/order-success", { replace: true, state: { order } });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  if (items.length === 0) {
    return (
      <Empty title="Your cart is empty">
        <p>Pick something from the menu and it will show up here.</p>
        <Link to="/" className="btn btn-primary">Browse the menu</Link>
      </Empty>
    );
  }

  return (
    <div className="cart">
      <div className="page-head">
        <h1>Your cart</h1>
        <button type="button" className="link-btn" onClick={clear}>Empty cart</button>
      </div>

      <ul className="cart-lines">
        {items.map(({ food, quantity }) => (
          <li key={food.id} className="cart-line">
            <div className="cart-line-info">
              <h2>{food.name}</h2>
              <p className="muted">{rupees(food.price)} each</p>
            </div>
            <Stepper value={quantity} max={maxQty} label={food.name} onChange={(n) => setQuantity(food, n)} />
            <span className="line-total">{rupees(Number(food.price) * quantity)}</span>
            <button type="button" className="link-btn" onClick={() => setQuantity(food, 0)} aria-label={`Remove ${food.name}`}>Remove</button>
          </li>
        ))}
      </ul>

      <section className="summary" aria-label="Order summary">
        <div className="summary-row"><span>{count} {count === 1 ? "item" : "items"}</span><span>{rupees(total)}</span></div>
        <div className="summary-row summary-total"><span>Total to pay at pickup</span><strong>{rupees(total)}</strong></div>
        <ErrorNote>{error}</ErrorNote>
        <button type="button" className="btn btn-primary btn-block" onClick={placeOrder} disabled={busy}>
          {busy ? "Placing order…" : "Place order"}
        </button>
        <Link to="/" className="summary-back">Add more food</Link>
      </section>
    </div>
  );
}
