// App.jsx — Assessment 9: CRUD Application (React Hooks)
import { useState, useEffect, useRef } from "react";

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
  if (tasks.length === 0) return <p>No tasks yet. Add one above!</p>;
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

// ── App (Parent) — holds all state 
export default function App() {
  const [tasks, setTasks] = useState(initialTasks);       // useState — CRUD data
  const [editTask, setEditTask] = useState(null);

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

      {/* List Component → Item Component (via props) */}
      <List tasks={tasks}
        onDelete={deleteTask} onToggle={toggleTask} onEdit={setEditTask} />
    </div>
  );
}