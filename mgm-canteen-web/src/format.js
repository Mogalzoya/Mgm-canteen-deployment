export const rupees = (n) =>
  "₹" + Number(n || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

// Spring may send LocalDateTime as "2026-10-28T12:30:00" or as [y, m, d, h, min, s]
export function toDate(value) {
  if (!value) return null;
  if (Array.isArray(value)) {
    const [y, m, d, h = 0, min = 0, s = 0] = value;
    return new Date(y, m - 1, d, h, min, s);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value) {
  const d = toDate(value);
  if (!d) return "";
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

export const STATUS_LABEL = {
  PLACED: "Order placed",
  PREPARING: "Being prepared",
  READY: "Ready for pickup",
  COMPLETED: "Collected",
  CANCELLED: "Cancelled",
};

// ---------- Food images ----------
// A photo uploaded or linked by the admin is used when there is one. Otherwise the menu
// shows a picture that matches the food's category (files are in /public/foods).
export function categoryImage(food) {
  const text = `${food?.category || ""} ${food?.name || ""}`.toLowerCase();
  if (/\b(drinks?|beverages?|juice|tea|chai|coffee|shake|soda|lassi|water|milk)\b/.test(text)) return "/foods/drink.svg";
  if (/\b(desserts?|sweets?|ice ?cream|cake|cookies?|gulab jamun|jalebi|pudding|brownie)\b/.test(text)) return "/foods/dessert.svg";
  if (/\b(snacks?|sandwich|burger|samosa|puff|fries|pizza|rolls?|chaat|pakora|vada)\b/.test(text)) return "/foods/snack.svg";
  return "/foods/meal.svg";
}

export const foodImage = (food) => food?.imageUrl || categoryImage(food);
