import React, { useState } from "react";
import "./App.css";

/* =========================================================
   REUSABLE COMPONENTS
========================================================= */

function Navbar({ theme, toggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const links = ["Home", "About", "Skills", "Projects", "Contact"];

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="navbar-brand">DevPortfolio</div>

      <button className="hamburger" onClick={toggleMenu} aria-label="Toggle menu">
        ☰
      </button>

      <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
        {links.map((link) => (
          <li key={link}>
            <a href={`#${link.toLowerCase()}`} onClick={closeMenu}>
              {link}
            </a>
          </li>
        ))}
        <li>
          <button className="theme-btn" onClick={toggleTheme}>
            {theme === "light" ? "🌙 Dark" : "☀️ Light"}
          </button>
        </li>
      </ul>
    </nav>
  );
}

function Hero() {
  return (
    <section id="home" className="hero">
      <h1>Hi, I'm Alex Carter</h1>
      <p>Frontend Developer crafting fast, accessible web experiences.</p>
      <a href="#contact" className="btn-primary">Get in Touch</a>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="section">
      <h2>About Me</h2>
      <p>
        I'm a passionate frontend developer with experience building responsive,
        user-friendly web applications using React and modern JavaScript. I love
        turning complex problems into simple, elegant interfaces.
      </p>
    </section>
  );
}

function SkillBadge({ name }) {
  return <span className="skill-badge">{name}</span>;
}

function Skills() {
  const skillList = ["React", "JavaScript", "HTML5", "CSS3", "Git", "Node.js", "Tailwind", "REST APIs"];

  return (
    <section id="skills" className="section">
      <h2>Skills</h2>
      <div className="skills-grid">
        {skillList.map((skill) => (
          <SkillBadge key={skill} name={skill} />
        ))}
      </div>
    </section>
  );
}

function ProjectCard({ title, description, tags }) {
  return (
    <div className="project-card">
      <h3>{title}</h3>
      <p>{description}</p>
      <div className="tags">
        {tags.map((tag) => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
    </div>
  );
}

function Projects() {
  const projectList = [
    {
      title: "E-Commerce Storefront",
      description: "A fully responsive online store with cart, checkout, and product filtering.",
      tags: ["React", "Context API", "Axios"],
    },
    {
      title: "Task Manager App",
      description: "A drag-and-drop kanban board for organizing daily tasks and projects.",
      tags: ["React", "React Hook Form", "LocalStorage"],
    },
    {
      title: "Weather Dashboard",
      description: "Real-time weather lookup app with dynamic backgrounds based on conditions.",
      tags: ["React", "REST API", "CSS Grid"],
    },
  ];

  return (
    <section id="projects" className="section">
      <h2>Projects</h2>
      <div className="projects-grid">
        {projectList.map((project) => (
          <ProjectCard key={project.title} {...project} />
        ))}
      </div>
    </section>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    const { name, email, message } = formData;

    if (!name.trim()) newErrors.name = "Name is required";
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email";
    }
    if (!message.trim()) newErrors.message = "Message is required";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setSubmitted(false);
      return;
    }

    setErrors({});
    setSubmitted(true);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section id="contact" className="section">
      <h2>Contact Me</h2>
      <form className="contact-form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <span className="error-text">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="text"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows="5"
            value={formData.message}
            onChange={handleChange}
          />
          {errors.message && <span className="error-text">{errors.message}</span>}
        </div>

        <button type="submit" className="btn-primary">Send Message</button>

        {submitted && <p className="success-text">Message sent successfully!</p>}
      </form>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} Alex Carter. All rights reserved.</p>
    </footer>
  );
}

/* =========================================================
   APP ROOT
========================================================= */
export default function App() {
  const [theme, setTheme] = useState("light");

  const toggleTheme = () => setTheme((prev) => (prev === "light" ? "dark" : "light"));

  return (
    <div className={`app ${theme}`}>
      <Navbar theme={theme} toggleTheme={toggleTheme} />
      <Hero />
      <About />
      <Skills />
      <Projects />
      <ContactForm />
      <Footer />
    </div>
  );
}