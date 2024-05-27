// controllers/drugController.js
const Drug = require("../models/Drug");

// Add a new drug
exports.addDrug = async (req, res) => {
  const { name, interactions } = req.body;
  try {
    const newDrug = new Drug({ name, interactions });
    await newDrug.save();
    res.status(201).send(newDrug);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Get drug interactions by name
exports.getDrugInteractions = async (req, res) => {
  const { name } = req.params;
  try {
    const drug = await Drug.findOne({ name });
    if (!drug) return res.status(404).send({ error: "Drug not found" });
    res.send(drug);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};

// Check interactions between two drugs
exports.checkDrugInteraction = async (req, res) => {
  const { drug1, drug2 } = req.body;
  try {
    const drug = await Drug.findOne({ name: drug1 });
    if (!drug) return res.status(404).send({ error: "Drug not found" });

    const interaction = drug.interactions.find(
      (i) => i.drug.toLowerCase() === drug2.toLowerCase()
    );

    if (interaction) {
      res.send({ interaction: interaction.interaction });
    } else {
      res.send({ interaction: "No known interaction" });
    }
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
};
