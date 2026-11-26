import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <Link to="/" className="brand">MGM's Canteen</Link>

        <nav className="nav" aria-label="Main">
          {user ? (
            <>
              <NavLink to="/" end>Menu</NavLink>
              <NavLink to="/orders">My orders</NavLink>
              {isAdmin && <NavLink to="/admin">Manage menu</NavLink>}
              <NavLink to="/cart" className="nav-cart">
                Cart
                {count > 0 && <span className="badge" aria-label={`${count} items in cart`}>{count}</span>}
              </NavLink>
              <span className="nav-user">{user.name}</span>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Log in</NavLink>
              <NavLink to="/register">Create account</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
