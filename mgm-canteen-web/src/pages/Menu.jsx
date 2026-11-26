import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useCart } from "../context/CartContext.jsx";
import { categoryImage, foodImage, rupees } from "../format.js";
import Stepper from "../components/Stepper.jsx";
import { Empty, ErrorNote } from "../components/Notice.jsx";

export default function Menu() {
  const { quantityOf, setQuantity, maxQty, count, total } = useCart();
  const [foods, setFoods] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const load = useCallback(async () => {
    setError("");
    setFoods(null);
    try {
      const data = await api.getFood();
      setFoods(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const available = useMemo(() => (foods || []).filter((f) => f.available), [foods]);
  const categories = useMemo(
    () => ["All", ...new Set(available.map((f) => f.category || "Other"))],
    [available]
  );

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const shown = available.filter(
      (f) =>
        (category === "All" || (f.category || "Other") === category) &&
        (!q || f.name.toLowerCase().includes(q) || (f.description || "").toLowerCase().includes(q))
    );
    const map = new Map();
    shown.forEach((f) => {
      const key = f.category || "Other";
      map.set(key, [...(map.get(key) || []), f]);
    });
    return [...map.entries()];
  }, [available, query, category]);

  return (
    <div className="menu">
      <div className="page-head">
        <h1>Today's menu</h1>
        <input
          className="search"
          type="search"
          placeholder="Search food"
          aria-label="Search food"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {categories.length > 2 && (
        <div className="chips" role="group" aria-label="Filter by category">
          {categories.map((c) => (
            <button key={c} type="button" className={`chip ${c === category ? "chip-on" : ""}`} aria-pressed={c === category} onClick={() => setCategory(c)}>
              {c}
            </button>
          ))}
        </div>
      )}

      <ErrorNote onRetry={load}>{error}</ErrorNote>
      {!foods && !error && <p className="muted">Loading the menu…</p>}

      {foods && available.length === 0 && (
        <Empty title="Nothing is on the menu right now">
          <p>The canteen has not listed any available food yet. Check back soon.</p>
        </Empty>
      )}
      {foods && available.length > 0 && groups.length === 0 && (
        <Empty title="No matches"><p>Try a different word or choose All.</p></Empty>
      )}

      {groups.map(([name, items]) => (
        <section key={name} className="menu-group" aria-labelledby={`cat-${name.replace(/\s+/g, "-")}`}>
          <h2 id={`cat-${name.replace(/\s+/g, "-")}`}>{name}</h2>
          <ul className="dishes">
            {items.map((food) => {
              const qty = quantityOf(food.id);
              return (
                <li key={food.id} className="dish">
                  <img
                    className="dish-image"
                    src={foodImage(food)}
                    alt={food.name}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = categoryImage(food);
                    }}
                  />
                  <div className="dish-main">
                    <div className="dish-line">
                      <h3>{food.name}</h3>
                      <span className="leader" aria-hidden="true" />
                      <span className="price">{rupees(food.price)}</span>
                    </div>
                    {food.description && <p className="dish-desc">{food.description}</p>}
                  </div>
                  <div className="dish-action">
                    {qty === 0 ? (
                      <button type="button" className="btn btn-outline btn-sm" onClick={() => setQuantity(food, 1)} aria-label={`Add ${food.name} to cart`}>
                        Add
                      </button>
                    ) : (
                      <Stepper value={qty} max={maxQty} label={food.name} onChange={(n) => setQuantity(food, n)} />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {count > 0 && (
        <div className="cartbar">
          <span>{count} {count === 1 ? "item" : "items"} · {rupees(total)}</span>
          <Link to="/cart" className="btn btn-accent btn-sm">View cart</Link>
        </div>
      )}
    </div>
  );
}
