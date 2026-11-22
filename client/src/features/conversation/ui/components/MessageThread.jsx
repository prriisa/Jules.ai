import { useLayoutEffect, useRef } from "react"
import { Sparkles } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import gsap from "gsap"

const markdownComponents = {
  h1: ({ children }) => <h1 className="mb-3 mt-5 text-2xl font-semibold leading-tight text-ink first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mb-2 mt-5 text-xl font-semibold leading-tight text-ink first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mb-2 mt-4 text-lg font-semibold leading-tight text-ink first:mt-0">{children}</h3>,
  p: ({ children }) => <p className="mb-3 whitespace-pre-wrap leading-7 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-6 last:mb-0">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-6 last:mb-0">{children}</ol>,
  li: ({ children }) => <li className="pl-1">{children}</li>,
  blockquote: ({ children }) => <blockquote className="my-3 border-l-2 border-jules/50 pl-4 text-ink-muted">{children}</blockquote>,
  a: ({ children, href }) => <a className="text-jules underline underline-offset-2 hover:text-jules-dark" href={href}>{children}</a>,
  hr: () => <hr className="my-4 border-line" />,
  pre: ({ children }) => <pre className="my-3 overflow-x-auto rounded-xl bg-panel p-4 text-[13px] leading-6">{children}</pre>,
  code: ({ children, className }) => (
    <code className={className
      ? `${className} font-mono`
      : "rounded bg-panel px-1.5 py-0.5 font-mono text-[0.9em]"}
    >
      {children}
    </code>
  ),
  table: ({ children }) => (
    <div className="my-3 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => <th className="border border-line bg-panel px-3 py-2 font-semibold">{children}</th>,
  td: ({ children }) => <td className="border border-line px-3 py-2">{children}</td>
}

export default function MessageThread({ conversation }) {
  const lastMessageRef = useRef(null)
  const lastMessage = conversation.messages[conversation.messages.length - 1]

  useLayoutEffect(() => {
    if (!lastMessageRef.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const tween = gsap.fromTo(
      lastMessageRef.current,
      { autoAlpha: 0, y: 12, scale: 0.99 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.36, ease: "power2.out" }
    )
    return () => tween.kill()
  }, [conversation.id, lastMessage?.id])

  return (
    <div className="mx-auto w-full max-w-[960px] space-y-7 px-5 pb-10 pt-12 sm:px-8">
      {conversation.messages.map((message, index) => (
        message.role === "user" ? (
          <article className="message-row flex justify-end" key={message.id} ref={index === conversation.messages.length - 1 ? lastMessageRef : undefined}>
            <p className="max-w-[85%] whitespace-pre-wrap rounded-[22px] rounded-br-md bg-user-bubble px-5 py-3.5 text-[16px] leading-7 text-ink sm:max-w-[76%]">
              {message.content}
            </p>
          </article>
        ) : (
          <article className="message-row flex items-start gap-3" key={message.id} ref={index === conversation.messages.length - 1 ? lastMessageRef : undefined}>
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-jules text-canvas">
              <Sparkles size={15} />
            </span>
            <div className="max-w-[760px] pt-1">
              <p className="font-display text-[16px] font-semibold tracking-[-0.02em] text-ink">Jules</p>
              <div className="mt-2 text-[15px] text-ink-muted">
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          </article>
        )
      ))}
    </div>
  )
}
