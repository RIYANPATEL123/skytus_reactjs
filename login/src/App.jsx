import React, { createContext, useContext, useState } from "react";

/* =========================================================
   ENV VARIABLE
   Add this to a .env file in your project root:
   VITE_AUTH_API_URL=https://reqres.in/api/login
========================================================= */
const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL || "https://reqres.in/api/login";

/* =========================================================
   AUTH CONTEXT (State Management via Context API)
========================================================= */
const AuthContext = createContext();

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("authUser");
    return stored ? JSON.parse(stored) : null;
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(AUTH_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials.");
      }
      const loggedInUser = { email, token: data.token };
      setUser(loggedInUser);
      localStorage.setItem("authUser", JSON.stringify(loggedInUser));
      return true;
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, error, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

/* =========================================================
   PAGES
========================================================= */

function Login({ goTo }) {
  const { login, error, loading } = useAuth();
  const [email, setEmail] = useState("eve.holt@reqres.in");
  const [password, setPassword] = useState("cityslicka");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) goTo("dashboard");
  };

  return (
    <div style={styles.centerBox}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Login</h2>
        {error && <p style={{ color: "red" }}>{error}</p>}
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
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    goTo("login");
  };

  return (
    <div style={styles.centerBox}>
      <h2>Dashboard</h2>
      <p>Welcome, {user?.email}</p>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button style={styles.button} onClick={() => goTo("profile")}>
          Go to Profile
        </button>
        <button style={styles.buttonDanger} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

function Profile({ goTo }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    goTo("login");
  };

  return (
    <div style={styles.centerBox}>
      <h2>Profile</h2>
      <p>Email: {user?.email}</p>
      <p>Token: {user?.token}</p>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button style={styles.button} onClick={() => goTo("dashboard")}>
          Back to Dashboard
        </button>
        <button style={styles.buttonDanger} onClick={handleLogout}>
          Logout
        </button>
      </div>
    </div>
  );
}

/* =========================================================
   PROTECTED PAGE WRAPPER (manual routing, no react-router-dom)
========================================================= */
function ProtectedPage({ children, goTo }) {
  const { user } = useAuth();

  if (!user) {
    // Redirect unauthenticated users to login
    React.useEffect(() => {
      goTo("login");
    }, []);
    return null;
  }

  return children;
}

/* =========================================================
   APP ROOT
   Simple state-based "routing" — page can be:
   "login" | "dashboard" | "profile"
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
};