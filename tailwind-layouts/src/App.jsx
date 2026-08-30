import React, { memo, useState, useCallback } from "react";

/* =========================================================
   NAVBAR (memoized, responsive)
========================================================= */
const Navbar = memo(function Navbar() {
  const [open, setOpen] = useState(false);
  const toggleOpen = useCallback(() => setOpen((o) => !o), []);

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <span className="text-xl font-bold text-indigo-600">Brand</span>

          {/* Desktop links */}
          <div className="hidden md:flex space-x-8">
            <a href="#" className="text-gray-700 hover:text-indigo-600">Home</a>
            <a href="#" className="text-gray-700 hover:text-indigo-600">Features</a>
            <a href="#" className="text-gray-700 hover:text-indigo-600">Pricing</a>
            <a href="#" className="text-gray-700 hover:text-indigo-600">Contact</a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-700 focus:outline-none"
            onClick={toggleOpen}
          >
            {open ? "✕" : "☰"}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 flex flex-col space-y-2">
            <a href="#" className="text-gray-700 hover:text-indigo-600">Home</a>
            <a href="#" className="text-gray-700 hover:text-indigo-600">Features</a>
            <a href="#" className="text-gray-700 hover:text-indigo-600">Pricing</a>
            <a href="#" className="text-gray-700 hover:text-indigo-600">Contact</a>
          </div>
        )}
      </div>
    </nav>
  );
});

/* =========================================================
   HERO SECTION (memoized, responsive)
========================================================= */
const Hero = memo(function Hero() {
  return (
    <section className="bg-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 flex flex-col lg:flex-row items-center gap-10">
        <div className="flex-1 text-center lg:text-left">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight">
            Build faster with <span className="text-indigo-600">Tailwind</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
            A fully responsive layout built with utility-first CSS — scales cleanly
            from mobile to desktop without writing custom stylesheets.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
              Get Started
            </button>
            <button className="border border-gray-300 px-6 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-100 transition">
              Learn More
            </button>
          </div>
        </div>
        <div className="flex-1 w-full">
          <div className="bg-white rounded-xl shadow-lg h-56 sm:h-72 lg:h-96 flex items-center justify-center text-gray-400">
            Hero Image Placeholder
          </div>
        </div>
      </div>
    </section>
  );
});

/* =========================================================
   REUSABLE CARD (memoized)
========================================================= */
const Card = memo(function Card({ title, description }) {
  return (
    <div className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition">
      <div className="w-10 h-10 bg-indigo-100 rounded-lg mb-4 flex items-center justify-center text-indigo-600 font-bold">
        ★
      </div>
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
});

/* =========================================================
   CARDS / GRID SECTION (responsive grid)
========================================================= */
const CardGrid = memo(function CardGrid() {
  const features = [
    { title: "Responsive", description: "Looks great on every screen size, from phones to large desktops." },
    { title: "Fast", description: "Utility classes mean no custom CSS to write or maintain." },
    { title: "Consistent", description: "A shared design system keeps spacing and color consistent." },
    { title: "Composable", description: "Small reusable components combine into full page layouts." },
    { title: "Accessible", description: "Semantic HTML with Tailwind styling stays screen-reader friendly." },
    { title: "Lightweight", description: "Only the classes you use end up in the final CSS bundle." },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-10">
        Features
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f) => (
          <Card key={f.title} title={f.title} description={f.description} />
        ))}
      </div>
    </section>
  );
});

/* =========================================================
   FOOTER (memoized, responsive)
========================================================= */
const Footer = memo(function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <h4 className="text-white font-bold mb-3">Brand</h4>
          <p className="text-sm">Building responsive UIs with Tailwind CSS.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Product</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Features</a></li>
            <li><a href="#" className="hover:text-white">Pricing</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">About</a></li>
            <li><a href="#" className="hover:text-white">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-white">Privacy</a></li>
            <li><a href="#" className="hover:text-white">Terms</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800 py-4 text-center text-sm">
        © {new Date().getFullYear()} Brand. All rights reserved.
      </div>
    </footer>
  );
});

/* =========================================================
   APP ROOT
========================================================= */
export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <Hero />
      <CardGrid />
      <Footer />
    </div>
  );
}