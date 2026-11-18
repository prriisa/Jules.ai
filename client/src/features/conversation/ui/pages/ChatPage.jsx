import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Menu, Sparkles } from "lucide-react";
import gsap from "gsap";
import { useAuth } from "../../../auth/hooks/useAuth.js";
import ThemeToggle from "../../../../components/ThemeToggle.jsx";
import { useConversations } from "../../hooks/useConversations.js";
import ChatComposer from "../components/ChatComposer.jsx";
import ConversationSidebar from "../components/ConversationSidebar.jsx";
import MessageThread from "../components/MessageThread.jsx";

const suggestions = [
  { title: "Find a fresh perspective", prompt: "Help me look at a challenge from a new perspective." },
  { title: "Make a plan", prompt: "Help me turn a big goal into a simple, realistic plan." },
  { title: "Write something together", prompt: "Help me get started on a piece of writing." },
  { title: "Learn something new", prompt: "Explain a topic I’ve been curious about in a simple way." }
];

export default function ChatPage() {
  const { user, logout, error: authError } = useAuth();
  const {
    activeConversation,
    activeId,
    clearError,
    error: conversationError,
    items,
    sendMessage,
    selectConversation,
    startConversation
  } = useConversations();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState(null);
  const [draft, setDraft] = useState("");
  const pageRef = useRef(null);
  const bottomRef = useRef(null);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined;
    const context = gsap.context(() => {
      gsap.fromTo(".chat-topbar", { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" });
      gsap.fromTo(".chat-intro", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.72, stagger: 0.1, delay: 0.08, ease: "power3.out" });
      gsap.fromTo(".suggestion-card", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, delay: 0.25, ease: "power2.out" });
    }, pageRef);
    return () => context.revert();
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [activeId, activeConversation?.messages.length]);

  const handleNewConversation = useCallback(() => {
    clearError();
    startConversation();
    setSidebarOpen(false);
  }, [clearError, startConversation]);

  const handleSend = useCallback((content) => {
    clearError();
    const saved = sendMessage(content);
    if (saved) setDraft("");
    return saved;
  }, [clearError, sendMessage]);

  const handleLogout = async () => {
    setLoggingOut(true);
    setLogoutError(null);
    try {
      await logout();
    } catch (error) {
      setLogoutError(error.message);
    } finally {
      setLoggingOut(false);
    }
  };

  const firstName = user?.name?.split(" ")[0] || "friend";

  return (
    <main className="flex h-[100dvh] overflow-hidden bg-canvas text-ink transition-colors duration-300 dark:bg-canvas dark:text-ink" ref={pageRef}>
      {sidebarOpen && (
        <button
          aria-label="Close sidebar"
          className="fixed inset-0 z-30 bg-black/35 backdrop-blur-[2px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
          type="button"
        />
      )}
      <div className={`chat-sidebar fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-out lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <ConversationSidebar
          activeId={activeId}
          conversations={items}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
          onNewConversation={handleNewConversation}
          onSelectConversation={selectConversation}
          user={user}
        />
      </div>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="chat-topbar flex h-[68px] shrink-0 items-center justify-between border-b border-line px-4 backdrop-blur-xl sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-label="Open sidebar"
              className="icon-button lg:hidden"
              onClick={() => setSidebarOpen(true)}
              type="button"
            >
              <Menu size={19} />
            </button>
            <span className="max-w-[42vw] truncate font-display text-[16px] font-medium tracking-[-0.03em] sm:max-w-[38vw] lg:max-w-[420px]">
              {activeConversation?.title || "A new conversation"}
            </span>
            <span className="hidden rounded-full border border-line px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-faint sm:inline-flex">
              Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-[11px] text-ink-faint md:inline">A space to think out loud</span>
            <ThemeToggle />
          </div>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div className="flex-1 overflow-y-auto">
            {activeConversation?.messages.length ? (
              <>
                <MessageThread conversation={activeConversation} />
                <div ref={bottomRef} className="h-px" />
              </>
            ) : (
              <div className="mx-auto flex min-h-full w-full max-w-[820px] flex-col justify-center px-5 pb-8 pt-12 sm:px-8">
                <div className="chat-intro mb-8 grid h-12 w-12 place-items-center rounded-2xl bg-panel text-jules">
                  <Sparkles size={21} />
                </div>
                <p className="chat-intro mb-3 text-[11px] font-semibold uppercase tracking-[0.17em] text-jules">
                  A little space for your ideas
                </p>
                <h1 className="chat-intro max-w-[620px] font-display text-[38px] font-medium leading-[1.13] tracking-[-0.045em] sm:text-[52px]">
                  What’s on your mind, {firstName}?
                </h1>
                <p className="chat-intro mt-4 max-w-[470px] text-[14px] leading-6 text-ink-muted">
                  Start anywhere. A question, a half-formed thought, or something you’re curious about.
                </p>
                <div className="mt-9 grid max-w-[690px] grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      className="suggestion-card group rounded-2xl border border-line bg-surface p-4 text-left text-ink transition duration-200 hover:-translate-y-0.5 hover:border-jules/35 hover:shadow-soft"
                      key={suggestion.title}
                      onClick={() => {
                        setDraft(suggestion.prompt);
                      }}
                      type="button"
                    >
                      <span className="mb-3 grid h-7 w-7 place-items-center rounded-lg bg-panel text-jules">
                        <Sparkles size={14} className={index % 2 ? "rotate-12" : ""} />
                      </span>
                      <span className="suggestion-card-title block text-[12px] font-medium">{suggestion.title}</span>
                      <span className="suggestion-card-prompt mt-1 block text-[11px] leading-5">{suggestion.prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-full px-4 pb-4 pt-3 sm:px-8 sm:pb-6">
            {conversationError && (
              <p className="mx-auto mb-3 max-w-[760px] rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-600 dark:text-red-300" role="alert">
                {conversationError}
              </p>
            )}
            {logoutError && (
              <p className="mx-auto mb-3 max-w-[760px] rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-600 dark:text-red-300" role="alert">
                {logoutError}
              </p>
            )}
            {authError && (
              <p className="mx-auto mb-3 max-w-[760px] rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs text-red-600 dark:text-red-300" role="alert">
                {authError}
              </p>
            )}
            {loggingOut && <p className="sr-only" role="status">Signing out…</p>}
            <ChatComposer draft={draft} onDraftChange={setDraft} onSend={handleSend} />
            <p className="mx-auto mt-3 max-w-[760px] text-center text-[10px] text-ink-faint">
              Jules preview · Chats are saved in this browser · AI responses aren’t connected yet
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
