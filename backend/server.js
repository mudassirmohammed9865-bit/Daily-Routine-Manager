const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const SECRET = "mysecretkey";
require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let routines = []; // In-memory storage for routines
/*sign up*/

app.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const hashed = await bcrypt.hash(password, 10);

  const user = new User({ email, password: hashed });

  await user.save();

  res.json({ message: "User created" });
});

/*login*/
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "User not found" });

  const match = await bcrypt.compare(password, user.password);

  if (!match) return res.status(400).json({ message: "Wrong password" });

  const token = jwt.sign({ id: user._id }, SECRET);

  res.json({ token });
});
/*auth middleware*/

function auth(req, res, next) {
  const token = req.headers.authorization;

  if (!token) return res.status(401).send("No token");

  try {
    const decoded = jwt.verify(token, SECRET);
    req.userId = decoded.id;
    next();
  } catch {
    res.status(401).send("Invalid token");
  }
}

/* ➕ Add Routine */
app.post("/add", auth, async (req, res) => {
  const newRoutine = new Routine({
    ...req.body,
    userId: req.userId
  });

  await newRoutine.save();
  res.send("Saved");
});

/* 📥 Get by Date */
app.post("/add", auth, async (req, res) => {
  const newRoutine = new Routine({
    ...req.body,
    userId: req.userId
  });

  await newRoutine.save();
  res.send("Saved");
});

/* ✏️ Update */
app.put("/update/:id", auth, async (req, res) => {
  const updated = await Routine.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );

  if (!updated) {
    return res.status(404).send("Not found");
  }

  res.send("Updated");
});

/* ❌ Delete */
app.delete("/delete/:id", auth, async (req, res) => {
  await Routine.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId
  });
  res.send("Deleted");
});

const path = require("path");

// Serve frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// Default route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);
