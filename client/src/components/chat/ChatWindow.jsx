import { useEffect, useRef, useState } from "react";
import useChatStore from "../../store/chatStore";
import useAuthStore from "../../store/authStore";
import MessageBubble from "./MessageBubble";

const SUGGESTIONS = [
  "Explain how React hooks work",
  "Write a Python function to sort a list",
  "What is the difference between SQL and NoSQL?",
  "Help me debug this: undefined is not a function",
];

const GUEST_LIMIT = 20;
const getGuestCount = () => parseInt(localStorage.getItem("guestMsgCount") || "0");
const incrementGuestCount = () => localStorage.setItem("guestMsgCount", getGuestCount() + 1);

const BOONBOT_NAME = "BoonBot AI";
const BOONBOT_EMOJI = "🤖";
const BOONBOT_TAGLINE = "Your smart AI buddy";
const BOONBOT_DESCRIPTION = "I can help you write code, answer questions, brainstorm ideas, explain concepts, and much more. Just type a message or pick a suggestion below to get started!";

export default function ChatWindow() {
  const { user } = useAuthStore();
  const {
    messages, streaming, streamingContent, activeConversation,
    activePersona, addMessage, startStreaming, appendStream,
    finishStreaming, addConversationToSidebar, conversations,
  } = useChatStore();

  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const bottomRef = useRef();
  const textareaRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || streaming) return;

    // Guest limit check
    if (!user) {
      const count = getGuestCount();
      if (count >= GUEST_LIMIT) {
        setError("You've reached the 20 message limit. Register for unlimited access!");
        return;
      }
      incrementGuestCount();
    }

    setInput("");
    setError("");
    addMessage({ role: "user", content, createdAt: new Date() });
    startStreaming();

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message: content,
          conversationId: activeConversation?._id || null,
          personaId: activePersona?._id || null,
        }),
      });

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let convId = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n").filter(l => l.startsWith("data: "));

        for (const line of lines) {
          const json = JSON.parse(line.replace("data: ", ""));
          if (json.type === "meta") {
            convId = json.conversationId;
            if (!activeConversation?._id && !conversations.find(c => c._id === convId)) {
              addConversationToSidebar({
                _id: convId,
                title: content.slice(0, 50),
                persona: activePersona,
                updatedAt: new Date(),
              });
            }
          } else if (json.type === "delta") {
            appendStream(json.content);
          } else if (json.type === "done") {
            finishStreaming(convId);
          } else if (json.type === "error") {
            setError(json.message);
            finishStreaming(convId);
          }
        }
      }
    } catch (err) {
      setError("Failed to connect. Is the server running?");
      finishStreaming(null);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const isEmpty = messages.length === 0 && !streaming;
  const guestMessagesLeft = user ? null : GUEST_LIMIT - getGuestCount();

  const botName = activePersona?.name || BOONBOT_NAME;
  const botEmoji = activePersona?.emoji || BOONBOT_EMOJI;
  const botTagline = activePersona?.description || BOONBOT_TAGLINE;

  return (
    <div className="flex flex-col flex-1 h-screen">
      {/* Header */}
      <div className="px-6 py-3 border-b border-border flex items-center gap-3 bg-panel">
        <span className="text-lg">{botEmoji}</span>
        <div className="flex-1">
          <p className="text-sm font-semibold text-soft">{botName}</p>
          <p className="text-[11px] text-muted">{botTagline}</p>
        </div>
        {/* Guest message counter */}
        {!user && (
          <div className="flex items-center gap-2 text-xs text-muted">
            <span>{guestMessagesLeft} messages left</span>
            <a
              href="/register"
              className="bg-accent text-surface px-3 py-1.5 rounded-lg hover:bg-accent-dim transition-colors whitespace-nowrap"
            >
              Register Free
            </a>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-6 max-w-xl mx-auto">

            {/* Bot avatar + name */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center text-4xl shadow-sm">
                {botEmoji}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-soft">{botName}</h1>
                <p className="text-sm text-accent font-medium mt-0.5">{botTagline}</p>
              </div>
            </div>

            {/* About card */}
            <div className="bg-card border border-border rounded-2xl px-6 py-4 text-left w-full">
              <p className="text-sm text-muted leading-relaxed">{BOONBOT_DESCRIPTION}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {["💻 Coding", "✍️ Writing", "🧠 Brainstorming", "📚 Learning", "🔍 Research"].map((tag) => (
                  <span key={tag} className="text-xs bg-surface border border-border text-muted px-2.5 py-1 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Guest notice */}
            {!user && (
              <p className="text-muted text-xs">
                Try 20 messages for free ·{" "}
                <a href="/register" className="text-accent hover:underline">
                  Register for unlimited
                </a>
              </p>
            )}

            {/* Suggestions */}
            <div className="grid grid-cols-2 gap-2 w-full">
              {SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="text-left px-4 py-3 bg-card border border-border rounded-xl text-xs text-muted hover:text-soft hover:border-accent transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <MessageBubble key={i} message={msg} />
        ))}

        {streaming && streamingContent && (
          <MessageBubble
            message={{ role: "assistant", content: streamingContent }}
            isStreaming={true}
          />
        )}

        {streaming && !streamingContent && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center text-xs text-soft flex-shrink-0 mt-1">AI</div>
            <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 bg-muted rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm px-4 py-2 rounded-lg flex items-center justify-between gap-4">
            <span>{error}</span>
            {!user && (
              <a
                href="/register"
                className="bg-accent text-surface text-xs px-3 py-1.5 rounded-lg hover:bg-accent-dim transition-colors whitespace-nowrap"
              >
                Register Free
              </a>
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-border bg-panel">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3 bg-card border border-border rounded-2xl px-4 py-3 focus-within:border-accent transition-colors">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${botName}...`}
              rows={1}
              disabled={streaming}
              className="flex-1 bg-transparent text-sm text-soft placeholder-muted resize-none focus:outline-none max-h-40 disabled:opacity-50"
              style={{ minHeight: "24px" }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || streaming}
              className="bg-accent hover:bg-accent-dim disabled:opacity-30 text-surface p-2 rounded-xl transition-colors flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
            </button>
          </div>
          <p className="text-[10px] text-muted mt-1.5 text-center">Enter to send · Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  );
}
