// One place for every call to the Spring Boot backend.

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message);
    this.status = status;
    this.fields = fields || null; // { fieldName: "message" } for validation errors
  }
}

let token = null;
let onUnauthorized = () => {};

export function setToken(t) {
  token = t;
}
export function setUnauthorizedHandler(fn) {
  onUnauthorized = fn;
}

// The backend returns either {"error": "..."} or {"fieldName": "message", ...}
function readError(body, status) {
  if (body && typeof body === "object") {
    if (typeof body.error === "string") return { message: body.error };
    const entries = Object.entries(body).filter(([, v]) => typeof v === "string");
    if (entries.length) {
      return { message: entries.map(([, v]) => v).join(". "), fields: Object.fromEntries(entries) };
    }
  }
  if (status === 401) return { message: "Your session has expired. Please log in again." };
  if (status === 403) return { message: "You do not have permission to do that." };
  if (status >= 500) return { message: "The server had a problem. Try again in a moment." };
  return { message: `Request failed (${status}).` };
}

async function request(path, { method = "GET", body, auth = true } = {}) {
  const headers = {};
  const isForm = typeof FormData !== "undefined" && body instanceof FormData;
  // For file uploads the browser sets the multipart Content-Type itself.
  if (body !== undefined && !isForm) headers["Content-Type"] = "application/json";
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Cannot reach the server. Check that the backend is running.", 0);
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    // An expired token on a protected call sends the person back to login.
    if (res.status === 401 && auth) onUnauthorized();
    const { message, fields } = readError(data, res.status);
    throw new ApiError(message, res.status, fields);
  }
  return data;
}

export const api = {
  login: (email, password) =>
    request("/api/auth/login", { method: "POST", body: { email, password }, auth: false }),

  // Registration: 1) email a code, 2) send the form + code
  sendOtp: (email) =>
    request("/api/auth/send-otp", { method: "POST", body: { email }, auth: false }),
  register: (user) =>
    request("/api/auth/register", { method: "POST", body: user, auth: false }),

  // Forgot password: 1) email a code, 2) send the code + new password
  forgotPassword: (email) =>
    request("/api/auth/forgot-password", { method: "POST", body: { email }, auth: false }),
  resetPassword: (email, otp, newPassword) =>
    request("/api/auth/reset-password", { method: "POST", body: { email, otp, newPassword }, auth: false }),

  getFood: () => request("/api/food"),
  addFood: (food) => request("/api/food", { method: "POST", body: food }),
  updateFood: (id, food) => request(`/api/food/${id}`, { method: "PUT", body: food }),
  uploadFoodImage: (file) => {
    const form = new FormData();
    form.append("file", file);
    return request("/api/food/image", { method: "POST", body: form }); // -> { imageUrl }
  },

  placeOrder: (userId, items) =>
    request("/api/order/orders", {
      method: "POST",
      body: { userId, items: items.map((i) => ({ foodId: i.food.id, quantity: i.quantity })) },
    }),
  getMyOrders: (userId) => request(`/api/order/user/${userId}`),
};
