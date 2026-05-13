import { create } from "zustand";

const useChatStore = create((set, get) => ({
  conversations: [],
  activeConversation: null,
  messages: [],
  personas: [],
  activePersona: null,
  streaming: false,
  streamingContent: "",

  setConversations: (conversations) => set({ conversations }),
  setPersonas: (personas) => set({ personas, activePersona: personas.find(p => p.isDefault) || personas[0] }),
  setActivePersona: (persona) => set({ activePersona: persona }),
  loadConversation: (conversation) => set({ activeConversation: conversation, messages: conversation.messages || [], streamingContent: "" }),
  newChat: () => set({ activeConversation: null, messages: [], streamingContent: "" }),
  addMessage: (message) => set((s) => ({ messages: [...s.messages, message] })),
  startStreaming: () => set({ streaming: true, streamingContent: "" }),
  appendStream: (delta) => set((s) => ({ streamingContent: s.streamingContent + delta })),

  finishStreaming: (conversationId) => {
    const { streamingContent, activeConversation } = get();
    set((s) => ({
      streaming: false,
      messages: [...s.messages, { role: "assistant", content: streamingContent, createdAt: new Date() }],
      streamingContent: "",
      activeConversation: activeConversation ? { ...activeConversation, _id: conversationId } : { _id: conversationId },
    }));
  },

  addConversationToSidebar: (conv) => set((s) => ({ conversations: [conv, ...s.conversations] })),
  removeConversation: (id) => set((s) => ({ conversations: s.conversations.filter(c => c._id !== id) })),
  updateConversationTitle: (id, title) => set((s) => ({
    conversations: s.conversations.map(c => c._id === id ? { ...c, title } : c),
  })),
}));

export default useChatStore;
