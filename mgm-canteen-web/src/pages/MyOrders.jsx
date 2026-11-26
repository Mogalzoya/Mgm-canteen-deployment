import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { formatDateTime, rupees, toDate } from "../format.js";
import StatusBadge from "../components/StatusBadge.jsx";
import { Empty, ErrorNote } from "../components/Notice.jsx";

export default function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await api.getMyOrders(user.id);
      const list = Array.isArray(data) ? data : [];
      list.sort((a, b) => (toDate(b.orderDate)?.getTime() || 0) - (toDate(a.orderDate)?.getTime() || 0));
      setOrders(list);
      setError("");
    } catch (err) {
      setError(err.message);
    }
  }, [user.id]);

  // Refresh every 30 seconds so status changes (preparing, ready) appear without a reload.
  useEffect(() => {
    load();
    const timer = setInterval(load, 30000);
    return () => clearInterval(timer);
  }, [load]);

  return (
    <div className="orders">
      <div className="page-head">
        <h1>My orders</h1>
        <button type="button" className="btn btn-ghost btn-sm" onClick={load}>Refresh</button>
      </div>

      <ErrorNote onRetry={load}>{error}</ErrorNote>
      {!orders && !error && <p className="muted">Loading your orders…</p>}

      {orders && orders.length === 0 && (
        <Empty title="No orders yet">
          <p>Your orders will show up here once you place one.</p>
          <Link to="/" className="btn btn-primary">Browse the menu</Link>
        </Empty>
      )}

      <ul className="order-list">
        {(orders || []).map((o) => (
          <li key={o.id} className={`order ${o.status === "READY" ? "order-ready" : ""}`}>
            <div className="order-head">
              <div>
                <h2>Token {o.id}</h2>
                <p className="muted">{formatDateTime(o.orderDate)}</p>
              </div>
              <StatusBadge status={o.status} />
            </div>
            <p className="order-items">
              {(o.items || []).map((it) => `${it.quantity} × ${it.food?.name}`).join(", ")}
            </p>
            <p className="order-total">{rupees(o.totalAmount)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
