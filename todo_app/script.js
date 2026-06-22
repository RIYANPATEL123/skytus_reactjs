const todoInput = document.getElementById("todoInput");
const addBtn = document.getElementById("addBtn");
const todoList = document.getElementById("todoList");
const errorMsg = document.getElementById("errorMsg");

let todos = JSON.parse(localStorage.getItem("todos")) || [];

renderAll();

function saveToStorage() {
  localStorage.setItem("todos", JSON.stringify(todos));
}

function renderAll() {
  todoList.innerHTML = "";
  todos.forEach((todo, index) => {
    renderTodo(todo, index);
  });
}

function renderTodo(todo, index) {
  const li = document.createElement("li");

  const span = document.createElement("span");
  span.className = "todo-text";
  span.textContent = todo.text;

  if (todo.completed) {
    span.classList.add("completed");
  }

  const btnsDiv = document.createElement("div");
  btnsDiv.className = "todo-buttons";

  const doneBtn = document.createElement("button");
  doneBtn.className = "btn-done";
  doneBtn.textContent = todo.completed ? "Undo" : "Done";

  doneBtn.addEventListener("click", function() {
    todos[index].completed = !todos[index].completed;
    saveToStorage();
    renderAll();
  });

  const editBtn = document.createElement("button");
  editBtn.className = "btn-edit";
  editBtn.textContent = "Edit";

  editBtn.addEventListener("click", function() {
    const newText = prompt("Edit your task:", todo.text);
    if (newText !== null && newText.trim() !== "") {
      todos[index].text = newText.trim();
      saveToStorage();
      renderAll();
    }
  });

  const deleteBtn = document.createElement("button");
  deleteBtn.className = "btn-delete";
  deleteBtn.textContent = "Delete";

  deleteBtn.addEventListener("click", function(e) {
    e.stopPropagation();
    todos.splice(index, 1);
    saveToStorage();
    renderAll();
  });

  btnsDiv.appendChild(doneBtn);
  btnsDiv.appendChild(editBtn);
  btnsDiv.appendChild(deleteBtn);

  li.appendChild(span);
  li.appendChild(btnsDiv);

  todoList.appendChild(li);
}

function addTodo() {
  const text = todoInput.value.trim();

  if (text === "") {
    errorMsg.style.display = "block";
    return;
  }

  errorMsg.style.display = "none";

  const newTodo = {
    text: text,
    completed: false
  };

  todos.push(newTodo);
  saveToStorage();
  renderAll();
  todoInput.value = "";
}

addBtn.addEventListener("click", addTodo);

todoInput.addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    addTodo();
  }
});