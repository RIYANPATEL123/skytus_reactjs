import { useState } from "react";

// ── NAVBAR COMPONENT ──────────────────────────
// darkMode and toggleTheme are PROPS - data passed from App into Navbar
function Navbar({ darkMode, toggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <nav className="navbar navbar-dark bg-black px-4 py-3 d-flex justify-content-between align-items-center position-sticky ">

        {/* logo */}
        <a className="navbar-brand fw-bold fs-4" href="#">
          My<span className="text-info">Portfolio</span>
        </a>

        {/* desktop links */}
        <ul className="d-none d-md-flex list-unstyled mb-0 gap-4">
          <li><a href="#about" className="text-white text-decoration-none">About</a></li>
          <li><a href="#skills" className="text-white text-decoration-none">Skills</a></li>
          <li><a href="#projects" className="text-white text-decoration-none">Projects</a></li>
          <li><a href="#contact" className="text-white text-decoration-none">Contact</a></li>
        </ul>

        <div className="d-flex align-items-center gap-3">
          {/* theme toggle button - uses toggleTheme prop when clicked */}
          <button className="btn btn-outline-info btn-sm" onClick={toggleTheme}>
            {/* darkMode prop decides which icon to show */}
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

          {/* hamburger - only on mobile */}
          <button className="navbar-toggler d-md-none" onClick={() => setMenuOpen(!menuOpen)}>
            <span className="navbar-toggler-icon"></span>
          </button>
        </div>

      </nav>

      {/* mobile menu */}
      {menuOpen && (
        <div className="d-flex flex-column bg-black px-4 py-3 gap-3">
          <a href="#about" className="text-white text-decoration-none" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#skills" className="text-white text-decoration-none" onClick={() => setMenuOpen(false)}>Skills</a>
          <a href="#projects" className="text-white text-decoration-none" onClick={() => setMenuOpen(false)}>Projects</a>
          <a href="#contact" className="text-white text-decoration-none" onClick={() => setMenuOpen(false)}>Contact</a>
        </div>
      )}
    </div>
  );
}

// ── HERO COMPONENT ────────────────────────────
// darkMode is a PROP passed from App
function Hero({ darkMode }) {
  return (
    <section className={`${darkMode ? "bg-dark" : "bg-light"} text-${darkMode ? "white" : "dark"} min-vh-100 d-flex align-items-center`}>
      <div className="container text-center">

        <p className="text-info fw-semibold mb-2">Welcome to my portfolio</p>

        <h1 className="display-3 fw-bold mb-3">
          Hi, I am <span className="text-info">Alex</span>
        </h1>

        <p className="fs-4 text-secondary mb-4">Full Stack Developer</p>

        <p className="lead text-secondary mb-5 mx-auto w-75">
          I build clean and fast web applications that look great on all devices.
        </p>

        <div className="d-flex justify-content-center gap-3">
          <a href="#projects" className="btn btn-info text-dark px-4 py-2 fw-bold">View Projects</a>
          <a href="#contact" className="btn btn-outline-info px-4 py-2">Contact Me</a>
        </div>

      </div>
    </section>
  );
}

// ── ABOUT COMPONENT ───────────────────────────
function About({ darkMode }) {
  return (
    <section id="about" className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "dark"} py-5`}>
      <div className="container py-5">

        <h2 className="fw-bold mb-2">About <span className="text-info">Me</span></h2>
        <div className="bg-info mb-4" style={{ width: "50px", height: "3px" }}></div>

        <div className="row align-items-center">

          {/* left side text */}
          <div className="col-md-7">
            <p className="text-secondary fs-5 mb-3">
              I am a passionate Full Stack Developer with 2 years of experience
              building modern web applications. I love turning ideas into reality
              through clean and efficient code.
            </p>
            <p className="text-secondary fs-5 mb-4">
              When I am not coding I enjoy reading, hiking and contributing
              to open source projects.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <span className="badge bg-info text-dark px-3 py-2 fs-6">📍 India</span>
              <span className="badge bg-info text-dark px-3 py-2 fs-6">💼 Open to Work</span>
              <span className="badge bg-info text-dark px-3 py-2 fs-6">🎓 B.Tech CSE</span>
            </div>
          </div>

          {/* right side avatar */}
          <div className="col-md-4 text-center mt-4 mt-md-0">
            <div
              className="bg-secondary rounded-circle d-flex align-items-center justify-content-center mx-auto"
              style={{ width: "200px", height: "200px", fontSize: "5rem" }}
            >
              👨‍💻
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ── SKILL BADGE COMPONENT ─────────────────────
// this is a reusable component - used inside Skills
// name is a PROP - each badge gets a different name passed in
function SkillBadge({ name }) {
  return (
    <span className="badge border border-info text-info px-4 py-2 fs-6">
      {name}
    </span>
  );
}

// ── SKILLS COMPONENT ──────────────────────────
function Skills({ darkMode }) {
  // ES6 array of skills
  const skills = ["React", "JavaScript", "HTML", "CSS", "Node.js", "Bootstrap", "Git", "MongoDB"];

  return (
    <section id="skills" className={`${darkMode ? "bg-dark" : "bg-light"} text-${darkMode ? "white" : "dark"} py-5`}>
      <div className="container py-5">

        <h2 className="fw-bold mb-2">My <span className="text-info">Skills</span></h2>
        <div className="bg-info mb-4" style={{ width: "50px", height: "3px" }}></div>

        <div className="d-flex flex-wrap gap-3">
          {/* ES6 map - loops through skills and renders a SkillBadge for each */}
          {/* name is passed as a PROP to SkillBadge */}
          {skills.map((skill) => (
            <SkillBadge key={skill} name={skill} />
          ))}
        </div>

      </div>
    </section>
  );
}

// ── PROJECT CARD COMPONENT ────────────────────
// reusable component - used inside Projects
// title, desc, tags are all PROPS
function ProjectCard({ title, desc, tags }) {
  return (
    <div className="col-md-4">
      <div className="bg-dark border border-secondary rounded-3 p-4 h-100">
        <h5 className="text-info fw-bold mb-2">{title}</h5>
        <p className="text-secondary mb-3">{desc}</p>
        <div className="d-flex flex-wrap gap-2">
          {/* ES6 map - loops through tags */}
          {tags.map((tag) => (
            <span key={tag} className="badge bg-info text-dark">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── PROJECTS COMPONENT ────────────────────────
function Projects({ darkMode }) {
  // ES6 array of objects - each object is one project
  const projects = [
    { title: "DevFlow", desc: "A real time collaborative code editor with live cursors.", tags: ["React", "Node.js", "Socket.IO"] },
    { title: "ShopWave", desc: "An e-commerce app with cart management and Stripe payments.", tags: ["Next.js", "Stripe", "MongoDB"] },
    { title: "WeatherApp", desc: "A weather forecast app that shows live weather using an API.", tags: ["React", "API", "CSS"] },
  ];

  return (
    <section id="projects" className={`${darkMode ? "bg-black" : "bg-white"} text-${darkMode ? "white" : "dark"} py-5`}>
      <div className="container py-5">

        <h2 className="fw-bold mb-2">My <span className="text-info">Projects</span></h2>
        <div className="bg-info mb-4" style={{ width: "50px", height: "3px" }}></div>

        <div className="row g-4">
          {/* ES6 destructuring - { title, desc, tags } taken out of each project object */}
          {projects.map(({ title, desc, tags }) => (
            // title, desc, tags passed as PROPS to ProjectCard
            <ProjectCard key={title} title={title} desc={desc} tags={tags} />
          ))}
        </div>

      </div>
    </section>
  );
}

// ── CONTACT COMPONENT ─────────────────────────
function Contact({ darkMode }) {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  // ES6 arrow function - updates form field when user types
  const handleChange = (e) => {
    // ES6 destructuring - taking name and value out of e.target
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // ES6 arrow function - validates and submits form
  const handleSubmit = (e) => {
    e.preventDefault();

    let errs = {};
    if (!form.name) errs.name = "Name is required";
    if (!form.email) errs.email = "Email is required";
    if (!form.message) errs.message = "Message is required";

    setErrors(errs);
    if (Object.keys(errs).length === 0) setSent(true);
  };

  return (
    <section id="contact" className={`${darkMode ? "bg-dark" : "bg-light"} text-${darkMode ? "white" : "dark"} py-5`}>
      <div className="container py-5">

        <h2 className="fw-bold mb-2">Contact <span className="text-info">Me</span></h2>
        <div className="bg-info mb-4" style={{ width: "50px", height: "3px" }}></div>

        {sent ? (
          <p className="text-info fs-5">✅ Message sent! I will get back to you soon.</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ maxWidth: "500px" }}>

            <div className="mb-3">
              <label className="form-label text-secondary">Name</label>
              <input
                name="name"
                placeholder="Your name"
                value={form.name}
                onChange={handleChange}
                className="form-control bg-black text-white border-secondary"
              />
              {errors.name && <small className="text-danger">{errors.name}</small>}
            </div>

            <div className="mb-3">
              <label className="form-label text-secondary">Email</label>
              <input
                name="email"
                placeholder="Your email"
                value={form.email}
                onChange={handleChange}
                className="form-control bg-black text-white border-secondary"
              />
              {errors.email && <small className="text-danger">{errors.email}</small>}
            </div>

            <div className="mb-3">
              <label className="form-label text-secondary">Message</label>
              <textarea
                name="message"
                placeholder="Your message"
                rows={4}
                value={form.message}
                onChange={handleChange}
                className="form-control bg-black text-white border-secondary"
              />
              {errors.message && <small className="text-danger">{errors.message}</small>}
            </div>

            <button type="submit" className="btn btn-info text-dark fw-bold px-4 py-2">
              Send Message
            </button>

          </form>
        )}

      </div>
    </section>
  );
}

// ── APP COMPONENT ─────────────────────────────
// main component - manages darkMode state and passes it to all sections as PROPS
export default function App() {
  // darkMode state lives here and is shared with all components via props
  const [darkMode, setDarkMode] = useState(true);

  // ES6 arrow function - flips dark mode on and off
  const toggleTheme = () => setDarkMode(!darkMode);

  return (
    <div>
      {/* darkMode and toggleTheme passed as PROPS to Navbar */}
      <Navbar darkMode={darkMode} toggleTheme={toggleTheme} />
      <Hero darkMode={darkMode} />
      <About darkMode={darkMode} />
      <Skills darkMode={darkMode} />
      <Projects darkMode={darkMode} />
      <Contact darkMode={darkMode} />
    </div>
  );
}