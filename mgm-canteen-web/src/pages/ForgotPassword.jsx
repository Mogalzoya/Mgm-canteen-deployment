import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { ErrorNote } from "../components/Notice.jsx";

const EMAIL = /^\S+@\S+\.\S+$/;
const RESEND_SECONDS = 60;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email"); // "email" -> "reset"
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (wait <= 0) return undefined;
    const timer = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  // Step 1: ask the backend to email a reset code.
  const sendCode = async (event) => {
    event?.preventDefault();
    setError("");
    setMessage("");
    if (!EMAIL.test(email.trim())) {
      setError("Enter the email address you registered with.");
      return;
    }
    setBusy(true);
    try {
      await api.forgotPassword(email.trim());
      setStep("reset");
      setOtp("");
      setWait(RESEND_SECONDS);
      setMessage("If this email is registered, we sent a 6-digit code. It is valid for 5 minutes.");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  // Step 2: code + new password.
  const reset = async (event) => {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!/^\d{6}$/.test(otp)) return setError("Enter the 6-digit code from your email.");
    if (password.length < 6) return setError("Use at least 6 characters for the new password.");
    if (password !== confirm) return setError("The two passwords do not match.");

    setBusy(true);
    try {
      await api.resetPassword(email.trim(), otp, password);
      navigate("/login", { replace: true, state: { notice: "Password changed. Log in with your new password." } });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="auth">
      <aside className="auth-aside">
        <h1>Forgot your password? It happens.</h1>
        <p>We will email you a code so you can choose a new one.</p>
      </aside>

      {step === "email" ? (
        <form className="auth-form" onSubmit={sendCode} noValidate>
          <h2>Reset password</h2>
          <ErrorNote>{error}</ErrorNote>

          <label className="field">
            <span>Email</span>
            <input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
          </label>

          <button className="btn btn-primary btn-block" disabled={busy || !email}>
            {busy ? "Sending code…" : "Send reset code"}
          </button>
          <p className="auth-switch"><Link to="/login">Back to log in</Link></p>
        </form>
      ) : (
        <form className="auth-form" onSubmit={reset} noValidate>
          <h2>Choose a new password</h2>
          <ErrorNote>{error}</ErrorNote>
          {message && <div className="note note-ok" role="status">{message}</div>}

          <label className="field">
            <span>6-digit code</span>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              autoFocus
            />
          </label>
          <label className="field">
            <span>New password</span>
            <input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <label className="field">
            <span>Confirm new password</span>
            <input type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
          </label>

          <button className="btn btn-primary btn-block" disabled={busy || otp.length !== 6 || !password || !confirm}>
            {busy ? "Saving…" : "Change password"}
          </button>

          <div className="auth-actions">
            <button type="button" className="link-btn" onClick={() => sendCode()} disabled={busy || wait > 0}>
              {wait > 0 ? `Resend code in ${wait}s` : "Resend code"}
            </button>
            <button type="button" className="link-btn" onClick={() => { setStep("email"); setError(""); setMessage(""); }}>
              Change email
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
