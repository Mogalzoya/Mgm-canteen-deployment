import { Link, Navigate, useLocation } from "react-router-dom";
import { formatDateTime, rupees } from "../format.js";
import StatusBadge from "../components/StatusBadge.jsx";

export default function OrderSuccess() {
  const order = useLocation().state?.order;
  // Opened directly or refreshed: there is no order to show, so go to the order list.
  if (!order) return <Navigate to="/orders" replace />;

  return (
    <div className="success">
      <h1>Order placed</h1>
      <p className="muted">Show this token at the counter when you collect.</p>

      <article className="slip" aria-label={`Order token ${order.id}`}>
        <div className="slip-token">
          <span>Token</span>
          <strong>{order.id}</strong>
        </div>

        <div className="slip-body">
          <div className="slip-meta">
            <StatusBadge status={order.status} />
            <span className="muted">{formatDateTime(order.orderDate)}</span>
          </div>
          <ul className="slip-items">
            {(order.items || []).map((it) => (
              <li key={it.id}>
                <span>{it.quantity} × {it.food?.name}</span>
                <span>{rupees(Number(it.price) * it.quantity)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="slip-total">
          <span>Total to pay</span>
          <strong>{rupees(order.totalAmount)}</strong>
        </div>
      </article>

      <div className="success-actions">
        <Link to="/orders" className="btn btn-primary">Track my order</Link>
        <Link to="/" className="btn btn-outline">Order more</Link>
      </div>
    </div>
  );
}
