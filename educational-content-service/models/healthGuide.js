const mongoose = require("mongoose");

const healthGuideSchema = new mongoose.Schema({
  title: String,
  content: String,
  category: String,
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("HealthGuide", healthGuideSchema);
