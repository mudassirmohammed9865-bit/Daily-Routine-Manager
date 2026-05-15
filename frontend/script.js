// 🔐 Check login
if (!localStorage.getItem("token")) {
  window.location.href = "/login.html";
}

// Token
const token = localStorage.getItem("token");

// ✅ API BASE
const API = (() => {
  const host = window.location.hostname;
  const port = window.location.port;

  if (window.location.protocol === "file:") {
    return "http://localhost:5000";
  }

  if ((host === "localhost" || host === "127.0.0.1") && port && port !== "5000") {
    return "http://localhost:5000";
  }

  return window.location.origin;
})();

console.log("App API base:", API);

// Set today date
const today = new Date().toISOString().split("T")[0];
document.getElementById("date").value = today;
updateSelectedDateDisplay();

// Format date
function formatDateForDisplay(dateString) {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth()+1)
    .toString().padStart(2, '0')}-${date.getFullYear()}`;
}

// Update date display
function updateSelectedDateDisplay() {
  const dateValue = document.getElementById("date").value;
  document.getElementById("selectedDate").textContent =
    dateValue ? formatDateForDisplay(dateValue) : "";
}

// Format time
function formatTime(time) {
  if (!time || !time.includes(":")) return "12:00 AM";
  let [hour, minute] = time.split(":");
  hour = parseInt(hour);
  let ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

// ➕ ADD ROUTINE
async function addRoutine() {
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value || "12:00";
  const activity = document.getElementById("activity").value.trim();
  const desc = document.getElementById("desc").value.trim();

  if (!activity) return alert("Enter activity");

  try {
    await fetch(`${API}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({ date, time, activity, desc, completed: false })
    });

    render();
    document.getElementById("activity").value = "";
    document.getElementById("desc").value = "";
  } catch (err) {
    alert("Error: " + err.message);
  }
}

// 📥 RENDER
async function render() {
  const date = document.getElementById("date").value;

  try {
    const res = await fetch(`${API}/get/${date}`, {
      headers: { "Authorization": token }
    });

    const routines = await res.json();
    const timeline = document.getElementById("timeline");
    timeline.innerHTML = "";

    let completedCount = routines.filter(r => r.completed).length;

    routines.forEach(item => {
      const div = document.createElement("div");
      div.className = "block";

      div.innerHTML = `
        <div class="time">${formatTime(item.time)}</div>
        <div class="activity ${item.completed ? "completed" : ""}">
          ${item.activity}
        </div>
        <div class="desc">${item.desc}</div>
        <div class="actions">
          <button onclick="toggleComplete('${item._id}')">
            ${item.completed ? "Undo" : "Done"}
          </button>
          <button onclick="editRoutine('${item._id}')">Edit</button>
          <button onclick="deleteRoutine('${item._id}')">Delete</button>
        </div>
      `;

      timeline.appendChild(div);
    });

    updateProgress(routines.length, completedCount);
  } catch (err) {
    console.error(err);
  }
}

// 📊 Progress
function updateProgress(total, completed) {
  const percent = total ? Math.round((completed / total) * 100) : 0;
  document.getElementById("progressText").innerText = percent + "% Completed";
  document.getElementById("progressFill").style.width = percent + "%";
}

// ✅ TOGGLE
async function toggleComplete(id) {
  const res = await fetch(`${API}/get/${document.getElementById("date").value}`, {
    headers: { "Authorization": token }
  });

  const routines = await res.json();
  const item = routines.find(r => r._id === id);

  if (item) {
    await fetch(`${API}/update/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token
      },
      body: JSON.stringify({ completed: !item.completed })
    });

    render();
  }
}

// ✏️ EDIT
async function editRoutine(id) {
  const res = await fetch(`${API}/get/${document.getElementById("date").value}`, {
    headers: { "Authorization": token }
  });

  const routines = await res.json();
  const item = routines.find(r => r._id === id);

  if (item) {
    const newActivity = prompt("Edit activity:", item.activity);
    const newDesc = prompt("Edit description:", item.desc);

    if (newActivity && newDesc) {
      await fetch(`${API}/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token
        },
        body: JSON.stringify({ activity: newActivity, desc: newDesc })
      });

      render();
    }
  }
}

// ❌ DELETE
async function deleteRoutine(id) {
  if (!confirm("Delete?")) return;

  await fetch(`${API}/delete/${id}`, {
    method: "DELETE",
    headers: { "Authorization": token }
  });

  render();
}

// Date change
document.getElementById("date").addEventListener("change", () => {
  updateSelectedDateDisplay();
  render();
});

// 🚪 LOGOUT
function logout() {
  localStorage.removeItem("token");
  window.location.href = "/login.html";
}

// Load
render();