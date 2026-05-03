const mongoose = require("mongoose");

const routineSchema = new mongoose.Schema({
  date: String,
  time: String,
  activity: String,
  desc: String,
  completed: Boolean
});

module.exports = mongoose.model("Routine", routineSchema);