import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import useAuthStore from "./store/authStore";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ChatPage from "./pages/ChatPage";

export default function App() {
  const init = useAuthStore((s) => s.init);
  useEffect(() => { init(); }, []);

  return (
    <Routes>
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/"         element={<ChatPage />} />
    </Routes>
  );
}
