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
  if (dateValue) {
    displayElement.textContent = formatDateForDisplay(dateValue);
  } else {
    displayElement.textContent = "";
  }
}

// Format time
function formatTime(time) {
  if (!time || !time.includes(":")) {
    return "12:00 AM"; // Default time if invalid
  }

  let [hour, minute] = time.split(":");
  hour = parseInt(hour);
  minute = minute || "00"; // Default to 00 if minute is undefined

  let ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;

  return `${hour}:${minute} ${ampm}`;
}

// Add routine
async function addRoutine() {
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value || "12:00";
  const activity = document.getElementById("activity").value.trim();
  const desc = document.getElementById("desc").value.trim();

  if (!activity) {
    alert("Please enter an activity");
    return;
  }

  try {
    await fetch("http://localhost:5000/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
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

// Render
async function render() {
  const date = document.getElementById("date").value;

  try {
    const res = await fetch(`http://localhost:5000/get/${date}`);
    const routines = await res.json();

    const timeline = document.getElementById("timeline");
    timeline.innerHTML = "";

    let completedCount = 0;
    routines.forEach(item => {
      if (item.completed) completedCount++;
    });

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
          <button class="toggle-btn" data-id="${item._id}">
            ${item.completed ? "Undo" : "Done"}
          </button>
          <button class="edit-btn" data-id="${item._id}">Edit</button>
          <button class="delete-btn delete" data-id="${item._id}">Delete</button>
        </div>
      `;

      // Add event listeners
      const toggleBtn = div.querySelector('.toggle-btn');
      const editBtn = div.querySelector('.edit-btn');
      const deleteBtn = div.querySelector('.delete-btn');

      toggleBtn.addEventListener('click', () => toggleComplete(item._id));
      editBtn.addEventListener('click', () => editRoutine(item._id));
      deleteBtn.addEventListener('click', () => deleteRoutine(item._id));

      timeline.appendChild(div);
    });

    updateProgress(routines.length, completedCount);
  } catch (err) {
    console.error("Error rendering routines:", err);
  }
}

// Progress update
function updateProgress(total, completed) {
  const percent = total ? Math.round((completed / total) * 100) : 0;

  document.getElementById("progressText").innerText =
    percent + "% Completed";

  document.getElementById("progressFill").style.width =
    percent + "%";
}

// Toggle complete
async function toggleComplete(id) {
  try {
    const res = await fetch(`http://localhost:5000/get/${document.getElementById("date").value}`);
    const routines = await res.json();
    const item = routines.find(r => r._id === id);
    if (item) {
      await fetch(`http://localhost:5000/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ completed: !item.completed })
      });
      await render();
    }
  } catch (err) {
    alert("Error toggling complete: " + err.message);
  }
}

// Edit
async function editRoutine(id) {
  try {
    const res = await fetch(`http://localhost:5000/get/${document.getElementById("date").value}`);
    const routines = await res.json();
    const item = routines.find(r => r._id === id);
    if (item) {
      const newActivity = prompt("Edit activity:", item.activity);
      const newDesc = prompt("Edit description:", item.desc);

      if (newActivity !== null && newDesc !== null) {
        await fetch(`http://localhost:5000/update/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ activity: newActivity, desc: newDesc })
        });
        await render();
      }
    }
  } catch (err) {
    alert("Error editing routine: " + err.message);
  }
}

// Delete
async function deleteRoutine(id) {
  if (confirm("Are you sure you want to delete this routine?")) {
    try {
      await fetch(`http://localhost:5000/delete/${id}`, {
        method: "DELETE"
      });
      await render();
    } catch (err) {
      alert("Error deleting routine: " + err.message);
    }
  }
}

// Change date
document.getElementById("date").addEventListener("change", () => {
  updateSelectedDateDisplay();
  render();
});

// Initial load
render();