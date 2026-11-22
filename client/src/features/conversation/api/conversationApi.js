import axios from "axios"

const http = axios.create({
  baseURL: "/api/v1",
  withCredentials: true,
  headers: { "Content-Type": "application/json" }
})

const conversationPath = "/conversation"
export const SERVER_UNAVAILABLE_MESSAGE = "The server isn't responding. Refresh the page and try again."

const authHeaders = (accessToken) => ({
  Authorization: `Bearer ${accessToken}`
})

export const normalizeConversation = (conversation) => ({
  id: conversation.id || conversation._id,
  title: conversation.title || "New conversation",
  messages: [],
  updatedAt: conversation.lastUpdate || conversation.updatedAt || conversation.createdAt || new Date().toISOString()
})

export const extractAssistantText = (value) => {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      const extracted = extractAssistantText(parsed)
      return extracted || value
    } catch {
      return value
    }
  }

  if (Array.isArray(value)) {
    return value.map((item) => extractAssistantText(item)).filter(Boolean).join("")
  }

  if (value && typeof value === "object") {
    if (value.data) return extractAssistantText(value.data)
    if (value.kwargs) return extractAssistantText(value.kwargs)
    if (value.content !== undefined) return extractAssistantText(value.content)
    if (value.text !== undefined) return extractAssistantText(value.text)
  }

  return ""
}

export const normalizeMessage = (message) => {
  let content = message.content

  if (message.role === "assistant") {
    content = extractAssistantText(content) || (typeof content === "string" ? content : "")
  }

  return {
    id: message.id || message._id,
    role: message.role,
    content,
    createdAt: message.createdAt || new Date().toISOString()
  }
}

export const getConversationsRequest = async (accessToken) =>
  (await http.get(conversationPath, { headers: authHeaders(accessToken) })).data.data
    .map(normalizeConversation)

export const getMessagesRequest = async (accessToken, conversationId) =>
  (await http.get(`${conversationPath}/messages/${conversationId}`, {
    headers: authHeaders(accessToken)
  })).data.data.map(normalizeMessage)

export const deleteConversationRequest = async (accessToken, conversationId) =>
  http.delete(`${conversationPath}/delete/conversation/${conversationId}`, {
    headers: authHeaders(accessToken)
  })

const TOKEN_LIMIT_ERROR = /(?:token|context).{0,60}(?:limit|length|exceed|maximum|max|too many|long|large)|(?:too many tokens|prompt.{0,30}too long|max_tokens|context_length_exceeded|request.{0,30}too large)/i
const TOKEN_LIMIT_MESSAGE = "This conversation has reached the AI's context limit. Start a new conversation to continue."

const formatConversationError = (message, status) => {
  if (status === 413 || TOKEN_LIMIT_ERROR.test(message || "")) return TOKEN_LIMIT_MESSAGE
  if (status >= 500 || /failed to fetch|network error|network request failed|load failed/i.test(message || "")) {
    return SERVER_UNAVAILABLE_MESSAGE
  }
  return message || "Could not load the conversation. Please try again."
}

export const getConversationError = (error) => {
  if (axios.isAxiosError(error)) {
    if (!error.response) return SERVER_UNAVAILABLE_MESSAGE
    const data = error.response?.data
    const message = data?.errors?.[0]?.message
      || data?.message
      || data?.error?.message
      || (typeof data?.error === "string" ? data.error : "")
    return formatConversationError(message, error.response?.status)
  }
  if (error?.name === "TypeError" || /failed to fetch|network error|network request failed|load failed/i.test(error?.message || "")) {
    return SERVER_UNAVAILABLE_MESSAGE
  }
  return formatConversationError(error?.message, error?.status)
}

export const isConversationUnauthorized = (error) =>
  axios.isAxiosError(error) && error.response?.status === 401

export const isConversationNotFound = (error) =>
  axios.isAxiosError(error) && error.response?.status === 404

export const sendMessageStream = async ({ accessToken, content, conversationId, onEvent, onRefresh }) => {
  const url = `${conversationPath.startsWith("/") ? "/api/v1" : ""}${conversationPath}`
  let currentAccessToken = accessToken

  const postMessage = () => fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      ...authHeaders(currentAccessToken),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      content,
      ...(conversationId ? { conversation: conversationId } : {})
    })
  })

  let response = await postMessage()

  if (response.status === 401 && onRefresh) {
    const session = await onRefresh()
    currentAccessToken = session.accessToken
    response = await postMessage()
  }

  if (!response.ok) {
    let message = "Could not send your message. Please try again."
    try {
      const body = await response.json()
      message = body?.errors?.[0]?.message
        || body?.message
        || body?.error?.message
        || (typeof body?.error === "string" ? body.error : message)
    } catch {
      // Use the fallback message when the error body is not JSON.
    }
    throw new Error(formatConversationError(message, response.status))
  }

  if (!response.body) throw new Error("Streaming is not supported by this browser.")

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ""
  let receivedChunk = false

  while (true) {
    const { done, value } = await reader.read()
    buffer += decoder.decode(value || new Uint8Array(), { stream: !done })

    const frames = buffer.split("\n\n")
    buffer = frames.pop() || ""

    for (const frame of frames) {
      const line = frame.split("\n").find((item) => item.startsWith("data: "))
      if (!line) continue
      let event
      try {
        event = JSON.parse(line.slice(6))
      } catch {
        // Ignore malformed SSE frames.
        continue
      }
      if (event.type === "error" || event.error) {
        const message = event.error?.message || event.error || event.message
        throw new Error(formatConversationError(
          typeof message === "string" ? message : "",
          response.status
        ))
      }
      if (event.chunk !== undefined) receivedChunk = true
      onEvent(event)
    }

    if (done) break
  }

  if (!receivedChunk) throw new Error(SERVER_UNAVAILABLE_MESSAGE)
}
