const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const articleRoutes = require("./routes/articleRoutes");
const videoRoutes = require("./routes/videoRoutes");
const healthGuideRoutes = require("./routes/healthGuideRoutes");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors()); // Add this line to enable CORS

// Database connection
mongoose
  .connect("mongodb://localhost:27017/eduContentService", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

// Routes
app.use("/api/articles", articleRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/healthguides", healthGuideRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
