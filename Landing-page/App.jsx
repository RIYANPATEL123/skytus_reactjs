import { useState } from "react";

const products = [
  { id: 1, name: "Wireless Earbuds", price: 1299, image: "https://placehold.co/150x150?text=Earbuds" },
  { id: 2, name: "Running Shoes",    price: 899,  image: "https://placehold.co/150x150?text=Shoes" },
  { id: 3, name: "Coffee Mug",       price: 299,  image: "https://placehold.co/150x150?text=Mug" },
  { id: 4, name: "Backpack",         price: 749,  image: "https://placehold.co/150x150?text=Backpack" },
  { id: 5, name: "Desk Lamp",        price: 599,  image: "https://placehold.co/150x150?text=Lamp" },
  { id: 6, name: "Notebook Set",     price: 199,  image: "https://placehold.co/150x150?text=Notebook" },
];

function Header({ search, setSearch, cartCount }) {
  return (
    <header style={{ background: "#131921", padding: "12px 20px", display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
      <h1 style={{ color: "#ff9f00", margin: 0, fontSize: 22 }}>🛒 ShopKart</h1>
      <input
        placeholder="Search..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ flex: 1, padding: "8px 12px", borderRadius: 4, border: "none", minWidth: 150 }}
      />
      <span style={{ color: "#fff" }}>Cart ({cartCount})</span>
    </header>
  );
}

function ProductCard({ product, onAdd }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 8, padding: 12, textAlign: "center" }}>
      <img src={product.image} alt={product.name} style={{ width: "100%" }} />
      <p style={{ fontWeight: "bold", margin: "8px 0 4px" }}>{product.name}</p>
      <p style={{ color: "#888", margin: "0 0 8px" }}>₹{product.price}</p>
      <button onClick={() => onAdd(product)} style={{ background: "#ff9f00", border: "none", padding: "8px 16px", borderRadius: 4, cursor: "pointer", fontWeight: "bold" }}>
        Add to Cart
      </button>
    </div>
  );
}

function Footer() {
  return (
    <footer style={{ background: "#131921", color: "#aaa", textAlign: "center", padding: 20, marginTop: 20 }}>
      <p>© 2024 ShopKart. All rights reserved.</p>
    </footer>
  );
}

export default function App() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]);

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ fontFamily: "Arial, sans-serif", background: "#f0f2f2", minHeight: "100vh" }}>

      <Header search={search} setSearch={setSearch} cartCount={cart.length} />

      {/* Banner */}
      <div style={{ background: "#232f3e", color: "#fff", textAlign: "center", padding: "32px 20px" }}>
        <h2>Big Sale — Up to 70% Off!</h2>
      </div>

      {/* Product Grid */}
      <main style={{ padding: 20 }}>
        <h3>Products</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} onAdd={(p) => setCart([...cart, p])} />
          ))}
        </div>
      </main>

      <Footer />

    </div>
  );
}