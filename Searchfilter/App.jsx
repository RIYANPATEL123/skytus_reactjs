// App.jsx — Assessment 9: CRUD Application (React Hooks)
// Extended with: real-time search, filter, state lifting, useEffect, useRef
import { useState, useEffect, useMemo, useRef } from "react";

const initialTasks = [
  { id: 1, title: "Learn React Hooks", completed: true },
  { id: 2, title: "Build CRUD App", completed: false },
  { id: 3, title: "Practice useEffect", completed: false },
];

// ── Item Component ──────────────────────────────────────
function Item({ task, onDelete, onToggle, onEdit }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 14px",
      border:"1px solid #ddd", borderRadius:8, marginBottom:6,
      opacity: task.completed ? 0.6 : 1, background:"#fff" }}>
      <button onClick={() => onToggle(task.id)}
        style={{ width:22, height:22, borderRadius:"50%", border:"2px solid #aaa",
          background: task.completed ? "#22c55e" : "transparent", cursor:"pointer" }}>
        {task.completed ? "✓" : ""}
      </button>
      <span style={{ flex:1, textDecoration: task.completed ? "line-through" : "none" }}>
        {task.title}
      </span>
      <button onClick={() => onEdit(task)} disabled={task.completed}>✎</button>
      <button onClick={() => onDelete(task.id)} style={{ color:"red" }}>✕</button>
    </div>
  );
}

// ── List Component ───────────────────────────────────────
function List({ tasks, onDelete, onToggle, onEdit }) {
  if (tasks.length === 0) return <p>No tasks match your search or filter.</p>;
  return (
    <div>
      {tasks.map(task => (
        <Item key={task.id} task={task}
          onDelete={onDelete} onToggle={onToggle} onEdit={onEdit} />
      ))}
    </div>
  );
}

// ── Form Component ───────────────────────────────────────
function Form({ onAdd, editTask, onUpdate, onCancel }) {
  const [title, setTitle] = useState(() => editTask?.title || ""); // controlled input
  const [error, setError] = useState("");
  const inputRef = useRef(null);                // useRef — auto focus

  // Focus input when editTask changes
  useEffect(() => {
    inputRef.current.focus();                   // useRef usage
  }, [editTask]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) { setError("Task cannot be empty!"); return; }
    setError("");
    editTask ? onUpdate(editTask.id, title.trim()) : onAdd(title.trim());
    setTitle("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom:24 }}>
      <div style={{ display:"flex", gap:8 }}>
        {/* Controlled input */}
        <input ref={inputRef} value={title}
          onChange={e => { setTitle(e.target.value); setError(""); }}
          placeholder="Enter a task..."
          style={{ flex:1, padding:"8px 12px", border: error ? "1px solid red" : "1px solid #ddd", borderRadius:8 }} />
        <button type="submit">{editTask ? "Update" : "+ Add"}</button>
        {editTask && <button type="button" onClick={onCancel}>Cancel</button>}
      </div>
      {error && <p style={{ color:"red", fontSize:13 }}>{error}</p>}
    </form>
  );
}

// ── SearchFilter Component ────────────────────────────────
// Controlled search input + filter buttons; state lives in parent (state lifting)
function SearchFilter({ search, onSearchChange, filter, onFilterChange, searchRef }) {
  return (
    <div style={{ marginBottom:20 }}>
      {/* Controlled search input */}
      <input
        ref={searchRef}
        value={search}
        onChange={e => onSearchChange(e.target.value)}
        placeholder="🔍 Search tasks..."
        style={{
          width:"100%", padding:"8px 12px", border:"1px solid #ddd",
          borderRadius:8, marginBottom:10, boxSizing:"border-box", fontSize:14
        }}
      />
      {/* Filter buttons — pass filtered data to child via parent state */}
      <div style={{ display:"flex", gap:8 }}>
        {["all", "active", "completed"].map(f => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            style={{
              padding:"5px 14px", borderRadius:20, border:"1px solid #ddd",
              background: filter === f ? "#3b82f6" : "#f3f4f6",
              color: filter === f ? "#fff" : "#374151",
              cursor:"pointer", fontSize:13, textTransform:"capitalize"
            }}
          >
            {f}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── App (Parent) — holds all state ──────────────────────
export default function App() {
  const [tasks, setTasks] = useState(initialTasks);         // useState — CRUD data
  const [editTask, setEditTask] = useState(null);

  // Search & filter state lifted to parent
  const [search, setSearch] = useState("");                 // controlled search input
  const [filter, setFilter] = useState("all");              // filter state in parent

  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Apply search filter
    if (search.trim()) {
      result = result.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply status filter
    if (filter === "active") {
      result = result.filter(t => !t.completed);
    } else if (filter === "completed") {
      result = result.filter(t => t.completed);
    }

    return result;
  }, [search, filter, tasks]);

  const searchRef = useRef(null);                           // useRef — auto-focus search

  // Auto-focus search input on mount
  useEffect(() => {
    searchRef.current?.focus();
  }, []);

  // ADD
  const addTask = (title) =>
    setTasks(prev => [...prev, { id: Date.now(), title, completed: false }]);

  // DELETE
  const deleteTask = (id) =>
    setTasks(prev => prev.filter(t => t.id !== id));

  // TOGGLE
  const toggleTask = (id) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));

  // UPDATE
  const updateTask = (id, newTitle) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, title: newTitle } : t));
    setEditTask(null);
  };

  return (
    <div style={{ maxWidth:520, margin:"40px auto", padding:"0 16px", fontFamily:"sans-serif" }}>
      <h1>Task Manager</h1>
      <p style={{ color:"#888", marginBottom:24 }}>
        {tasks.length} Total · {tasks.filter(t=>t.completed).length} Done
      </p>

      {/* Form Component */}
      <Form onAdd={addTask} editTask={editTask}
        onUpdate={updateTask} onCancel={() => setEditTask(null)} />

      {/* SearchFilter — search & filter state maintained in parent (state lifting) */}
      <SearchFilter
        search={search}
        onSearchChange={setSearch}
        filter={filter}
        onFilterChange={setFilter}
        searchRef={searchRef}
      />

      {/* List Component → receives filtered data passed down from parent */}
      <List tasks={filteredTasks}
        onDelete={deleteTask} onToggle={toggleTask} onEdit={setEditTask} />
    </div>
  );
}