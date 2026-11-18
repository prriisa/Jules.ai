import { useMemo, useState } from "react";
import { LogOut, MessageSquare, Plus, Search, X } from "lucide-react";
import BrandMark from "../../../auth/ui/components/BrandMark.jsx";

export default function ConversationSidebar({
  activeId,
  conversations,
  onClose,
  onLogout,
  onNewConversation,
  onSelectConversation,
  user
}) {
  const [query, setQuery] = useState("");
  const filteredConversations = useMemo(
    () => conversations.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())),
    [conversations, query]
  );
  const initials = user?.name
    ?.split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "J";

  return (
    <aside className="flex h-full w-[286px] shrink-0 flex-col border-r border-line bg-sidebar px-3.5 py-4">
      <div className="flex h-10 items-center justify-between px-1.5">
        <BrandMark />
        <button className="icon-button lg:hidden" onClick={onClose} aria-label="Close sidebar" type="button">
          <X size={18} />
        </button>
        <span className="hidden rounded-full border border-line px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-ink-faint lg:inline-flex">
          Preview
        </span>
      </div>

      <button className="new-chat-button mt-7" onClick={onNewConversation} type="button">
        <Plus size={16} strokeWidth={2} />
        <span>New chat</span>
        <span className="ml-auto rounded-md border border-canvas/20 px-1.5 py-0.5 text-[10px] text-canvas/70">⌘ K</span>
      </button>

      <label className="search-field mt-3">
        <Search size={15} className="shrink-0 text-ink-faint" />
        <input
          aria-label="Search conversations"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search conversations"
          value={query}
        />
        <span className="text-[10px] text-ink-faint">⌘ F</span>
      </label>

      <div className="mb-2 mt-8 flex items-center justify-between px-2">
        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">Recent</p>
        <span className="text-[10px] text-ink-faint">{filteredConversations.length}</span>
      </div>

      <nav aria-label="Recent conversations" className="flex-1 space-y-1 overflow-y-auto">
        {filteredConversations.map((conversation) => (
          <button
            aria-current={activeId === conversation.id ? "page" : undefined}
            className={`conversation-link ${activeId === conversation.id ? "conversation-link-active" : ""}`}
            key={conversation.id}
            onClick={() => {
              onSelectConversation(conversation.id);
              onClose();
            }}
            title={conversation.title}
            type="button"
          >
            <MessageSquare size={15} className="shrink-0" />
            <span className="truncate">{conversation.title}</span>
          </button>
        ))}
        {filteredConversations.length === 0 && (
          <p className="px-2 py-3 text-xs leading-5 text-ink-faint">
            {query ? "No chats match that search." : "Your chats will show up here."}
          </p>
        )}
      </nav>

      <div className="mt-4 border-t border-line pt-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sage text-[11px] font-semibold text-white">
            {initials}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium text-ink">{user?.name}</span>
            <span className="block truncate text-[10px] text-ink-faint">Saved on this device</span>
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
  );
}
