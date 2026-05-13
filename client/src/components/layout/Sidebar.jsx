import { useEffect, useState } from "react";
import api from "../../lib/api";
import useChatStore from "../../store/chatStore";
import useAuthStore from "../../store/authStore";
import { formatDistanceToNow } from "date-fns";

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const {
    conversations, activeConversation, activePersona, personas,
    setConversations, setPersonas, setActivePersona,
    loadConversation, newChat, removeConversation,
  } = useChatStore();

  const [search, setSearch] = useState("");
  const [showPersonas, setShowPersonas] = useState(false);

  useEffect(() => {
    api.get("/conversations").then(({ data }) => setConversations(data.conversations));
    api.get("/personas").then(({ data }) => setPersonas(data.personas));
  }, []);

  const handleLoadConversation = async (id) => {
    const { data } = await api.get(`/conversations/${id}`);
    loadConversation(data.conversation);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    await api.delete(`/conversations/${id}`);
    removeConversation(id);
    if (activeConversation?._id === id) newChat();
  };

  const filtered = conversations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-64 flex flex-col bg-panel border-r border-border h-screen">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-accent rounded-md flex items-center justify-center text-surface font-bold text-xs">AI</div>
          <span className="text-soft font-semibold text-sm">AI Chat</span>
        </div>
        <button
          onClick={newChat}
          title="New chat"
          className="w-7 h-7 flex items-center justify-center text-muted hover:text-soft hover:bg-card rounded-md transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
        </button>
      </div>

      {/* Persona selector */}
      <div className="px-3 py-2 border-b border-border">
        <button
          onClick={() => setShowPersonas(!showPersonas)}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-card border border-border hover:border-accent transition-colors text-left"
        >
          <span className="text-base">{activePersona?.emoji || "🤖"}</span>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-soft truncate">{activePersona?.name || "Select persona"}</p>
            <p className="text-[10px] text-muted">Active persona</p>
          </div>
          <svg className={`w-3 h-3 text-muted transition-transform ${showPersonas ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
        </button>

        {showPersonas && (
          <div className="mt-1 space-y-0.5 max-h-48 overflow-y-auto">
            {personas.map(p => (
              <button
                key={p._id}
                onClick={() => { setActivePersona(p); setShowPersonas(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs transition-colors ${activePersona?._id === p._id ? "bg-accent/20 text-accent" : "text-muted hover:bg-card hover:text-soft"}`}
              >
                <span>{p.emoji}</span>
                <span className="truncate">{p.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search chats..."
          className="w-full bg-card border border-border rounded-lg px-3 py-1.5 text-xs text-soft placeholder-muted focus:outline-none focus:border-accent transition-colors"
        />
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto px-2">
        <p className="text-[10px] text-muted uppercase tracking-wider px-2 mb-1">Recent Chats</p>
        {filtered.length === 0 && (
          <p className="text-muted text-xs text-center py-6">No conversations yet</p>
        )}
        {filtered.map(conv => (
          <div
            key={conv._id}
            onClick={() => handleLoadConversation(conv._id)}
            className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors mb-0.5 ${activeConversation?._id === conv._id ? "bg-accent/15 text-accent" : "text-muted hover:bg-card hover:text-soft"}`}
          >
            <span className="text-sm flex-shrink-0">{conv.persona?.emoji || "💬"}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{conv.title}</p>
              <p className="text-[10px] text-muted">{formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}</p>
            </div>
            <button
              onClick={(e) => handleDelete(e, conv._id)}
              className="opacity-0 group-hover:opacity-100 text-muted hover:text-red-400 transition-all flex-shrink-0"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border flex items-center gap-2">
        <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-accent text-xs font-medium">
          {user?.username?.[0]?.toUpperCase()}
        </div>
        <span className="text-xs text-soft flex-1 truncate">{user?.username}</span>
        <button onClick={logout} title="Sign out" className="text-muted hover:text-soft transition-colors text-xs">⏻</button>
      </div>
    </aside>
  );
}
