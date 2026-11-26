import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { ErrorNote } from "../components/Notice.jsx";

const PHONE = /^[6-9]\d{9}$/;
const EMAIL = /^\S+@\S+\.\S+$/;
const RESEND_SECONDS = 60;

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Enter your name.";
  if (!EMAIL.test(form.email.trim())) errors.email = "Enter a valid email address.";
  if (!PHONE.test(form.phone)) errors.phone = "Enter a valid 10-digit mobile number.";
  if (form.password.length < 6) errors.password = "Use at least 6 characters.";
  return errors;
}

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [step, setStep] = useState("details"); // "details" -> "code"
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [wait, setWait] = useState(0); // seconds until "Resend code" works again

  useEffect(() => {
    if (wait <= 0) return undefined;
    const timer = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const set = (key) => (event) => {
    const value = key === "phone" ? event.target.value.replace(/\D/g, "").slice(0, 10) : event.target.value;
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  // Step 1: the backend emails a 6-digit code to the address.
  const sendCode = async () => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await api.sendOtp(form.email.trim());
      setStep("code");
      setOtp("");
      setWait(RESEND_SECONDS);
      setMessage(`We sent a 6-digit code to ${form.email.trim()}. It is valid for 5 minutes.`);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitDetails = async (event) => {
    event.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    await sendCode();
  };

  // Step 2: the code is checked by the backend while the account is created.
  const submitCode = async (event) => {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError("Enter the 6-digit code from your email.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone,
        password: form.password,
        otp,
      });
      navigate("/", { replace: true });
    } catch (err) {
      const formProblem = err.fields && Object.keys(err.fields).some((k) => k !== "otp");
      if (formProblem) {
        setErrors(err.fields);
        setStep("details");
        setError("Please fix the highlighted fields.");
      } else {
        setError(err.message);
      }
      setBusy(false);
    }
  };

  const field = (key, label, props = {}) => (
    <label className={`field ${errors[key] ? "field-invalid" : ""}`}>
      <span>{label}</span>
      <input value={form[key]} onChange={set(key)} aria-invalid={!!errors[key]} {...props} />
      {errors[key] && <small role="alert">{errors[key]}</small>}
    </label>
  );

  return (
    <div className="auth">
      <aside className="auth-aside">
        <h1>Make an account once, order every break.</h1>
        <p>Your name and number help the counter find your order.</p>
      </aside>

      {step === "details" ? (
        <form className="auth-form" onSubmit={submitDetails} noValidate>
          <h2>Create account</h2>
          <ErrorNote>{error}</ErrorNote>

          {field("name", "Full name", { autoComplete: "name" })}
          {field("email", "Email", { type: "email", autoComplete: "email" })}
          {field("phone", "Mobile number", { type: "tel", inputMode: "numeric", maxLength: 10, autoComplete: "tel" })}
          {field("password", "Password", { type: "password", autoComplete: "new-password" })}

          <button className="btn btn-primary btn-block" disabled={busy}>
            {busy ? "Sending code…" : "Continue"}
          </button>
          <p className="auth-hint">We will email you a code to verify your address.</p>
          <p className="auth-switch">Already registered? <Link to="/login">Log in</Link></p>
        </form>
      ) : (
        <form className="auth-form" onSubmit={submitCode} noValidate>
          <h2>Verify your email</h2>
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

          <button className="btn btn-primary btn-block" disabled={busy || otp.length !== 6}>
            {busy ? "Please wait…" : "Verify and create account"}
          </button>

          <div className="auth-actions">
            <button type="button" className="link-btn" onClick={sendCode} disabled={busy || wait > 0}>
              {wait > 0 ? `Resend code in ${wait}s` : "Resend code"}
            </button>
            <button type="button" className="link-btn" onClick={() => { setStep("details"); setError(""); setMessage(""); }}>
              Change email
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
