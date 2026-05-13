const router = require("express").Router();
const auth = require("../middleware/auth");
const Persona = require("../models/Persona");

// GET /api/personas
router.get("/", auth, async (req, res) => {
  try {
    const personas = await Persona.find({ owner: req.user._id }).sort({ isDefault: -1, createdAt: 1 });
    res.json({ personas });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/personas
router.post("/", auth, async (req, res) => {
  try {
    const { name, description, systemPrompt, emoji, model } = req.body;
    if (!name || !systemPrompt) return res.status(400).json({ error: "Name and system prompt required" });
    const persona = await Persona.create({ owner: req.user._id, name, description, systemPrompt, emoji: emoji || "🤖", model: model || "llama-3.1-70b-versatile" });
    res.status(201).json({ persona });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PUT /api/personas/:id
router.put("/:id", auth, async (req, res) => {
  try {
    const persona = await Persona.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true }
    );
    if (!persona) return res.status(404).json({ error: "Not found" });
    res.json({ persona });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/personas/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    const persona = await Persona.findOne({ _id: req.params.id, owner: req.user._id });
    if (!persona) return res.status(404).json({ error: "Not found" });
    if (persona.isDefault) return res.status(400).json({ error: "Cannot delete default persona" });
    await persona.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
