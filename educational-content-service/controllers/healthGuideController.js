const HealthGuide = require("../models/healthGuide");

exports.getAllHealthGuides = async (req, res) => {
  try {
    const healthGuides = await HealthGuide.find();
    res.json(healthGuides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createHealthGuide = async (req, res) => {
  const healthGuide = new HealthGuide(req.body);
  try {
    const newHealthGuide = await healthGuide.save();
    res.status(201).json(newHealthGuide);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getHealthGuideById = async (req, res) => {
  try {
    const healthGuide = await HealthGuide.findById(req.params.id);
    if (!healthGuide)
      return res.status(404).json({ message: "Health guide not found" });
    res.json(healthGuide);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateHealthGuide = async (req, res) => {
  try {
    const healthGuide = await HealthGuide.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!healthGuide)
      return res.status(404).json({ message: "Health guide not found" });
    res.json(healthGuide);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteHealthGuide = async (req, res) => {
  try {
    const healthGuide = await HealthGuide.findByIdAndDelete(req.params.id);
    if (!healthGuide)
      return res.status(404).json({ message: "Health guide not found" });
    res.json({ message: "Health guide deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
