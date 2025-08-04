import { Task, Status } from "./types.js";
import { StatusTitle, StatusType } from "./constants.js";

const statuses: Status[] = [
  {
    type: StatusType.TODO,
    title: StatusTitle.TODO,
  },
  {
    type: StatusType.IN_PROGRESS,
    title: StatusTitle.IN_PROGRESS,
  },
  {
    type: StatusType.DONE,
    title: StatusTitle.DONE,
  },
];

let tasks: Task[] = loadTasks();

const app = document.getElementById("app")!;

function saveTasks() {
  localStorage.setItem("trello-tasks", JSON.stringify(tasks));
}

function loadTasks(): Task[] {
  const saved = localStorage.getItem("trello-tasks");
  return saved ? JSON.parse(saved) : [];
}

function renderBoard() {
  app.innerHTML = "";
  const board = document.createElement("div");
  board.className = "board";

  for (const status of statuses) {
    const column = document.createElement("div");
    column.className = "column";
    column.style.setProperty(
      "--column-color",
      `var(--${status.type.toLowerCase().trim().replace(/_/g, "-")}-color)`
    );
    column.dataset.status = status.type;

    const header = document.createElement("h2");
    header.innerText = status.title;
    column.appendChild(header);

    const statusTasks = tasks.filter((t) => t.status.type === status.type);

    for (const task of statusTasks) {
      const taskDiv = createTaskElement(task);
      column.appendChild(taskDiv);
    }

    const form = document.createElement("form");
    form.className = "add-task-form";
    const input = document.createElement("input");
    input.placeholder = "New task";
    const addBtn = document.createElement("button");
    addBtn.type = "submit";
    addBtn.textContent = "+";

    form.appendChild(input);
    form.appendChild(addBtn);
    form.onsubmit = (e) => {
      e.preventDefault();
      if (input.value.trim()) {
        addTask(input.value.trim(), status);
        input.value = "";
      }
    };
    column.appendChild(form);

    column.addEventListener("dragover", (e) => {
      e.preventDefault();
    });

    column.addEventListener("drop", (e) => {
      const taskId = e.dataTransfer?.getData("text/plain");
      if (taskId) {
        const task = tasks.find((t) => t.id === taskId);
        if (task) {
          task.status = status;
          saveTasks();
          renderBoard();
        }
      }
    });

    board.appendChild(column);
  }

  app.appendChild(board);
}

function createTaskElement(task: Task): HTMLDivElement {
  const div = document.createElement("div");
  div.className = "task";
  div.draggable = true;
  div.dataset.id = task.id;

  const input = document.createElement("input");
  input.value = task.title;
  input.onchange = () => updateTask(task.id, input.value);

  const delBtn = document.createElement("button");
  delBtn.textContent = "🗑";
  delBtn.onclick = () => deleteTask(task.id);

  div.appendChild(input);
  div.appendChild(delBtn);

  div.addEventListener("dragstart", (e) => {
    e.dataTransfer?.setData("text/plain", task.id);
  });

  return div;
}

function addTask(title: string, status: Status) {
  tasks.push({ id: crypto.randomUUID(), title, status });
  saveTasks();
  renderBoard();
}

function updateTask(id: string, newTitle: string) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.title = newTitle;
    saveTasks();
    renderBoard();
  }
}

function deleteTask(id: string) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderBoard();
}

renderBoard();
