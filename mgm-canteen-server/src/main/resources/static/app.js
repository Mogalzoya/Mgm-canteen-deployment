
const API = ""; // Same Spring Boot server

const loginSection = document.getElementById("loginSection");
const shopSection = document.getElementById("shopSection");
const loginForm = document.getElementById("loginForm");
const productsDiv = document.getElementById("products");
const cartItemsDiv = document.getElementById("cartItems");

let token = null;
let currentUser = null;
let foodItems = [];
let cart = new Map();

function showMessage(id, message, isError = false) {
    const element = document.getElementById(id);
    element.textContent = message;
    element.className = isError ? "message error" : "message success";
}

async function apiRequest(path, options = {}) {
    const headers = {
        "Content-Type": "application/json",
        ...options.headers
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(API + path, {
        ...options,
        headers
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(details || `Request failed: ${response.status}`);
    }

    if (response.status === 204) return null;

    const text = await response.text();
    return text ? JSON.parse(text) : null;
}

// 1. Login
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const button = loginForm.querySelector("button");
    button.disabled = true;
    showMessage("loginMessage", "Logging in...");

    try {
        const result = await apiRequest("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({
                email: document.getElementById("email").value.trim(),
                password: document.getElementById("password").value
            })
        });

        if (!result.token) {
            throw new Error("Login response did not contain a token.");
        }

        token = result.token;
        currentUser = result;

        loginSection.hidden = true;
        shopSection.hidden = false;

        document.getElementById("welcomeMessage").textContent =
            `Welcome, ${result.name || result.email}!`;

        await loadProducts();

    } catch (error) {
        showMessage("loginMessage", error.message, true);
    } finally {
        button.disabled = false;
    }
});

// 2. Load products from the database
async function loadProducts() {
    productsDiv.textContent = "Loading food items...";

    try {
        const data = await apiRequest("/api/food");

        // Supports either a JSON array or a Spring Page response
        foodItems = Array.isArray(data) ? data : (data.content || []);

        renderProducts();

    } catch (error) {
        productsDiv.textContent = "";
        showMessage("productMessage",
            "Could not load products. Check your FoodController and API.",
            true);
    }
}

function renderProducts() {
    productsDiv.replaceChildren();

    const availableItems = foodItems.filter(
        food => food.available !== false
    );

    if (availableItems.length === 0) {
        productsDiv.textContent = "No food items are currently available.";
        return;
    }

    availableItems.forEach(food => {
        const card = document.createElement("article");
        card.className = "food-card";

        const name = document.createElement("h3");
        name.textContent = food.name;

        const description = document.createElement("p");
        description.textContent = food.description || food.category || "";

        const price = document.createElement("p");
        price.className = "price";
        price.textContent = `₹${Number(food.price).toFixed(2)}`;

        const quantityLabel = document.createElement("label");
        quantityLabel.textContent = "Quantity";

        const quantity = document.createElement("input");
        quantity.type = "number";
        quantity.min = "1";
        quantity.max = "99";
        quantity.value = cart.get(food.id)?.quantity || 1;
        quantity.className = "quantity";

        const addButton = document.createElement("button");
        addButton.textContent = "Add to Cart";

        addButton.addEventListener("click", () => {
            const amount = Number(quantity.value);

            if (!Number.isInteger(amount) || amount < 1 || amount > 99) {
                alert("Enter a quantity from 1 to 99.");
                return;
            }

            cart.set(food.id, { food, quantity: amount });
            renderCart();
        });

        card.append(name, description, price,
                    quantityLabel, quantity, addButton);
        productsDiv.appendChild(card);
    });
}

// 3. Show cart and total
function renderCart() {
    cartItemsDiv.replaceChildren();

    if (cart.size === 0) {
        cartItemsDiv.textContent = "Your cart is empty.";
        document.getElementById("total").textContent = "Total: ₹0.00";
        return;
    }

    let total = 0;

    cart.forEach(({ food, quantity }) => {
        const row = document.createElement("div");
        row.className = "cart-row";

        const details = document.createElement("span");
        details.textContent =
            `${food.name} × ${quantity} = ₹${(Number(food.price) * quantity).toFixed(2)}`;

        const removeButton = document.createElement("button");
        removeButton.className = "secondary";
        removeButton.textContent = "Remove";

        removeButton.addEventListener("click", () => {
            cart.delete(food.id);
            renderCart();
            renderProducts();
        });

        row.append(details, removeButton);
        cartItemsDiv.appendChild(row);

        total += Number(food.price) * quantity;
    });

    document.getElementById("total").textContent =
        `Total: ₹${total.toFixed(2)}`;
}

// 4. Place the order
document.getElementById("orderButton").addEventListener("click", async () => {
    if (!token || !currentUser) {
        showMessage("orderMessage", "Please log in first.", true);
        return;
    }

    if (cart.size === 0) {
        showMessage("orderMessage", "Add food to your cart first.", true);
        return;
    }

    // This project’s OrderRequestDto requires userId.
    // Login response must include the user's database ID.
    const userId = currentUser.id ?? currentUser.userId;

    if (userId == null) {
        showMessage(
            "orderMessage",
            "Your login response has no user ID. Add the database user ID to LoginResponseDto.",
            true
        );
        return;
    }

    const orderButton = document.getElementById("orderButton");
    orderButton.disabled = true;
    showMessage("orderMessage", "Placing your order...");

    try {
        const orderData = {
            userId: userId,
            items: Array.from(cart.values()).map(({ food, quantity }) => ({
                foodId: food.id,
                quantity: quantity
            }))
        };

        // Matches POST /api/order/orders from the current project setup.
        const result = await apiRequest("/api/order/orders", {
            method: "POST",
            body: JSON.stringify(orderData)
        });

        cart.clear();
        renderCart();
        renderProducts();

        showMessage(
            "orderMessage",
            `Order placed successfully! ${result?.status ? "Status: " + result.status : "The server accepted your order."}`
        );

    } catch (error) {
        showMessage(
            "orderMessage",
            `Order failed: ${error.message}`,
            true
        );
    } finally {
        orderButton.disabled = false;
    }
});

// 5. Logout
document.getElementById("logoutButton").addEventListener("click", () => {
    token = null;
    currentUser = null;
    foodItems = [];
    cart.clear();

    productsDiv.replaceChildren();
    renderCart();

    shopSection.hidden = true;
    loginSection.hidden = false;
    loginForm.reset();
    showMessage("loginMessage", "");
});
