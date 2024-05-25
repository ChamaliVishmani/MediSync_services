const mongoose = require("mongoose");

const articleSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: String,
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Article", articleSchema);
