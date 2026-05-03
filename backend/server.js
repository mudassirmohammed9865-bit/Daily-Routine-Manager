const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let routines = []; // In-memory storage for routines

/* ➕ Add Routine */
app.post("/add", async (req, res) => {
  const newRoutine = { _id: Date.now().toString(), ...req.body };
  routines.push(newRoutine);
  res.send("Saved");
});

/* 📥 Get by Date */
app.get("/get/:date", async (req, res) => {
  const data = routines.filter(r => r.date === req.params.date);
  res.json(data);
});

/* ✏️ Update */
app.put("/update/:id", async (req, res) => {
  const index = routines.findIndex(r => r._id === req.params.id);
  if (index !== -1) {
    routines[index] = { ...routines[index], ...req.body };
    res.send("Updated");
  } else {
    res.status(404).send("Not found");
  }
});

/* ❌ Delete */
app.delete("/delete/:id", async (req, res) => {
  routines = routines.filter(r => r._id !== req.params.id);
  res.send("Deleted");
});

app.listen(5000, () =>
  console.log("Server running on port 5000")
);
const path = require("path");

// Serve frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});