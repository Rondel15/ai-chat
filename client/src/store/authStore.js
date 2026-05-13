import { create } from "zustand";
import api from "../lib/api";

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  loading: true,

  init: async () => {
    const token = localStorage.getItem("token");
    if (!token) return set({ loading: false });
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data.user, token, loading: false });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.token);
    set({ user: data.user, token: data.token });
  },

  register: async (username, email, password) => {
    const { data } = await api.post("/auth/register", { username, email, password });
    localStorage.setItem("token", data.token);
    set({ user: data.user, token: data.token });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
