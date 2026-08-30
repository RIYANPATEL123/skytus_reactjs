import React, { createContext, useContext, useEffect, useState } from "react";

/* =========================================================
   ENV VARIABLE
   Add this to a .env file in your project root:
   VITE_DASHBOARD_API_URL=https://fakestoreapi.com
========================================================= */
const API_BASE_URL = import.meta.env.VITE_DASHBOARD_API_URL || "https://fakestoreapi.com";

/* =========================================================
   DASHBOARD CONTEXT (Global State via Context API)
========================================================= */
const DashboardContext = createContext();

function DashboardProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) throw new Error("Failed to fetch products.");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      if (!res.ok) throw new Error("Failed to fetch users.");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardContext.Provider
      value={{
        products,
        users,
        loading,
        error,
        fetchProducts,
        fetchUsers,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

const useDashboard = () => useContext(DashboardContext);

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function Loader() {
  return (
    <div style={styles.centerBox}>
      <p>Loading...</p>
    </div>
  );
}

function ErrorMessage({ message, onRetry }) {
  return (
    <div style={styles.centerBox}>
      <p style={{ color: "red" }}>⚠ {message}</p>
      {onRetry && (
        <button style={styles.button} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

function Card({ title, value, subtitle }) {
  return (
    <div style={styles.card}>
      <p style={styles.cardTitle}>{title}</p>
      <h2 style={styles.cardValue}>{value}</h2>
      {subtitle && <p style={styles.cardSubtitle}>{subtitle}</p>}
    </div>
  );
}

function Sidebar({ page, goTo }) {
  const links = [
    { key: "overview", label: "Overview" },
    { key: "products", label: "Products" },
    { key: "users", label: "Users" },
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

function Header({ page }) {
  const titles = {
    overview: "Overview",
    products: "Products",
    users: "Users",
  };
  return (
    <div style={styles.header}>
      <h2 style={{ margin: 0 }}>{titles[page]}</h2>
      <div style={styles.headerRight}>Admin</div>
    </div>
  );
}

/* =========================================================
   PAGES (nested "routes": /dashboard/overview, /products, /users)
========================================================= */

function Overview() {
  const { products, users, loading, error, fetchProducts, fetchUsers } =
    useDashboard();

  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);

  if (loading) return <Loader />;
  if (error)
    return (
      <ErrorMessage
        message={error}
        onRetry={() => {
          fetchProducts();
          fetchUsers();
        }}
      />
    );

  return (
    <div style={styles.grid}>
      <Card title="Total Products" value={products.length} subtitle="In catalog" />
      <Card title="Total Users" value={users.length} subtitle="Registered" />
      <Card
        title="Avg. Price"
        value={
          products.length
            ? `$${(
                products.reduce((sum, p) => sum + p.price, 0) / products.length
              ).toFixed(2)}`
            : "$0"
        }
        subtitle="Across products"
      />
    </div>
  );
}

function Products() {
  const { products, loading, error, fetchProducts } = useDashboard();

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchProducts} />;

  return (
    <div style={styles.grid}>
      {products.map((p) => (
        <Card key={p.id} title={p.title} value={`$${p.price}`} subtitle={p.category} />
      ))}
    </div>
  );
}

function Users() {
  const { users, loading, error, fetchUsers } = useDashboard();

  useEffect(() => {
    fetchUsers();
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchUsers} />;

  return (
    <div style={styles.grid}>
      {users.map((u) => (
        <Card
          key={u.id}
          title={u.username || u.name?.firstname || `User ${u.id}`}
          value={u.email}
          subtitle={u.address?.city || ""}
        />
      ))}
    </div>
  );
}

/* =========================================================
   APP ROOT
   Simple state-based nested routing (no react-router-dom):
   page can be "overview" | "products" | "users"
========================================================= */
function DashboardLayout() {
  const [page, setPage] = useState("overview");
  const goTo = (target) => setPage(target);

  let content;
  if (page === "products") content = <Products />;
  else if (page === "users") content = <Users />;
  else content = <Overview />;

  return (
    <div style={styles.layout}>
      <Sidebar page={page} goTo={goTo} />
      <div style={styles.main}>
        <Header page={page} />
        <div style={styles.content}>{content}</div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <DashboardProvider>
      <DashboardLayout />
    </DashboardProvider>
  );
}

/* =========================================================
   INLINE STYLES
========================================================= */
const styles = {
  layout: { display: "flex", minHeight: "100vh", fontFamily: "sans-serif" },
  sidebar: {
    width: 220,
    background: "#1e1e1e",
    padding: "20px 10px",
  },
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
  headerRight: { fontWeight: 600 },
  content: { padding: "24px" },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "16px",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "16px",
  },
  cardTitle: { margin: 0, fontSize: 13, color: "#666" },
  cardValue: { margin: "6px 0", fontSize: 22 },
  cardSubtitle: { margin: 0, fontSize: 12, color: "#999" },
  centerBox: { textAlign: "center", marginTop: 60 },
  button: {
    background: "#222",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: 6,
    cursor: "pointer",
  },
};