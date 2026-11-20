import { Sparkles } from "lucide-react";

export default function MessageThread({ conversation }) {
  return (
    <div className="mx-auto w-full max-w-[760px] space-y-7 px-5 pb-10 pt-12 sm:px-8">
      {conversation.messages.map((message, index) => (
        <article className="message-enter flex justify-end" key={message.id} style={{ animationDelay: `${Math.min(index * 45, 220)}ms` }}>
          <p className="max-w-[85%] whitespace-pre-wrap rounded-[22px] rounded-br-md bg-user-bubble px-5 py-3.5 text-[16px] leading-7 text-ink sm:max-w-[76%]">
            {message.content}
          </p>
        </article>
      ))}
      <article className="message-enter flex items-start gap-3">
        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-jules text-canvas">
          <Sparkles size={15} />
        </span>
        <div className="max-w-[600px] pt-1">
          <p className="text-[15px] font-medium text-ink">Jules</p>
          <p className="mt-2 text-[15px] leading-6 text-ink-muted">
            Your message is saved on this device. AI responses aren’t connected in this preview yet.
          </p>
        </div>
      </article>
    </div>
  );
}
