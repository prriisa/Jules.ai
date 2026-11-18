import { useLayoutEffect, useRef } from "react";
import { ArrowUp, Plus } from "lucide-react";

export default function ChatComposer({ draft, onDraftChange, onSend }) {
  const textareaRef = useRef(null);

  useLayoutEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
  }, [draft]);

  const submit = (event) => {
    event.preventDefault();
    if (!draft.trim()) return;
    const saved = onSend(draft);
    if (saved) {
      onDraftChange("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  const resize = (event) => {
    onDraftChange(event.target.value);
    event.target.style.height = "auto";
    event.target.style.height = `${Math.min(event.target.scrollHeight, 180)}px`;
  };

  return (
    <form className="composer-shell" onSubmit={submit}>
      <textarea
        aria-label="Message Jules"
        className="composer-input"
        maxLength={8000}
        onChange={resize}
        onKeyDown={handleKeyDown}
        placeholder="Message Jules..."
        ref={textareaRef}
        rows={1}
        value={draft}
      />
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <button
            aria-label="Attachments are not available in this preview"
            className="composer-tool"
            disabled
            title="Attachments coming soon"
            type="button"
          >
            <Plus size={17} />
          </button>
          <span className="rounded-full bg-panel px-2.5 py-1 text-[10px] font-medium text-ink-muted">
            Jules · Preview
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-[10px] text-ink-faint sm:inline">Shift + Enter for a new line</span>
          <button
            aria-label="Send message"
            className="send-button"
            disabled={!draft.trim()}
            type="submit"
          >
            <ArrowUp size={18} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </form>
  );
}
