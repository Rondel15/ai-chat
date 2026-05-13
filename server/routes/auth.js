const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Persona = require("../models/Persona");

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) return res.status(400).json({ error: "All fields required" });
    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) return res.status(409).json({ error: "Username or email taken" });
    const user = await User.create({ username, email, password });

    // Create default persona for new user
    await Persona.create({
      owner: user._id,
      name: "General Assistant",
      description: "A helpful, smart AI assistant",
      systemPrompt: "You are a helpful, smart, and friendly AI assistant. You give clear and concise answers. When writing code, always use proper formatting and explain what the code does.",
      emoji: "✨",
      isDefault: true,
    });

    res.status(201).json({ token: sign(user._id), user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ error: "Invalid credentials" });
    res.json({ token: sign(user._id), user });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET /api/auth/me
router.get("/me", require("../middleware/auth"), (req, res) => res.json({ user: req.user }));

module.exports = router;
