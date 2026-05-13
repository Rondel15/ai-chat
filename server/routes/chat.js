const router = require("express").Router();
const Groq = require("groq-sdk");
const auth = require("../middleware/auth");
const Conversation = require("../models/Conversation");
const Persona = require("../models/Persona");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// Allow guests — attach user if token exists, otherwise continue as guest
const optionalAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return next();
  try {
    const jwt = require("jsonwebtoken");
    const User = require("../models/User");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
  } catch {}
  next();
};

// POST /api/chat — send message with streaming
router.post("/", optionalAuth, async (req, res) => {
  try {
    const { conversationId, message, personaId } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "Message is required" });

    // Load or create conversation
    let conversation;
    if (req.user) {
      if (conversationId) {
        conversation = await Conversation.findOne({ _id: conversationId, owner: req.user._id });
        if (!conversation) return res.status(404).json({ error: "Conversation not found" });
      } else {
        const persona = personaId ? await Persona.findById(personaId) : await Persona.findOne({ owner: req.user._id, isDefault: true });
        conversation = await Conversation.create({
          owner: req.user._id,
          persona: persona?._id,
          model: persona?.model || "llama-3.3-70b-versatile",
          title: message.slice(0, 50),
        });
      }
    } else {
      // Guest — use in-memory conversation, no DB save
      conversation = {
        _id: null,
        messages: [],
        model: "llama-3.3-70b-versatile",
        persona: null,
        save: async () => {}, // no-op
      };
    }

    // Load persona system prompt
    const persona = conversation.persona ? await Persona.findById(conversation.persona) : null;
    const systemPrompt = persona?.systemPrompt || "You are a helpful AI assistant.";

    // Add user message
    conversation.messages.push({ role: "user", content: message });

    // Build message history for Groq
    const history = conversation.messages.map(m => ({ role: m.role, content: m.content }));
    const groqMessages = [{ role: "system", content: systemPrompt }, ...history];

    // Set up SSE streaming
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Send conversationId first so client can track it
    res.write(`data: ${JSON.stringify({ type: "meta", conversationId: conversation._id })}\n\n`);

    // Stream from Groq
    const stream = await groq.chat.completions.create({
      model: conversation.model,
      messages: groqMessages,
      stream: true,
      max_tokens: 2048,
    });

    let fullResponse = "";
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content || "";
      if (delta) {
        fullResponse += delta;
        res.write(`data: ${JSON.stringify({ type: "delta", content: delta })}\n\n`);
      }
    }

    if (req.user) {
      conversation.messages.push({ role: "assistant", content: fullResponse });
      if (conversation.title === "New Chat" || conversation.messages.length <= 2) {
        conversation.title = message.slice(0, 60) + (message.length > 60 ? "..." : "");
      }
      await conversation.save();
    }

    res.write(`data: ${JSON.stringify({ type: "done", conversationId: conversation._id })}\n\n`);
    res.end();
  } catch (err) {
    console.error("Chat error:", err);
    res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
    res.end();
  }
});

module.exports = router;
