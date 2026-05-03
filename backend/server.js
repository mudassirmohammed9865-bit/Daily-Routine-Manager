require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User.js");
const Routine = require("./models/routine.js");
const path = require("path");

const SECRET = process.env.JWT_SECRET || "mysecretkey";

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/routine")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection failed:", err));

/*sign up*/
app.post("/signup", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashed });
    await user.save();

    res.json({ message: "User created successfully" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Error creating user" });
  }
});

/*login*/
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    if (!user) return res.status(400).json({ message: "User not found" });

    const match = await bcrypt.compare(password, user.password);

    if (!match) return res.status(400).json({ message: "Wrong password" });

    const token = jwt.sign({ id: user._id }, SECRET);

    res.json({ token });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
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
  try {
    const newRoutine = new Routine({
      ...req.body,
      userId: req.userId
    });

    await newRoutine.save();
    res.json({ message: "Routine saved", routine: newRoutine });
  } catch (err) {
    console.error("Add routine error:", err);
    res.status(500).json({ message: "Error saving routine" });
  }
});

/* 📥 Get by Date */
app.get("/get/:date", auth, async (req, res) => {
  try {
    const routines = await Routine.find({
      userId: req.userId,
      date: req.params.date
    });
    res.json(routines);
  } catch (err) {
    console.error("Get routines error:", err);
    res.status(500).json({ message: "Error fetching routines" });
  }
});

/* ✏️ Update */
app.put("/update/:id", auth, async (req, res) => {
  try {
    const updated = await Routine.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Routine not found" });
    }

    res.json({ message: "Updated", routine: updated });
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ message: "Error updating routine" });
  }
});

/* ❌ Delete */
app.delete("/delete/:id", auth, async (req, res) => {
  try {
    const deleted = await Routine.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!deleted) {
      return res.status(404).json({ message: "Routine not found" });
    }

    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Error deleting routine" });
  }
});

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
