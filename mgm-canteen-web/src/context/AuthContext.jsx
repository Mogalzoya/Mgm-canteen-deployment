import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, setToken, setUnauthorizedHandler } from "../api.js";

const AuthContext = createContext(null);
const KEY = "canteen.user";

function loadUser() {
  try {
    const user = JSON.parse(localStorage.getItem(KEY));
    if (user?.token) setToken(user.token); // set before first render so child effects can call the API
    return user?.token ? user : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadUser);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem(KEY);
    setUser(null);
  }, []);

  // Tokens last one hour on the backend; a 401 anywhere logs the person out.
  useEffect(() => {
    setUnauthorizedHandler(logout);
  }, [logout]);

  const saveSession = useCallback((res) => {
    const next = { id: res.id, name: res.name, email: res.email, role: res.role, token: res.token };
    setToken(next.token);
    localStorage.setItem(KEY, JSON.stringify(next));
    setUser(next);
    return next;
  }, []);

  const login = useCallback(
    async (email, password) => saveSession(await api.login(email.trim(), password)),
    [saveSession]
  );

  // Creates the account (needs the email code) and logs the person straight in.
  const register = useCallback(
    async (details) => saveSession(await api.register(details)),
    [saveSession]
  );

  const value = useMemo(
    () => ({ user, login, register, logout, isAdmin: user?.role === "ADMIN" }),
    [user, login, register, logout]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
