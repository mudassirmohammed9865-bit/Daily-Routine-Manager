if (!localStorage.getItem("token")) {
  window.location.href = "/login.html";
}

// ✅ ADD THIS (GLOBAL TOKEN)
const token = localStorage.getItem("token");

// Dynamic API base URI
const API_BASE = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000'
  : '';

// Set today date
const today = new Date().toISOString().split("T")[0];
document.getElementById("date").value = today;
updateSelectedDateDisplay();

// Format date for display
function formatDateForDisplay(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// Update selected date display
function updateSelectedDateDisplay() {
  const dateValue = document.getElementById("date").value;
  const displayElement = document.getElementById("selectedDate");
  displayElement.textContent = dateValue
    ? formatDateForDisplay(dateValue)
    : "";
}

// Format time
function formatTime(time) {
  if (!time || !time.includes(":")) return "12:00 AM";

  let [hour, minute] = time.split(":");
  hour = parseInt(hour);
  minute = minute || "00";

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

  if (!activity) return alert("Please enter an activity");

  try {
    await fetch(`${API_BASE}/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token   // ✅ ADDED
      },
      body: JSON.stringify({ date, time, activity, desc, completed: false })
    });

    await render();
    document.getElementById("activity").value = "";
    document.getElementById("desc").value = "";
  } catch (err) {
    alert("Error adding routine: " + err.message);
  }
}

// 📥 RENDER
async function render() {
  const date = document.getElementById("date").value;

  try {
    const res = await fetch(`${API_BASE}/get/${date}`, {
      headers: {
        "Authorization": token   // ✅ ADDED
      }
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

// ✅ TOGGLE COMPLETE
async function toggleComplete(id) {
  try {
    const res = await fetch(`${API_BASE}/get/${document.getElementById("date").value}`, {
      headers: { "Authorization": token }
    });

    const routines = await res.json();
    const item = routines.find(r => r._id === id);

    if (item) {
      await fetch(`${API_BASE}/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token   // ✅ ADDED
        },
        body: JSON.stringify({ completed: !item.completed })
      });

      await render();
    }
  } catch (err) {
    alert(err.message);
  }
}

// ✏️ EDIT
async function editRoutine(id) {
  try {
    const res = await fetch(`${API_BASE}/get/${document.getElementById("date").value}`, {
      headers: { "Authorization": token }
    });

    const routines = await res.json();
    const item = routines.find(r => r._id === id);

    if (item) {
      const newActivity = prompt("Edit activity:", item.activity);
      const newDesc = prompt("Edit description:", item.desc);

      if (newActivity !== null && newDesc !== null) {
        await fetch(`${API_BASE}/update/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token   // ✅ ADDED
          },
          body: JSON.stringify({ activity: newActivity, desc: newDesc })
        });

        await render();
      }
    }
  } catch (err) {
    alert(err.message);
  }
}

// ❌ DELETE
async function deleteRoutine(id) {
  if (!confirm("Are you sure?")) return;

  try {
    await fetch(`${API_BASE}/delete/${id}`, {
      method: "DELETE",
      headers: {
        "Authorization": token   // ✅ ADDED
      }
    });

    await render();
  } catch (err) {
    alert(err.message);
  }
}

// Date change
document.getElementById("date").addEventListener("change", () => {
  updateSelectedDateDisplay();
  render();
});

// Initial load
render();