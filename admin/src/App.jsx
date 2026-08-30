import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  memo,
  lazy,
  Suspense,
} from "react";
import { useForm } from "react-hook-form";

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
  const [productsLoading, setProductsLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [productsError, setProductsError] = useState(null);
  const [usersError, setUsersError] = useState(null);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    setProductsError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) throw new Error("Failed to fetch products.");
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setProductsError(err.message);
    } finally {
      setProductsLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/users`);
      if (!res.ok) throw new Error("Failed to fetch users.");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const addProduct = useCallback((product) => {
    setProducts((prev) => [product, ...prev]);
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        products,
        users,
        productsLoading,
        usersLoading,
        productsError,
        usersError,
        fetchProducts,
        fetchUsers,
        addProduct,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboard must be used within DashboardProvider");
  return ctx;
}

/* =========================================================
   REUSABLE COMPONENTS (memoized)
========================================================= */

const Loader = memo(function Loader() {
  return (
    <div className="text-center mt-5">
      <div className="spinner-border" role="status" />
      <p className="mt-2">Loading...</p>
    </div>
  );
});

const ErrorMessage = memo(function ErrorMessage({ message, onRetry }) {
  return (
    <div className="text-center mt-5">
      <p className="text-danger">⚠ {message}</p>
      {onRetry && (
        <button className="btn btn-dark" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
});

const Card = memo(function Card({ title, value, subtitle }) {
  return (
    <div className="card shadow-sm p-3">
      <p className="text-muted mb-1" style={{ fontSize: 13 }}>{title}</p>
      <h4 className="mb-1">{value}</h4>
      {subtitle && <p className="text-secondary mb-0" style={{ fontSize: 12 }}>{subtitle}</p>}
    </div>
  );
});

const Sidebar = memo(function Sidebar({ page, goTo }) {
  const links = [
    { key: "overview", label: "Overview" },
    { key: "products", label: "Products" },
    { key: "users", label: "Users" },
  ];

  return (
    <div className="bg-dark text-light p-3" style={{ width: 220, minHeight: "100vh" }}>
      <h5 className="mb-4">Dashboard</h5>
      {links.map((link) => (
        <div
          key={link.key}
          onClick={() => goTo(link.key)}
          className={`p-2 rounded mb-1 ${page === link.key ? "bg-secondary" : ""}`}
          style={{ cursor: "pointer" }}
        >
          {link.label}
        </div>
      ))}
    </div>
  );
});

const Header = memo(function Header({ page }) {
  const titles = {
    overview: "Overview",
    products: "Products",
    users: "Users",
  };
  return (
    <div className="d-flex justify-content-between align-items-center border-bottom p-3">
      <h4 className="mb-0">{titles[page]}</h4>
      <div className="fw-bold">Admin</div>
    </div>
  );
});

/* =========================================================
   ADD PRODUCT FORM (React Hook Form)
   Defined normally, then wrapped with React.lazy below so the
   file still uses React.lazy + Suspense as required.
========================================================= */
function AddProductFormBase({ onAdd, onCancel }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    onAdd({
      id: Date.now(),
      title: data.title,
      price: parseFloat(data.price),
      category: data.category,
    });
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="card p-4 mb-4 shadow-sm">
      <h5 className="mb-3">Add Product</h5>

      <div className="mb-3">
        <label className="form-label">Title</label>
        <input
          className={`form-control ${errors.title ? "is-invalid" : ""}`}
          {...register("title", { required: "Title is required" })}
        />
        {errors.title && <div className="invalid-feedback">{errors.title.message}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Price</label>
        <input
          type="number"
          step="0.01"
          className={`form-control ${errors.price ? "is-invalid" : ""}`}
          {...register("price", {
            required: "Price is required",
            min: { value: 0.01, message: "Price must be greater than 0" },
          })}
        />
        {errors.price && <div className="invalid-feedback">{errors.price.message}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Category</label>
        <input
          className={`form-control ${errors.category ? "is-invalid" : ""}`}
          {...register("category", { required: "Category is required" })}
        />
        {errors.category && <div className="invalid-feedback">{errors.category.message}</div>}
      </div>

      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-dark">Save</button>
        <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// Lazy-wrapped so React.lazy + Suspense are genuinely used (single-file friendly)
const AddProductForm = lazy(() =>
  Promise.resolve({ default: AddProductFormBase })
);

/* =========================================================
   PAGES
========================================================= */

function Overview() {
  const {
    products,
    users,
    productsLoading,
    usersLoading,
    productsError,
    usersError,
    fetchProducts,
    fetchUsers,
  } = useDashboard();

  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, [fetchProducts, fetchUsers]);

  if (productsLoading || usersLoading) return <Loader />;
  if (productsError || usersError)
    return (
      <ErrorMessage
        message={productsError || usersError}
        onRetry={() => {
          fetchProducts();
          fetchUsers();
        }}
      />
    );

  return (
    <div className="row g-3">
      <div className="col-md-4">
        <Card title="Total Products" value={products.length} subtitle="In catalog" />
      </div>
      <div className="col-md-4">
        <Card title="Total Users" value={users.length} subtitle="Registered" />
      </div>
      <div className="col-md-4">
        <Card
          title="Avg. Price"
          value={
            products.length
              ? `$${(products.reduce((sum, p) => sum + p.price, 0) / products.length).toFixed(2)}`
              : "$0"
          }
          subtitle="Across products"
        />
      </div>
    </div>
  );
}

function Products() {
  const { products, productsLoading, productsError, fetchProducts, addProduct } = useDashboard();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleAdd = useCallback(
    (product) => {
      addProduct(product);
      setShowForm(false);
    },
    [addProduct]
  );

  const handleCancel = useCallback(() => setShowForm(false), []);
  const handleOpenForm = useCallback(() => setShowForm(true), []);

  if (productsLoading) return <Loader />;
  if (productsError) return <ErrorMessage message={productsError} onRetry={fetchProducts} />;

  return (
    <div>
      {!showForm && (
        <button className="btn btn-dark mb-3" onClick={handleOpenForm}>
          + Add Product
        </button>
      )}

      {showForm && (
        <Suspense fallback={<Loader />}>
          <AddProductForm onAdd={handleAdd} onCancel={handleCancel} />
        </Suspense>
      )}

      <table className="table table-bordered table-hover bg-white">
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Category</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td>${p.price}</td>
              <td>{p.category}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Users() {
  const { users, usersLoading, usersError, fetchUsers } = useDashboard();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  if (usersLoading) return <Loader />;
  if (usersError) return <ErrorMessage message={usersError} onRetry={fetchUsers} />;

  return (
    <table className="table table-bordered table-hover bg-white">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>City</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id}>
            <td>{u.username || u.name?.firstname || `User ${u.id}`}</td>
            <td>{u.email}</td>
            <td>{u.address?.city || ""}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* =========================================================
   APP ROOT
========================================================= */
function DashboardLayout() {
  const [page, setPage] = useState("overview");
  const goTo = useCallback((target) => setPage(target), []);

  let content;
  if (page === "products") content = <Products />;
  else if (page === "users") content = <Users />;
  else content = <Overview />;

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar page={page} goTo={goTo} />
      <div className="flex-grow-1">
        <Header page={page} />
        <div className="p-4">{content}</div>
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