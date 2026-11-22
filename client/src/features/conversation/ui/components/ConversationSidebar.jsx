import { useLayoutEffect, useMemo, useRef, useState } from "react"
import { LogOut, Plus, Search, X } from "lucide-react"
import gsap from "gsap"
import BrandMark from "../../../auth/ui/components/BrandMark.jsx"

function ConversationItem({ conversation, active, onSelect, onDelete }) {
  const titleButtonRef = useRef(null)
  const titleRef = useRef(null)
  const deleteButtonRef = useRef(null)
  const canDelete = !conversation.id.startsWith("pending-")

  const animateDeleteButton = (isVisible) => {
    if (!deleteButtonRef.current || !titleButtonRef.current || window.matchMedia("(hover: none)").matches) return
    gsap.killTweensOf([
      deleteButtonRef.current,
      titleButtonRef.current,
      titleRef.current
    ])

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(deleteButtonRef.current, { autoAlpha: isVisible ? 1 : 0, x: 0 })
      gsap.set(titleButtonRef.current, { paddingRight: isVisible ? 76 : 12 })
      gsap.set(titleRef.current, { x: 0 })
      return
    }

    if (isVisible) {
      gsap.fromTo(
        deleteButtonRef.current,
        { autoAlpha: 0, x: 14 },
        { autoAlpha: 1, x: 0, duration: 0.26, ease: "power2.out" }
      )
    } else {
      gsap.to(deleteButtonRef.current, {
        autoAlpha: 0,
        x: 10,
        duration: 0.2,
        ease: "power2.inOut"
      })
    }

    gsap.to(titleButtonRef.current, {
      paddingRight: isVisible ? 76 : 12,
      duration: 0.26,
      ease: "power2.out"
    })
    gsap.to(titleRef.current, {
      x: isVisible ? -3 : 0,
      duration: 0.26,
      ease: "power2.out"
    })
  }

  useLayoutEffect(() => () => {
    gsap.killTweensOf([
      deleteButtonRef.current,
      titleButtonRef.current,
      titleRef.current
    ])
  }, [])

  return (
    <div
      className="conversation-row group relative z-0 min-w-0 hover:z-20 focus-within:z-20"
      onMouseEnter={() => animateDeleteButton(true)}
      onMouseLeave={() => animateDeleteButton(false)}
      onFocus={() => animateDeleteButton(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) animateDeleteButton(false)
      }}
    >
      <button
        ref={titleButtonRef}
        aria-current={active ? "page" : undefined}
        className={`conversation-link min-w-0 ${canDelete ? "conversation-link-delete" : ""} ${active ? "conversation-link-active" : ""}`}
        onClick={() => onSelect(conversation.id)}
        title={conversation.title}
        type="button"
      >
        <span className="truncate" ref={titleRef}>{conversation.title}</span>
      </button>
      {canDelete && (
        <button
          ref={deleteButtonRef}
          aria-label={`Delete ${conversation.title}`}
          className="pointer-events-none absolute right-1 top-1/2 z-10 flex h-7 w-[62px] -translate-y-1/2 items-center justify-center rounded-lg bg-red-500/10 text-[10px] font-semibold tracking-[0.1em] text-red-600 opacity-0 transition-colors hover:bg-red-600 hover:text-white focus-visible:bg-red-600 focus-visible:text-white dark:text-red-300 dark:hover:text-white group-hover:pointer-events-auto group-focus-within:pointer-events-auto group-focus-within:opacity-100 max-lg:pointer-events-auto max-lg:opacity-100"
          onClick={() => onDelete(conversation)}
          title="Delete conversation"
          type="button"
        >
          DELETE
        </button>
      )}
    </div>
  )
}

export default function ConversationSidebar({
  activeId,
  conversations,
  onClose,
  onDeleteConversation,
  onLogout,
  onNewConversation,
  onSelectConversation,
  user
}) {
  const [query, setQuery] = useState("")
  const conversationListRef = useRef(null)
  const filteredConversations = useMemo(
    () => conversations.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())),
    [conversations, query]
  )
  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "J"

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return undefined
    const rows = conversationListRef.current?.querySelectorAll(".conversation-row")
    if (!rows?.length) return undefined
    gsap.killTweensOf(rows)
    gsap.fromTo(
      rows,
      { autoAlpha: 0, x: 8 },
      { autoAlpha: 1, x: 0, duration: 0.2, stagger: 0.025, ease: "power2.out" }
    )
    return () => gsap.killTweensOf(rows)
  }, [filteredConversations.length, query])

  return (
    <aside className="flex h-full w-[286px] shrink-0 flex-col overflow-x-hidden border-r border-line bg-sidebar px-3.5 py-4">
      <div className="flex h-10 items-center justify-between px-1.5">
        <BrandMark />
        <button className="icon-button" onClick={onClose} aria-label="Close sidebar" type="button">
          <X size={18} />
        </button>
      </div>

      <button className="new-chat-button mt-7" onClick={onNewConversation} type="button">
        <Plus size={16} strokeWidth={2} />
        <span>New chat</span>
        <span className="ml-auto rounded-md border border-canvas/20 px-1.5 py-0.5 text-[12px] text-canvas/70">⌘ K</span>
      </button>

      <label className="search-field mt-3">
        <Search size={15} className="shrink-0 text-ink-faint" />
        <input
          aria-label="Search conversations"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search conversations"
          value={query}
        />
        <span className="text-[12px] text-ink-faint">⌘ F</span>
      </label>

      <div className="mb-2 mt-8 flex items-center justify-between px-2">
        <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-faint">Recent</p>
        <span className="text-[12px] text-ink-faint">{filteredConversations.length}</span>
      </div>

      <nav aria-label="Recent conversations" className="min-w-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto" ref={conversationListRef}>
        {filteredConversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            active={activeId === conversation.id}
            conversation={conversation}
            onDelete={onDeleteConversation}
            onSelect={(id) => {
              onSelectConversation(id)
              if (window.matchMedia("(max-width: 1023px)").matches) onClose()
            }}
          />
        ))}
        {filteredConversations.length === 0 && (
          <p className="px-2 py-3 text-sm leading-5 text-ink-faint">
            {query ? "No chats match that search." : "Your chats will show up here."}
          </p>
        )}
      </nav>

      <div className="mt-4 border-t border-line pt-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sage text-[13px] font-semibold text-white">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink">{user?.name}</span>
            <span className="block truncate text-[12px] text-ink-faint">Saved to your account</span>
          </span>
          <button
            aria-label="Sign out"
            className="icon-button"
            onClick={onLogout}
            title="Sign out"
            type="button"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
