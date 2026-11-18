import { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ChatPage from "./features/conversation/ui/pages/ChatPage.jsx";
import { useAuth } from "./features/auth/hooks/useAuth.js";
import AuthPage from "./features/auth/ui/pages/AuthPage.jsx";

export default function App() {
  const { status, restoreSession } = useAuth();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  if (status === "loading") {
    return (
      <main className="grid min-h-screen place-items-center bg-canvas text-ink transition-colors duration-300 dark:bg-canvas dark:text-ink">
        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <span className="h-2 w-2 animate-pulse rounded-full bg-jules" />
          Preparing your space
        </div>
      </main>
    );
  }

  return (
    <Routes>
      <Route path="/auth" element={status === "authenticated" ? <Navigate to="/" replace /> : <AuthPage />} />
      <Route path="/" element={status === "authenticated" ? <ChatPage /> : <Navigate to="/auth" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}