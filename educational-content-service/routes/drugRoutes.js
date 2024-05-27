// routes/drugRoutes.js
const express = require("express");
const router = express.Router();
const drugController = require("../controllers/drugController");

// Add a new drug
router.post("/", drugController.addDrug);

// Get drug interactions by name
router.get("/:name", drugController.getDrugInteractions);

// Check interactions between two drugs
router.post("/check", drugController.checkDrugInteraction);

module.exports = router;
