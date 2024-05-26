const express = require("express");
const router = express.Router();
const healthGuideController = require("../controllers/healthGuideController");

router.get("/", healthGuideController.getAllHealthGuides);
router.post("/", healthGuideController.createHealthGuide);
router.get("/:id", healthGuideController.getHealthGuideById);
router.put("/:id", healthGuideController.updateHealthGuide);
router.delete("/:id", healthGuideController.deleteHealthGuide);

module.exports = router;
