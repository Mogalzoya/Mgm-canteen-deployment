import { useCallback, useEffect, useState } from "react";
import { api } from "../api.js";
import { foodImage, rupees } from "../format.js";
import { ErrorNote } from "../components/Notice.jsx";

const EMPTY = { name: "", description: "", category: "", price: "", imageUrl: "", available: true };

export default function Admin() {
  const [foods, setFoods] = useState([]);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

  const load = useCallback(async () => {
    try {
      setFoods(await api.getFood());
    } catch (err) {
      setError(err.message);
    }
  }, []);
  useEffect(() => { load(); }, [load]);

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  // Upload a photo from the computer for the food being added.
  const pickImage = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // lets the same file be chosen again later
    if (!file) return;
    setError("");
    setUploading(true);
    try {
      const { imageUrl } = await api.uploadFoodImage(file);
      setForm((f) => ({ ...f, imageUrl }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  // Replace the photo of a food that is already on the menu.
  const changeImage = async (food, e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setError("");
    setSaved("");
    setUpdatingId(food.id);
    try {
      const { imageUrl } = await api.uploadFoodImage(file);
      await api.updateFood(food.id, { ...food, imageUrl });
      setSaved(`Photo updated for ${food.name}.`);
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSaved("");
    setErrors({});
    setBusy(true);
    try {
      const food = await api.addFood({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        imageUrl: form.imageUrl.trim(),
        available: form.available,
      });
      setSaved(`${food.name} added to the menu.`);
      setForm(EMPTY);
      load();
    } catch (err) {
      setErrors(err.fields || {});
      setError(err.fields ? "Fix the highlighted fields." : err.message);
    } finally {
      setBusy(false);
    }
  };

  const categories = [...new Set(foods.map((f) => f.category).filter(Boolean))];

  return (
    <div className="admin">
      <div className="page-head"><h1>Manage menu</h1></div>

      <form className="admin-form" onSubmit={submit} noValidate>
        <h2>Add a food item</h2>
        <ErrorNote>{error}</ErrorNote>
        {saved && <div className="note note-ok" role="status">{saved}</div>}

        <label className={`field ${errors.name ? "field-invalid" : ""}`}>
          <span>Name</span>
          <input value={form.name} onChange={set("name")} />
          {errors.name && <small role="alert">{errors.name}</small>}
        </label>
        <label className="field">
          <span>Description</span>
          <input value={form.description} onChange={set("description")} />
        </label>

        <div className="field">
          <span>Food photo</span>
          <div className="photo-pick">
            <label className="btn btn-outline btn-sm file-btn">
              {uploading ? "Uploading…" : "Choose photo"}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={pickImage} disabled={uploading} />
            </label>
            {form.imageUrl && (
              <button type="button" className="link-btn" onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}>
                Remove photo
              </button>
            )}
          </div>
          <input
            type="text"
            value={form.imageUrl}
            onChange={set("imageUrl")}
            placeholder="…or paste an image link (https://...)"
            aria-label="Image link"
          />
          <small className="hint">JPG, PNG, WEBP or GIF, up to 3 MB. No photo? The menu shows a picture for the category.</small>
        </div>
        {form.imageUrl && (
          <div className="admin-image-preview">
            <img src={form.imageUrl} alt="Food preview" onError={(event) => { event.currentTarget.style.display = "none"; }} />
          </div>
        )}

        <div className="field-row">
          <label className="field">
            <span>Category</span>
            <input list="categories" value={form.category} onChange={set("category")} placeholder="Snacks, Drinks, Meals" />
            <datalist id="categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
          </label>
          <label className={`field ${errors.price ? "field-invalid" : ""}`}>
            <span>Price (₹)</span>
            <input type="number" min="0" step="0.5" inputMode="decimal" value={form.price} onChange={set("price")} />
            {errors.price && <small role="alert">{errors.price}</small>}
          </label>
        </div>
        <label className="check">
          <input type="checkbox" checked={form.available} onChange={set("available")} />
          <span>Available to order now</span>
        </label>
        <button className="btn btn-primary" disabled={busy || uploading}>{busy ? "Adding…" : "Add to menu"}</button>
      </form>

      <section className="admin-list">
        <h2>On the menu ({foods.length})</h2>
        <ul>
          {foods.map((f) => (
            <li key={f.id} className="admin-row">
              <span className="admin-name">
                <img
                  className="admin-thumb"
                  src={foodImage(f)}
                  alt=""
                  loading="lazy"
                  onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = "/food-placeholder.svg"; }}
                />
                <span>{f.name}<small className="muted"> {f.category}</small></span>
              </span>
              <span>{rupees(f.price)}</span>
              <span className={f.available ? "tag tag-on" : "tag"}>{f.available ? "Available" : "Hidden"}</span>
              <label className="btn btn-outline btn-sm file-btn">
                {updatingId === f.id ? "Saving…" : f.imageUrl ? "Change photo" : "Add photo"}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(e) => changeImage(f, e)} disabled={updatingId === f.id} aria-label={`Photo for ${f.name}`} />
              </label>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
