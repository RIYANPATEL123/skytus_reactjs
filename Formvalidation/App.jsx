import { useState, useEffect } from "react";

export default function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [errors, setErrors] = useState({});

  // sessionStorage - save on every change
  useEffect(() => {
    sessionStorage.setItem("form_draft", JSON.stringify({ name, email }));
  }, [name, email]);

  // sessionStorage - load on page open
  useEffect(() => {
    const saved = JSON.parse(sessionStorage.getItem("form_draft") || "{}");
    if (saved.name) setName(saved.name);
    if (saved.email) setEmail(saved.email);
  }, []);

  // validate single field
  function validate(field, value) {
    if (field === "name" && !value.trim()) return "Name is required";
    if (field === "email") {
      if (!value.trim()) return "Email is required";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email";
    }
    if (field === "password") {
      if (!value) return "Password is required";
      if (value.length < 8) return "Min 8 characters";
      if (!/[A-Z]/.test(value)) return "Need one uppercase letter";
      if (!/[0-9]/.test(value)) return "Need one number";
      if (!/[^A-Za-z0-9]/.test(value)) return "Need one special character";
    }
    if (field === "confirm") {
      if (!value) return "Please confirm password";
      if (value !== password) return "Passwords do not match";
    }
    return "";
  }

  // input event - validate while typing
  function handleInput(field, value) {
    if (field === "name") setName(value);
    if (field === "email") setEmail(value);
    if (field === "password") setPassword(value);
    if (field === "confirm") setConfirm(value);

    setErrors((prev) => ({ ...prev, [field]: validate(field, value) }));
  }

  // blur event - validate on leave
  function handleBlur(field, value) {
    setErrors((prev) => ({ ...prev, [field]: validate(field, value) }));
  }

  // submit event - check all fields
  function handleSubmit(e) {
    e.preventDefault();

    const newErrors = {
      name: validate("name", name),
      email: validate("email", email),
      password: validate("password", password),
      confirm: validate("confirm", confirm),
    };

    setErrors(newErrors);

    const hasError = Object.values(newErrors).some((err) => err !== "");
    if (hasError) return; // prevent submission

    alert("Form submitted successfully!");
    sessionStorage.removeItem("form_draft");
  }

  return (
    <div>
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>

        <div>
          <label>Name</label><br />
          <input
            type="text"
            value={name}
            onChange={(e) => handleInput("name", e.target.value)}
            onBlur={(e) => handleBlur("name", e.target.value)}
          />
          {errors.name && <p style={{ color: "red" }}>{errors.name}</p>}
        </div>

        <div>
          <label>Email</label><br />
          <input
            type="email"
            value={email}
            onChange={(e) => handleInput("email", e.target.value)}
            onBlur={(e) => handleBlur("email", e.target.value)}
          />
          {errors.email && <p style={{ color: "red" }}>{errors.email}</p>}
        </div>

        <div>
          <label>Password</label><br />
          <input
            type="password"
            value={password}
            onChange={(e) => handleInput("password", e.target.value)}
            onBlur={(e) => handleBlur("password", e.target.value)}
          />
          {errors.password && <p style={{ color: "red" }}>{errors.password}</p>}
        </div>

        <div>
          <label>Confirm Password</label><br />
          <input
            type="password"
            value={confirm}
            onChange={(e) => handleInput("confirm", e.target.value)}
            onBlur={(e) => handleBlur("confirm", e.target.value)}
          />
          {errors.confirm && <p style={{ color: "red" }}>{errors.confirm}</p>}
        </div>

        <br />
        <button type="submit">Submit</button>

      </form>
    </div>
  );
}