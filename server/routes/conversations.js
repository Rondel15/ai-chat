const router = require("express").Router();
const auth = require("../middleware/auth");
const Conversation = require("../models/Conversation");

// GET /api/conversations — list all
router.get("/", auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({ owner: req.user._id })
      .sort({ updatedAt: -1 })
      .select("title model updatedAt createdAt persona")
      .populate("persona", "name emoji")
      .lean();
    res.json({ conversations });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/conversations/:id — get full conversation with messages
router.get("/:id", auth, async (req, res) => {
  try {
    const conversation = await Conversation.findOne({ _id: req.params.id, owner: req.user._id })
      .populate("persona", "name emoji systemPrompt model");
    if (!conversation) return res.status(404).json({ error: "Not found" });
    res.json({ conversation });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/conversations/:id
router.delete("/:id", auth, async (req, res) => {
  try {
    await Conversation.deleteOne({ _id: req.params.id, owner: req.user._id });
    res.json({ message: "Deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE /api/conversations — delete all
router.delete("/", auth, async (req, res) => {
  try {
    await Conversation.deleteMany({ owner: req.user._id });
    res.json({ message: "All deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// PATCH /api/conversations/:id — rename
router.patch("/:id", auth, async (req, res) => {
  try {
    const { title } = req.body;
    const conversation = await Conversation.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { title },
      { new: true }
    );
    res.json({ conversation });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;
