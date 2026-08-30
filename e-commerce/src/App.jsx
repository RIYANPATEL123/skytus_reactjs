import React, { createContext, useContext, useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useParams,
} from "react-router-dom";
import axios from "axios";
import "./App.css";

/* ========================================================
   ENV VARIABLE
   Add this to a .env file in your project root:
   VITE_API_BASE_URL=https://fakestoreapi.com
   (If using Create React App instead of Vite, use
    REACT_APP_API_BASE_URL and change import.meta.env below
    to process.env.REACT_APP_API_BASE_URL)
   ======================================================== */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://fakestoreapi.com";

/* ========================================================
   CART CONTEXT (State Management via Context API)
   ======================================================== */
const CartContext = createContext();

function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    if (quantity < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
}

/* ========================================================
   REUSABLE COMPONENTS: Loader, ErrorMessage, ProductCard
   ======================================================== */
function Loader() {
  return (
    <div style={styles.loaderContainer}>
      <div style={styles.spinner}></div>
      <p>Loading...</p>
    </div>
  );
}

function ErrorMessage({ message, onRetry }) {
  return (
    <div style={styles.errorContainer}>
      <p style={styles.errorText}>⚠️ {message || "Something went wrong."}</p>
      {onRetry && (
        <button style={styles.retryBtn} onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

function ProductCard({ product }) {
  const { addToCart } = useCart();
  return (
    <div style={styles.card}>
      <Link to={`/product/${product.id}`} style={styles.cardLink}>
        <img src={product.image} alt={product.title} style={styles.cardImage} />
        <h3 style={styles.cardTitle}>{product.title}</h3>
        <p style={styles.cardPrice}>${product.price}</p>
      </Link>
      <button style={styles.cardButton} onClick={() => addToCart(product)}>
        Add to Cart
      </button>
    </div>
  );
}

/* ========================================================
   PAGES: Home, ProductDetails, Cart
   ======================================================== */
function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/products`);
      setProducts(res.data);
    } catch (err) {
      setError("Failed to load products. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchProducts} />;

  return (
    <div style={{ padding: "20px" }}>
      <h1>Products</h1>
      <div style={styles.grid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

function ProductDetails() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/products/${id}`);
      setProduct(res.data);
    } catch (err) {
      setError("Failed to load product details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <ErrorMessage message={error} onRetry={fetchProduct} />;
  if (!product) return null;

  return (
    <div style={styles.detailsContainer}>
      <img src={product.image} alt={product.title} style={styles.detailsImage} />
      <div>
        <h1>{product.title}</h1>
        <p style={styles.detailsCategory}>{product.category}</p>
        <p style={styles.detailsPrice}>${product.price}</p>
        <p>{product.description}</p>
        <button style={styles.cardButton} onClick={() => addToCart(product)}>
          Add to Cart
        </button>
      </div>
    </div>
  );
}

function Cart() {
  const { cart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();

  if (cart.length === 0) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <h2>Your cart is empty</h2>
        <Link to="/">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Your Cart</h1>
      {cart.map((item) => (
        <div key={item.id} style={styles.cartRow}>
          <img src={item.image} alt={item.title} style={styles.cartImage} />
          <div style={{ flex: 1 }}>
            <h4>{item.title}</h4>
            <p>${item.price}</p>
            <div style={styles.qtyControls}>
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
              <span style={{ margin: "0 10px" }}>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
            </div>
          </div>
          <button style={styles.removeBtn} onClick={() => removeFromCart(item.id)}>
            Remove
          </button>
        </div>
      ))}
      <h2 style={{ marginTop: "20px" }}>Total: ${cartTotal.toFixed(2)}</h2>
      <button style={styles.clearBtn} onClick={clearCart}>
        Clear Cart
      </button>
    </div>
  );
}

/* ========================================================
   NAVBAR + APP ROOT
   ======================================================== */
function NavBar() {
  const { cartCount } = useCart();
  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.navLink}>Home</Link>
      <Link to="/cart" style={styles.navLink}>Cart ({cartCount})</Link>
    </nav>
  );
}

export default function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

/* ========================================================
   STYLES
   ======================================================== */
const styles = {
  nav: {
    display: "flex",
    gap: "20px",
    padding: "16px 20px",
    borderBottom: "1px solid #ddd",
  },
  navLink: {
    textDecoration: "none",
    color: "#222",
    fontWeight: "600",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "20px",
    marginTop: "20px",
  },
  card: {
    border: "1px solid #ddd",
    borderRadius: "10px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
  },
  cardLink: {
    textDecoration: "none",
    color: "inherit",
  },
  cardImage: {
    width: "150px",
    height: "150px",
    objectFit: "contain",
    marginBottom: "10px",
  },
  cardTitle: {
    fontSize: "14px",
    height: "40px",
    overflow: "hidden",
  },
  cardPrice: {
    fontWeight: "bold",
    margin: "8px 0",
  },
  cardButton: {
    marginTop: "10px",
    padding: "8px 14px",
    background: "#222",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    width: "100%",
  },
  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "60px 20px",
  },
  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #eee",
    borderTop: "4px solid #333",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  errorContainer: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#b00020",
  },
  errorText: {
    fontSize: "16px",
    marginBottom: "12px",
  },
  retryBtn: {
    padding: "8px 16px",
    background: "#333",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
  detailsContainer: {
    display: "flex",
    gap: "40px",
    padding: "20px",
    flexWrap: "wrap",
  },
  detailsImage: {
    width: "300px",
    height: "300px",
    objectFit: "contain",
  },
  detailsCategory: {
    textTransform: "capitalize",
    color: "#666",
  },
  detailsPrice: {
    fontSize: "22px",
    fontWeight: "bold",
    margin: "10px 0",
  },
  cartRow: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    borderBottom: "1px solid #eee",
    padding: "12px 0",
  },
  cartImage: {
    width: "70px",
    height: "70px",
    objectFit: "contain",
  },
  qtyControls: {
    display: "flex",
    alignItems: "center",
  },
  removeBtn: {
    background: "#b00020",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 12px",
    cursor: "pointer",
  },
  clearBtn: {
    marginTop: "10px",
    padding: "10px 16px",
    background: "#333",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};