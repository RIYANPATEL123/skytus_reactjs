import React, { createContext, useContext, useState, useEffect } from "react";

/* =========================================================
   ENV VARIABLES
   Add this to a .env file in your project root:
   VITE_API_BASE_URL=https://reqres.in/api
   VITE_AUTH_LOGIN_ENDPOINT=/login
========================================================= */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://reqres.in/api";
const AUTH_LOGIN_ENDPOINT = import.meta.env.VITE_AUTH_LOGIN_ENDPOINT || "/login";

/* =========================================================
   JWT HELPERS
========================================================= */
function decodeToken(token) {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const decoded = decodeToken(token);
  if (!decoded || !decoded.exp) return false; // no exp claim -> treat as non-expiring (e.g. mock tokens)
  return decoded.exp * 1000 < Date.now();
}

/* =========================================================
   AUTH CONTEXT
========================================================= */
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("authToken"));
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Basic expiry check whenever token changes / on mount
  useEffect(() => {
    if (token && isTokenExpired(token)) {
      logout();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}${AUTH_LOGIN_ENDPOINT}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 401) {
        throw new Error("Unauthorized: invalid email or password.");
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Login failed. Please try again.");
      }

      const data = await res.json();
      // reqres.in returns a plain string token, not a real JWT.
      // If it's not a valid 3-part JWT, fall back to a fake one so
      // the expiry-check logic still has something real to run on.
      const receivedToken = data.token || "";
      const finalToken = receivedToken.split(".").length === 3
        ? receivedToken
        : makeFakeJwt(email);

      localStorage.setItem("authToken", finalToken);
      setToken(finalToken);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
  };

  const isAuthenticated = !!token && !isTokenExpired(token);

  return (
    <AuthContext.Provider
      value={{ token, isAuthenticated, login, logout, error, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

// Builds a short-lived fake JWT (base64) purely so the expiry logic
// has a real token shape to check against when using a mock API
// that doesn't return a real JWT.
function makeFakeJwt(email) {
  const header = btoa(JSON.stringify({ alg: "none", typ: "JWT" }));
  const payload = btoa(
    JSON.stringify({ email, exp: Math.floor(Date.now() / 1000) + 60 * 60 })
  );
  return `${header}.${payload}.`;
}

/* =========================================================
   PROTECTED PAGE WRAPPER
========================================================= */
function ProtectedPage({ children, goTo }) {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      goTo("login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  if (!isAuthenticated) return null;
  return children;
}

/* =========================================================
   PAGES
========================================================= */
function Login({ goTo }) {
  const { login, error, loading, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("eve.holt@reqres.in");
  const [password, setPassword] = useState("cityslicka");

  useEffect(() => {
    if (isAuthenticated) goTo("dashboard");
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) goTo("dashboard");
  };

  return (
    <div style={styles.centerBox}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Login</h2>
        {error && <p style={styles.errorText}>{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

function Dashboard({ goTo }) {
  const { logout } = useAuth();
  return (
    <div style={styles.centerBox}>
      <h2>Dashboard</h2>
      <p>You're authenticated. This page is protected.</p>
      <div style={styles.row}>
        <button style={styles.button} onClick={() => goTo("profile")}>
          Go to Profile
        </button>
        <button
          style={styles.buttonDanger}
          onClick={() => {
            logout();
            goTo("login");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

function Profile({ goTo }) {
  const { token, logout } = useAuth();
  const decoded = token ? decodeToken(token) : null;

  return (
    <div style={styles.centerBox}>
      <h2>Profile</h2>
      <p>Email: {decoded?.email || "N/A"}</p>
      <p>
        Token expires:{" "}
        {decoded?.exp ? new Date(decoded.exp * 1000).toLocaleString() : "N/A"}
      </p>
      <div style={styles.row}>
        <button style={styles.button} onClick={() => goTo("dashboard")}>
          Back to Dashboard
        </button>
        <button
          style={styles.buttonDanger}
          onClick={() => {
            logout();
            goTo("login");
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   APP ROOT (state-based routing, no react-router-dom)
========================================================= */
function AppContent() {
  const [page, setPage] = useState("login");
  const goTo = (target) => setPage(target);

  if (page === "dashboard") {
    return (
      <ProtectedPage goTo={goTo}>
        <Dashboard goTo={goTo} />
      </ProtectedPage>
    );
  }

  if (page === "profile") {
    return (
      <ProtectedPage goTo={goTo}>
        <Profile goTo={goTo} />
      </ProtectedPage>
    );
  }

  return <Login goTo={goTo} />;
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

/* =========================================================
   INLINE STYLES
========================================================= */
const styles = {
  centerBox: { textAlign: "center", marginTop: "80px" },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "280px",
    margin: "0 auto",
    border: "1px solid #ddd",
    padding: "24px",
    borderRadius: "8px",
  },
  input: { padding: "10px", borderRadius: "6px", border: "1px solid #ccc" },
  button: {
    background: "#222",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  buttonDanger: {
    background: "#e53e3e",
    color: "#fff",
    border: "none",
    padding: "10px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  row: { display: "flex", gap: "10px", justifyContent: "center" },
  errorText: { color: "red" },
};