import React, { createContext, useContext, useState, Component } from "react";

/* =========================================================
   ENV VARIABLE
   Add this to a .env file in your project root:
   VITE_API_BASE_URL=https://reqres.in/api
========================================================= */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://reqres.in/api";

/* =========================================================
   AUTH CONTEXT (login + role)
========================================================= */
const AuthContext = createContext();

// Hardcoded demo users. In a real app these roles come from the
// login API response / decoded JWT claims.
const DEMO_USERS = [
  { email: "admin@example.com", password: "admin123", role: "admin", name: "Alex Admin" },
  { email: "user@example.com", password: "user123", role: "user", name: "Uma User" },
];

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("rbacUser");
    return stored ? JSON.parse(stored) : null;
  });
  const [error, setError] = useState(null);

  const login = (email, password) => {
    setError(null);
    const found = DEMO_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (!found) {
      setError("Invalid email or password.");
      return false;
    }
    const loggedInUser = { email: found.email, role: found.role, name: found.name };
    setUser(loggedInUser);
    localStorage.setItem("rbacUser", JSON.stringify(loggedInUser));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("rbacUser");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, error }}>
      {children}
    </AuthContext.Provider>
  );
}

const useAuth = () => useContext(AuthContext);

/* =========================================================
   ERROR BOUNDARY
========================================================= */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error.message || "Something went wrong." };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.centerBox}>
          <h3 style={{ color: "red" }}>⚠ Something went wrong</h3>
          <p>{this.state.message}</p>
          <button
            style={styles.button}
            onClick={() => this.setState({ hasError: false, message: "" })}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

/* =========================================================
   FORBIDDEN PAGE (graceful denial for unauthorized UI access)
========================================================= */
function Forbidden({ goTo }) {
  return (
    <div style={styles.centerBox}>
      <h2>403 — Forbidden</h2>
      <p>You don't have permission to view this page.</p>
      <button style={styles.button} onClick={() => goTo("home")}>
        Back to Dashboard
      </button>
    </div>
  );
}

/* =========================================================
   RBAC WRAPPER
========================================================= */
function RequireRole({ role, allowed, goTo, children }) {
  if (!allowed.includes(role)) {
    return <Forbidden goTo={goTo} />;
  }
  return children;
}

/* =========================================================
   LOGIN PAGE
========================================================= */
function Login({ goTo }) {
  const { login, error } = useAuth();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("admin123");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(email, password)) goTo("home");
  };

  return (
    <div style={styles.centerBox}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2>Login</h2>
        <p style={{ fontSize: 12, color: "#666" }}>
          Try admin@example.com / admin123 or user@example.com / user123
        </p>
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
        <button type="submit" style={styles.button}>
          Login
        </button>
      </form>
    </div>
  );
}

/* =========================================================
   ROLE-SPECIFIC PAGES
========================================================= */
function ManageUsers() {
  return (
    <div>
      <h3>Manage Users</h3>
      <ul>
        <li>Alex Admin — admin</li>
        <li>Uma User — user</li>
      </ul>
    </div>
  );
}

function ManageProducts() {
  return (
    <div>
      <h3>Manage Products</h3>
      <ul>
        <li>Wireless Mouse — $19.99</li>
        <li>Office Chair — $89.99</li>
      </ul>
    </div>
  );
}

function Profile() {
  const { user } = useAuth();
  return (
    <div>
      <h3>Profile</h3>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}

function Orders() {
  return (
    <div>
      <h3>My Orders</h3>
      <ul>
        <li>Order #1024 — Delivered</li>
        <li>Order #1031 — In Transit</li>
      </ul>
    </div>
  );
}

function Home() {
  const { user } = useAuth();
  return (
    <div>
      <h3>Welcome, {user.name}</h3>
      <p>Your role is: <strong>{user.role}</strong></p>
    </div>
  );
}

/* =========================================================
   LAYOUT (Sidebar + Header, links hidden based on role)
========================================================= */
function Sidebar({ page, goTo, role }) {
  const commonLinks = [{ key: "home", label: "Home" }];
  const adminLinks = [
    { key: "manage-users", label: "Manage Users" },
    { key: "manage-products", label: "Manage Products" },
  ];
  const userLinks = [
    { key: "profile", label: "Profile" },
    { key: "orders", label: "Orders" },
  ];

  // Admin routes are simply not rendered for non-admins —
  // this is the "hide admin routes from non-admin users" requirement.
  const links = [
    ...commonLinks,
    ...(role === "admin" ? adminLinks : []),
    ...(role === "user" ? userLinks : []),
  ];

  return (
    <div style={styles.sidebar}>
      <h3 style={{ color: "#fff", marginBottom: 20 }}>Dashboard</h3>
      {links.map((link) => (
        <div
          key={link.key}
          onClick={() => goTo(link.key)}
          style={{
            ...styles.sidebarLink,
            background: page === link.key ? "#444" : "transparent",
          }}
        >
          {link.label}
        </div>
      ))}
    </div>
  );
}

function Header({ user, logout, goTo }) {
  return (
    <div style={styles.header}>
      <span style={{ fontWeight: 600 }}>
        {user.name} <span style={{ color: "#888" }}>({user.role})</span>
      </span>
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
  );
}

function DashboardLayout({ goTo, page }) {
  const { user, logout } = useAuth();

  let content;
  if (page === "manage-users") {
    content = (
      <RequireRole role={user.role} allowed={["admin"]} goTo={goTo}>
        <ManageUsers />
      </RequireRole>
    );
  } else if (page === "manage-products") {
    content = (
      <RequireRole role={user.role} allowed={["admin"]} goTo={goTo}>
        <ManageProducts />
      </RequireRole>
    );
  } else if (page === "profile") {
    content = (
      <RequireRole role={user.role} allowed={["user", "admin"]} goTo={goTo}>
        <Profile />
      </RequireRole>
    );
  } else if (page === "orders") {
    content = (
      <RequireRole role={user.role} allowed={["user"]} goTo={goTo}>
        <Orders />
      </RequireRole>
    );
  } else {
    content = <Home />;
  }

  return (
    <div style={styles.layout}>
      <Sidebar page={page} goTo={goTo} role={user.role} />
      <div style={styles.main}>
        <Header user={user} logout={logout} goTo={goTo} />
        <div style={styles.content}>
          <ErrorBoundary>{content}</ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   APP ROOT (state-based routing, no react-router-dom)
========================================================= */
function AppContent() {
  const { user } = useAuth();
  const [page, setPage] = useState("home");
  const goTo = (target) => setPage(target);

  if (!user) return <Login goTo={goTo} />;
  return <DashboardLayout goTo={goTo} page={page} />;
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
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
    width: "300px",
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
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
  },
  layout: { display: "flex", minHeight: "100vh", fontFamily: "sans-serif" },
  sidebar: { width: 220, background: "#1e1e1e", padding: "20px 10px" },
  sidebarLink: {
    color: "#ddd",
    padding: "10px 14px",
    borderRadius: 6,
    cursor: "pointer",
    marginBottom: 6,
  },
  main: { flex: 1, display: "flex", flexDirection: "column" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 24px",
    borderBottom: "1px solid #ddd",
  },
  content: { padding: "24px" },
};