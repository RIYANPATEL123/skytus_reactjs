import { useState, useEffect, useContext, createContext } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useParams, Link } from "react-router-dom";

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("tickr_user");
    return saved ? JSON.parse(saved) : null;
  });

  const login = (username) => {
    const u = { username };
    localStorage.setItem("tickr_user", JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem("tickr_user");
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return useContext(AuthContext);
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem("tickr_theme") || "dark");
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("tickr_theme", theme);
  }, [theme]);
  return [theme, setTheme];
}

function TickerTape() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&page=1&price_change_percentage=24h")
      .then((r) => r.json())
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  if (items.length === 0) return null;
  const loop = [...items, ...items];

  return (
    <div className="ticker-tape">
      <div className="ticker-track">
        {loop.map((c, i) => {
          const positive = c.price_change_percentage_24h >= 0;
          return (
            <span key={i} className="ticker-item">
              <span className="ticker-symbol">{c.symbol.toUpperCase()}</span>
              <span className="ticker-price">${c.current_price.toLocaleString()}</span>
              <span className={positive ? "ticker-change positive" : "ticker-change negative"}>
                {positive ? "▲" : "▼"} {Math.abs(c.price_change_percentage_24h).toFixed(1)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

function Navbar({ theme, setTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">TICKR</Link>
      <div className="nav-actions">
        <button className="theme-toggle" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? "Light" : "Dark"}
        </button>
        {user && (
          <>
            <span className="username">{user.username}</span>
            <button className="btn-ghost" onClick={handleLogout}>Log out</button>
          </>
        )}
      </div>
    </nav>
  );
}

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Enter both username and password");
      return;
    }
    login(username.trim());
    navigate("/");
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>TICKR</h1>
        <p className="auth-sub">Real-time market terminal</p>
        {error && <p className="error">{error}</p>}
        <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <button type="submit">Log in</button>
        <p className="hint">Demo login — any username / password works</p>
      </form>
    </div>
  );
}

function Sparkline({ data, positive }) {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 30 - ((v - min) / range) * 30;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox="0 0 100 30" className="sparkline" preserveAspectRatio="none">
      <polyline points={points} fill="none" stroke={positive ? "var(--green)" : "var(--red)"} strokeWidth="1.5" />
    </svg>
  );
}

function Dashboard() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("market_cap_desc");

  useEffect(() => {
    setLoading(true);
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=${sortBy}&per_page=50&page=1&sparkline=true&price_change_percentage=24h`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch market data");
        return res.json();
      })
      .then((data) => {
        setCoins(data);
        setError("");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sortBy]);

  const filtered = coins.filter(
    (c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="dashboard-header">
        <h2>Market overview</h2>
        <div className="controls">
          <input className="search" placeholder="Search coin..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="market_cap_desc">Market cap</option>
            <option value="volume_desc">Volume</option>
            <option value="price_desc">Price</option>
            <option value="id_asc">Name</option>
          </select>
        </div>
      </div>

      {loading && <p className="status">Loading market data...</p>}
      {error && <p className="status error">{error}</p>}

      <div className="coin-grid">
        {filtered.map((coin) => {
          const positive = coin.price_change_percentage_24h >= 0;
          return (
            <Link to={`/coin/${coin.id}`} key={coin.id} className="coin-card">
              <div className="coin-top">
                <img src={coin.image} alt={coin.name} />
                <div>
                  <p className="coin-name">{coin.name}</p>
                  <p className="coin-symbol">{coin.symbol.toUpperCase()}</p>
                </div>
              </div>
              <Sparkline data={coin.sparkline_in_7d?.price} positive={positive} />
              <div className="coin-bottom">
                <p className="coin-price">${coin.current_price.toLocaleString()}</p>
                <p className={positive ? "change positive" : "change negative"}>
                  {positive ? "+" : ""}
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </p>
              </div>
            </Link>
          );
        })}
      </div>
      {!loading && filtered.length === 0 && <p className="status">No coins match your search.</p>}
    </div>
  );
}

function LineChart({ points }) {
  if (!points || points.length === 0) return null;
  const values = points.map((p) => p[1]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 600;
  const height = 200;
  const path = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="line-chart" preserveAspectRatio="none">
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2" />
    </svg>
  );
}

function CoinDetail() {
  const { id } = useParams();
  const [coin, setCoin] = useState(null);
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false`).then((r) => r.json()),
      fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7`).then((r) => r.json()),
    ])
      .then(([coinData, chartData]) => {
        setCoin(coinData);
        setChart(chartData.prices);
        setError("");
      })
      .catch(() => setError("Failed to load coin data"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page"><p className="status">Loading...</p></div>;
  if (error) return <div className="page"><p className="status error">{error}</p></div>;
  if (!coin) return null;

  const md = coin.market_data;
  const positive = md.price_change_percentage_24h >= 0;

  return (
    <div className="page">
      <Link to="/" className="back-link">← Back to dashboard</Link>
      <div className="detail-header">
        <img src={coin.image?.large} alt={coin.name} />
        <div>
          <h2>
            {coin.name} <span className="coin-symbol">{coin.symbol?.toUpperCase()}</span>
          </h2>
          <p className="detail-price">${md.current_price.usd.toLocaleString()}</p>
          <p className={positive ? "change positive" : "change negative"}>
            {positive ? "+" : ""}
            {md.price_change_percentage_24h?.toFixed(2)}% (24h)
          </p>
        </div>
      </div>

      <LineChart points={chart} />

      <div className="stats-grid">
        <div className="stat"><p className="label">Market cap</p><p>${md.market_cap.usd.toLocaleString()}</p></div>
        <div className="stat"><p className="label">24h volume</p><p>${md.total_volume.usd.toLocaleString()}</p></div>
        <div className="stat"><p className="label">24h high</p><p>${md.high_24h.usd.toLocaleString()}</p></div>
        <div className="stat"><p className="label">24h low</p><p>${md.low_24h.usd.toLocaleString()}</p></div>
        <div className="stat"><p className="label">Market cap rank</p><p>#{coin.market_cap_rank}</p></div>
        <div className="stat"><p className="label">Circulating supply</p><p>{md.circulating_supply?.toLocaleString()}</p></div>
      </div>
    </div>
  );
}

function AppLayout() {
  const [theme, setTheme] = useTheme();
  const { user } = useAuth();

  return (
    <>
      <Navbar theme={theme} setTheme={setTheme} />
      {user && <TickerTape />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/coin/:id" element={<ProtectedRoute><CoinDetail /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}