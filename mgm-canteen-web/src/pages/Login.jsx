import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ErrorNote } from "../components/Notice.jsx";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate(location.state?.from || "/", { replace: true });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <aside className="auth-aside">
        <h1>Order before the bell. Pick up without the queue.</h1>
        <p>Choose your food during class, collect it with your token number at break.</p>
      </aside>

      <form className="auth-form" onSubmit={submit} noValidate>
        <h2>Log in</h2>
        {location.state?.notice && <div className="note note-ok" role="status">{location.state.notice}</div>}
        <ErrorNote>{error}</ErrorNote>

        <label className="field">
          <span>Email</span>
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label className="field">
          <span>Password</span>
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>

        <div className="auth-forgot"><Link to="/forgot-password">Forgot password?</Link></div>

        <button className="btn btn-primary btn-block" disabled={busy || !email || !password}>
          {busy ? "Logging in…" : "Log in"}
        </button>
        <p className="auth-switch">New here? <Link to="/register">Create an account</Link></p>
      </form>
    </div>
  );
}
