import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { Menu, Sparkles, Trash2 } from "lucide-react"
import gsap from "gsap"
import { useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../../../auth/hooks/useAuth.js"
import ThemeToggle from "../../../../components/ThemeToggle.jsx"
import { useConversations } from "../../hooks/useConversations.js"
import ChatComposer from "../components/ChatComposer.jsx"
import ConversationSidebar from "../components/ConversationSidebar.jsx"
import MessageThread from "../components/MessageThread.jsx"

const suggestions = [
  { title: "Find a fresh perspective", prompt: "Help me look at a challenge from a new perspective." },
  { title: "Make a plan", prompt: "Help me turn a big goal into a simple, realistic plan." },
  { title: "Write something together", prompt: "Help me get started on a piece of writing." },
  { title: "Learn something new", prompt: "Explain a topic I’ve been curious about in a simple way." }
]

export default function ChatPage() {
  const navigate = useNavigate()
  const { conversationId: routeConversationId } = useParams()
  const { user, logout, error: authError } = useAuth()
  const {
    activeConversation,
    activeId,
    clearError,
    deleteConversation,
    error: conversationError,
    items,
    loading: conversationsLoading,
    sendMessage,
    selectConversation,
    startConversation,
    sending
  } = useConversations()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia("(min-width: 1024px)").matches)
  const [loggingOut, setLoggingOut] = useState(false)
  const [logoutError, setLogoutError] = useState(null)
  const [conversationToDelete, setConversationToDelete] = useState(null)
  const [deletingConversation, setDeletingConversation] = useState(false)
  const [draft, setDraft] = useState("")
  const [newConversationTransition, setNewConversationTransition] = useState(0)
  const pageRef = useRef(null)
  const bottomRef = useRef(null)
  const lastActiveIdRef = useRef(null)

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)")
    const updateViewport = (event) => setIsDesktop(event.matches)
    media.addEventListener("change", updateViewport)
    return () => media.removeEventListener("change", updateViewport)
  }, [])

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined
    const context = gsap.context(() => {
      const topbar = pageRef.current?.querySelector(".chat-topbar")
      const intro = pageRef.current?.querySelectorAll(".chat-intro")
      const cards = pageRef.current?.querySelectorAll(".suggestion-card")
      if (topbar) gsap.fromTo(topbar, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.45, ease: "power2.out" })
      if (intro?.length) gsap.fromTo(intro, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.72, stagger: 0.1, delay: 0.08, ease: "power3.out" })
      if (cards?.length) gsap.fromTo(cards, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, delay: 0.25, ease: "power2.out" })
    }, pageRef)
    return () => context.revert()
  }, [])

  useLayoutEffect(() => {
    if (!newConversationTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined
    const context = gsap.context(() => {
      const intro = pageRef.current?.querySelectorAll(".chat-intro")
      const cards = pageRef.current?.querySelectorAll(".suggestion-card")
      if (intro?.length) {
        gsap.fromTo(
          intro,
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.42, stagger: 0.055, ease: "power2.out" }
        )
      }
      if (cards?.length) {
        gsap.fromTo(
          cards,
          { autoAlpha: 0, y: 10 },
          { autoAlpha: 1, y: 0, duration: 0.32, stagger: 0.045, delay: 0.12, ease: "power2.out" }
        )
      }
    }, pageRef)
    return () => context.revert()
  }, [newConversationTransition])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" })
  }, [activeId, activeConversation?.messages.length])

  useEffect(() => {
    if (conversationsLoading) return

    if (routeConversationId === "new") {
      const pendingConversation = items.find((item) => item.id.startsWith("pending-"))
      if (pendingConversation) {
        lastActiveIdRef.current = pendingConversation.id
        if (activeId !== pendingConversation.id) selectConversation(pendingConversation.id)
        return
      }

      if (lastActiveIdRef.current?.startsWith("pending-") && activeId && !activeId.startsWith("pending-")) {
        lastActiveIdRef.current = activeId
        navigate(`/conversation/${encodeURIComponent(activeId)}`, { replace: true })
        return
      }
      lastActiveIdRef.current = startConversation()
      return
    }

    if (routeConversationId) {
      const routedConversation = items.find((item) => item.id === routeConversationId)
      if (routedConversation) {
        lastActiveIdRef.current = routedConversation.id
        if (activeId !== routedConversation.id) selectConversation(routedConversation.id)
        return
      }

      const fallback = items[0]
      navigate(
        fallback
          ? `/conversation/${encodeURIComponent(fallback.id)}`
          : "/",
        { replace: true }
      )
      return
    }

    const activeConversationFromList = items.find((item) => item.id === activeId) || items[0]
    if (activeConversationFromList) {
      lastActiveIdRef.current = activeConversationFromList.id
      navigate(
        activeConversationFromList.id.startsWith("pending-")
          ? "/conversation/new"
          : `/conversation/${encodeURIComponent(activeConversationFromList.id)}`,
        { replace: true }
      )
    }
  }, [
    activeId,
    conversationsLoading,
    items,
    navigate,
    routeConversationId,
    selectConversation,
    startConversation
  ])

  const handleNewConversation = useCallback(() => {
    clearError()
    lastActiveIdRef.current = startConversation()
    navigate("/conversation/new")
    setNewConversationTransition((transition) => transition + 1)
    setSidebarOpen(false)
  }, [clearError, navigate, startConversation])

  const closeSidebar = () => {
    if (isDesktop) setSidebarCollapsed(true)
    else setSidebarOpen(false)
  }

  const openSidebar = () => {
    if (isDesktop) setSidebarCollapsed(false)
    else setSidebarOpen(true)
  }

  const handleSelectConversation = useCallback((id) => {
    selectConversation(id)
    navigate(id.startsWith("pending-") ? "/conversation/new" : `/conversation/${encodeURIComponent(id)}`)
  }, [navigate, selectConversation])

  const handleSend = useCallback(async (content) => {
    clearError()
    const saved = await sendMessage(content)
    if (saved) setDraft("")
    return saved
  }, [clearError, sendMessage])

  const handleDeleteConversation = (conversation) => {
    clearError()
    setConversationToDelete(conversation)
  }

  const confirmDeleteConversation = async () => {
    if (!conversationToDelete || deletingConversation) return
    setDeletingConversation(true)
    const deleted = await deleteConversation(conversationToDelete.id)
    setDeletingConversation(false)
    if (deleted) setConversationToDelete(null)
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    setLogoutError(null)
    try {
      await logout()
    } catch (error) {
      setLogoutError(error.message)
    } finally {
      setLoggingOut(false)
    }
  }

  const firstName = user?.name?.split(" ")[0] || "friend"

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
      <div className={`chat-sidebar fixed inset-y-0 left-0 z-40 transition-transform duration-300 ease-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} ${sidebarCollapsed ? "lg:hidden" : "lg:static lg:translate-x-0"}`}>
        <ConversationSidebar
          activeId={activeId}
          conversations={items}
          onClose={closeSidebar}
          onDeleteConversation={handleDeleteConversation}
          onLogout={handleLogout}
          onNewConversation={handleNewConversation}
          onSelectConversation={handleSelectConversation}
          user={user}
        />
      </div>

      {conversationToDelete && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-4 backdrop-blur-md"
          onClick={(event) => {
            if (event.target === event.currentTarget && !deletingConversation) {
              setConversationToDelete(null)
              clearError()
            }
          }}
        >
          <section
            aria-describedby="delete-conversation-description"
            aria-labelledby="delete-conversation-title"
            aria-modal="true"
            className="w-full max-w-[420px] rounded-2xl border border-line bg-surface p-6 shadow-soft"
            role="dialog"
          >
            <span className="mb-4 grid h-11 w-11 place-items-center rounded-xl bg-red-500/10 text-red-600 dark:text-red-300">
              <Trash2 size={20} />
            </span>
            <h2 className="font-display text-xl font-semibold text-ink" id="delete-conversation-title">
              Delete conversation?
            </h2>
            <p className="mt-2 text-sm leading-6 text-ink-muted" id="delete-conversation-description">
              “{conversationToDelete.title}” and its message history will be permanently deleted.
            </p>
            {conversationError && (
              <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-300" role="alert">
                {conversationError}
              </p>
            )}
            <div className="mt-6 flex justify-end gap-2">
              <button
                className="secondary-button"
                disabled={deletingConversation}
                onClick={() => {
                  setConversationToDelete(null)
                  clearError()
                }}
                type="button"
              >
                Cancel
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={deletingConversation}
                onClick={confirmDeleteConversation}
                type="button"
              >
                {deletingConversation ? "Deleting…" : "Delete"}
              </button>
            </div>
          </section>
        </div>
      )}

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="chat-topbar flex h-[68px] shrink-0 items-center justify-between border-b border-line px-4 backdrop-blur-xl sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            {(isDesktop ? sidebarCollapsed : !sidebarOpen) && (
              <button
                aria-label="Open sidebar"
                className="icon-button"
                onClick={openSidebar}
                title="Open sidebar"
                type="button"
              >
                <Menu size={19} />
              </button>
            )}
            <span className="max-w-[42vw] truncate font-display text-[18px] font-medium tracking-[-0.03em] sm:max-w-[38vw] lg:max-w-[420px]">
              {activeConversation?.title || "A new conversation"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden text-[13px] text-ink-faint md:inline">Chat with Jules</span>
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
              <div className="mx-auto flex min-h-full w-full max-w-[880px] flex-col justify-center px-5 pb-8 pt-12 sm:px-8">
                <div className="chat-intro mb-8 grid h-12 w-12 place-items-center rounded-2xl bg-panel text-jules">
                  <Sparkles size={21} />
                </div>
                <p className="chat-intro mb-3 text-[13px] font-semibold uppercase tracking-[0.17em] text-jules">
                  What would you like to talk about?
                </p>
                <h1 className="chat-intro max-w-[620px] font-display text-[41px] font-medium leading-[1.13] tracking-[-0.045em] sm:text-[55px]">
                  What’s on your mind, {firstName}?
                </h1>
                <p className="chat-intro mt-4 max-w-[470px] text-[16px] leading-6 text-ink-muted">
                  Ask a question or share what’s on your mind.
                </p>
                <div className="mt-9 grid max-w-[740px] grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      className="suggestion-card group rounded-2xl border border-line bg-surface p-4 text-left text-ink transition duration-200 hover:-translate-y-0.5 hover:border-jules/35 hover:shadow-soft"
                      key={suggestion.title}
                      onClick={() => {
                        setDraft(suggestion.prompt)
                      }}
                      type="button"
                    >
                      <span className="mb-3 grid h-7 w-7 place-items-center rounded-lg bg-panel text-jules">
                        <Sparkles size={14} className={index % 2 ? "rotate-12" : ""} />
                      </span>
                      <span className="suggestion-card-title block text-[14px] font-medium">{suggestion.title}</span>
                      <span className="suggestion-card-prompt mt-1 block text-[13px] leading-5">{suggestion.prompt}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="w-full px-4 pb-4 pt-3 sm:px-8 sm:pb-6">
            {conversationError && (
              <p className="mx-auto mb-3 max-w-[760px] rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-300" role="alert">
                {conversationError}
              </p>
            )}
            {logoutError && (
              <p className="mx-auto mb-3 max-w-[760px] rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-300" role="alert">
                {logoutError}
              </p>
            )}
            {authError && (
              <p className="mx-auto mb-3 max-w-[760px] rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-600 dark:text-red-300" role="alert">
                {authError}
              </p>
            )}
            {loggingOut && <p className="sr-only" role="status">Signing out…</p>}
            <ChatComposer draft={draft} onDraftChange={setDraft} onSend={handleSend} disabled={sending} />
            <p className="mx-auto mt-3 max-w-[760px] text-center text-[12px] text-ink-faint">
              AI can make mistakes
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
