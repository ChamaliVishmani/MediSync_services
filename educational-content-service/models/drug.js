// models/Drug.js
const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema({
  drug: String,
  interaction: String,
});

const drugSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  interactions: [interactionSchema],
});

const Drug = mongoose.model("Drug", drugSchema);

module.exports = Drug;
