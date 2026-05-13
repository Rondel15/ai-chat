const mongoose = require("mongoose");

const personaSchema = new mongoose.Schema({
  owner:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name:         { type: String, required: true },
  description:  { type: String, default: "" },
  systemPrompt: { type: String, required: true },
  emoji:        { type: String, default: "🤖" },
  model:        { type: String, default: "llama-3.3-70b-versatile" },
  isDefault:    { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Persona", personaSchema);
