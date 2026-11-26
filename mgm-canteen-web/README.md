# MGM's Canteen – React front end

React (Vite) client for the `canteen` Spring Boot backend.

## Run it

1. Start the Spring Boot app (port 8080) as usual.
2. In this folder:

```bash
npm install
npm run dev
```

3. Open http://localhost:5173

`vite.config.js` forwards every `/api` request to `http://localhost:8080`, so you do **not** need to add CORS config to the backend while developing.

## Pages

| Route | What it does | API used |
|---|---|---|
| `/login` | Log in, token kept in localStorage | `POST /api/auth/login` |
| `/register` | Create account, then logs in automatically | `POST /api/user` |
| `/` | Menu: available food only, search, category filter, add/+/- | `GET /api/food` |
| `/cart` | Change quantities, remove, place order | `POST /api/order/orders` |
| `/order-success` | Token slip shown after an order is placed | (uses the order returned above) |
| `/orders` | Your orders and their status, refreshes every 30 s | `GET /api/order/user/{id}` |
| `/admin` | Add food items (ADMIN role only) | `POST /api/food` |

Behaviour worth knowing:
- Tokens last 1 hour on the backend. When one expires the app logs the person out and sends them to `/login`.
- The cart is saved per user in localStorage and survives a refresh.
- Registration checks the same rules as `UserRequestDto` (valid email, 10-digit number starting 6-9, password of 6+ characters) and shows the backend's field errors too.
- New accounts are always `STUDENT`. To make an admin, run in MySQL:
  `UPDATE user SET role = 'ADMIN' WHERE email = 'you@example.com';`

## Serving the built app from Spring Boot (optional)

```bash
npm run build          # creates dist/
```

Copy everything in `dist/` into `src/main/resources/static/` (replace the old `index.html`, `app.js`, `style.css`). Then two backend changes are needed, because your `SecurityConfig` only allows the old file names and React Router uses client-side URLs:

1. In `SecurityConfig`, extend the first `permitAll` list:

```java
.requestMatchers(
    "/", "/index.html", "/favicon.ico", "/assets/**",
    "/login", "/register", "/cart", "/orders", "/order-success", "/admin"
).permitAll()
```

2. Add a controller so refreshing on those URLs returns the React page:

```java
@Controller
public class SpaController {
    @GetMapping({"/login", "/register", "/cart", "/orders", "/order-success", "/admin"})
    public String spa() { return "forward:/index.html"; }
}
```

The API stays protected; these paths only serve the HTML shell.
