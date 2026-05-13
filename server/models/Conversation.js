const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  role:    { type: String, enum: ["user", "assistant"], required: true },
  content: { type: String, required: true },
}, { timestamps: true });

const conversationSchema = new mongoose.Schema({
  owner:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  persona:  { type: mongoose.Schema.Types.ObjectId, ref: "Persona" },
  title:    { type: String, default: "New Chat" },
  messages: [messageSchema],
  model:    { type: String, default: "llama-3.3-70b-versatile" },
}, { timestamps: true });

conversationSchema.index({ owner: 1, updatedAt: -1 });

module.exports = mongoose.model("Conversation", conversationSchema);
