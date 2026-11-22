import { useCallback, useEffect, useRef } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
  getConversationError,
  getConversationsRequest,
  getMessagesRequest,
  deleteConversationRequest,
  extractAssistantText,
  isConversationNotFound,
  isConversationUnauthorized,
  sendMessageStream
} from "../api/conversationApi.js"
import { refreshRequest } from "../../auth/api/authApi.js"
import { sessionEnded, sessionStarted } from "../../auth/state/authSlice.js"
import {
  conversationErrorCleared,
  conversationDeleted,
  conversationFailed,
  conversationMessagesLoaded,
  conversationSelected,
  conversationSending,
  conversationsLoaded
} from "../state/conversationSlice.js"

const createId = () => window.crypto.randomUUID()

export function useConversations() {
  const dispatch = useDispatch()
  const state = useSelector((store) => store.conversations)
  const { accessToken } = useSelector((store) => store.auth)
  const accessTokenRef = useRef(accessToken)
  accessTokenRef.current = accessToken

  const refreshSession = useCallback(async (failedToken) => {
    if (accessTokenRef.current && accessTokenRef.current !== failedToken) {
      return { accessToken: accessTokenRef.current }
    }

    try {
      const session = await refreshRequest()
      accessTokenRef.current = session.accessToken
      dispatch(sessionStarted(session))
      return session
    } catch (error) {
      accessTokenRef.current = null
      dispatch(sessionEnded())
      throw error
    }
  }, [dispatch])

  const loadConversationsAndPruneEmpty = useCallback(async (token) => {
    const conversations = await getConversationsRequest(token)
    const loaded = await Promise.all(conversations.map(async (conversation) => {
      const messages = await getMessagesRequest(token, conversation.id)
      if (!messages.some((message) => message.role === "user")) {
        try {
          await deleteConversationRequest(token, conversation.id)
        } catch (error) {
          if (!isConversationNotFound(error)) throw error
        }
        return null
      }
      return { ...conversation, messages }
    }))
    return loaded.filter(Boolean)
  }, [])

  useEffect(() => {
    if (!accessToken) return
    (async () => {
      try {
        const items = await loadConversationsAndPruneEmpty(accessToken)
        dispatch(conversationsLoaded({ items, activeId: null }))
      } catch (error) {
        if (isConversationUnauthorized(error)) {
          try {
            const session = await refreshSession(accessToken)
            const items = await loadConversationsAndPruneEmpty(session.accessToken)
            dispatch(conversationsLoaded({ items, activeId: null }))
            return
          } catch (refreshError) {
            dispatch(conversationFailed(getConversationError(refreshError)))
            return
          }
        }
        dispatch(conversationFailed(getConversationError(error)))
      }
    })()
  }, [accessToken, dispatch, loadConversationsAndPruneEmpty, refreshSession])

  useEffect(() => {
    if (!accessToken || !state.activeId || state.activeId.startsWith("pending-")) return
    const activeConversation = state.items.find((item) => item.id === state.activeId)
    if (activeConversation?.messages.length) return
    (async () => {
      try {
        const messages = await getMessagesRequest(accessToken, state.activeId)
        dispatch(conversationMessagesLoaded({
          id: state.activeId,
          messages
        }))
      } catch (error) {
        if (isConversationUnauthorized(error)) {
          try {
            const session = await refreshSession(accessToken)
            const messages = await getMessagesRequest(session.accessToken, state.activeId)
            dispatch(conversationMessagesLoaded({
              id: state.activeId,
              messages
            }))
            return
          } catch (refreshError) {
            dispatch(conversationFailed(getConversationError(refreshError)))
            return
          }
        }
        dispatch(conversationFailed(getConversationError(error)))
      }
    })()
  }, [accessToken, dispatch, refreshSession, state.activeId, state.items])

  const startConversation = useCallback(() => {
    const emptyPending = state.items.find((item) =>
      item.id.startsWith("pending-") &&
      !item.messages.some((message) => message.role === "user")
    )
    if (emptyPending) {
      dispatch(conversationSelected(emptyPending.id))
      return emptyPending.id
    }

    const pendingId = `pending-${createId()}`
    dispatch(conversationsLoaded({
      items: [{
        id: pendingId,
        title: "New conversation",
        messages: [],
        updatedAt: new Date().toISOString()
      }, ...state.items],
      activeId: pendingId
    }))
    return pendingId
  }, [dispatch, state.items])

  const selectConversation = useCallback(
    (id) => dispatch(conversationSelected(id)),
    [dispatch]
  )

  const sendMessage = useCallback(async (content) => {
    const trimmedContent = content.trim()
    if (!trimmedContent) return false
    if (!accessToken) {
      dispatch(conversationFailed("Your session is unavailable. Please sign in again."))
      return false
    }

    const existing = state.items.find((item) => item.id === state.activeId)
    const pendingId = existing?.id?.startsWith("pending-")
      ? existing.id
      : `pending-${createId()}`
    const conversationId = existing && !existing.id.startsWith("pending-") ? existing.id : null
    const createdAt = new Date().toISOString()
    const optimisticConversation = {
      id: conversationId || pendingId,
      title: existing?.title && existing.title !== "New conversation"
        ? existing.title
        : trimmedContent.slice(0, 48),
      messages: [
        ...(existing?.messages || []),
        { id: createId(), role: "user", content: trimmedContent, createdAt }
      ],
      updatedAt: createdAt
    }
    const items = [
      optimisticConversation,
      ...state.items.filter((item) => item.id !== optimisticConversation.id)
    ]
    dispatch(conversationsLoaded({ items, activeId: optimisticConversation.id }))
    dispatch(conversationSending(true))

    let assistantContent = ""
    let rawAssistantContent = ""
    let assistantId = createId()
    let liveConversation = optimisticConversation

    try {
      await sendMessageStream({
        accessToken,
        content: trimmedContent,
        conversationId,
        onRefresh: () => refreshSession(accessToken),
        onEvent: (event) => {
          if (event.conversationId) {
            const serverId = String(event.conversationId)
            liveConversation = {
              ...liveConversation,
              id: serverId,
              title: event.title || liveConversation.title
            }
            const replaced = state.items
              .filter((item) => item.id !== pendingId && item.id !== serverId)
            dispatch(conversationsLoaded({
              items: [liveConversation, ...replaced],
              activeId: serverId
            }))
            assistantId = liveConversation.id
          }

          if (event.chunk !== undefined) {
            const chunkText = typeof event.chunk === "string"
              ? event.chunk
              : extractAssistantText(event.chunk)
            if (!chunkText) return
            rawAssistantContent += chunkText
            const looksLikeSerializedMessage = /^\s*\{\s*"(?:type|data|kwargs)"\s*:/.test(rawAssistantContent)
            const extracted = extractAssistantText(rawAssistantContent)
            if (looksLikeSerializedMessage && extracted === rawAssistantContent) return
            assistantContent = extracted
            const assistantMessage = {
              id: `assistant-${assistantId}`,
              role: "assistant",
              content: assistantContent,
              createdAt: new Date().toISOString()
            }
            liveConversation = {
              ...liveConversation,
              messages: [
                ...optimisticConversation.messages,
                ...(assistantContent ? [assistantMessage] : [])
              ],
              updatedAt: new Date().toISOString()
            }
            dispatch(conversationsLoaded({
              items: [
                liveConversation,
                ...state.items.filter((item) =>
                  item.id !== pendingId &&
                  item.id !== liveConversation.id &&
                  item.id !== optimisticConversation.id
                )
              ],
              activeId: liveConversation.id
            }))
          }
        }
      })

      if (rawAssistantContent) {
        assistantContent = extractAssistantText(rawAssistantContent) || rawAssistantContent
        const assistantMessage = {
          id: `assistant-${assistantId}`,
          role: "assistant",
          content: assistantContent,
          createdAt: new Date().toISOString()
        }
        liveConversation = {
          ...liveConversation,
          messages: [
            ...optimisticConversation.messages,
            ...(assistantContent ? [assistantMessage] : [])
          ],
          updatedAt: new Date().toISOString()
        }
      }

      const refreshed = await getConversationsRequest(accessToken)
      const activeId = liveConversation.id
      const messages = await getMessagesRequest(accessToken, activeId).catch(() => liveConversation.messages)
      dispatch(conversationsLoaded({
        items: [
          { ...liveConversation, messages },
          ...refreshed.filter((item) => item.id !== activeId)
        ],
        activeId
      }))
      dispatch(conversationSending(false))
      return true
    } catch (error) {
      dispatch(conversationSending(false))
      dispatch(conversationFailed(getConversationError(error)))
      return false
    }
  }, [accessToken, dispatch, refreshSession, state.activeId, state.items])

  const deleteConversation = useCallback(async (conversationId) => {
    if (!accessToken) {
      dispatch(conversationFailed("Your session is unavailable. Please sign in again."))
      return false
    }

    try {
      await deleteConversationRequest(accessToken, conversationId)
    } catch (error) {
      if (!isConversationUnauthorized(error)) {
        dispatch(conversationFailed(getConversationError(error)))
        return false
      }

      try {
        const session = await refreshSession(accessToken)
        await deleteConversationRequest(session.accessToken, conversationId)
      } catch (refreshError) {
        dispatch(conversationFailed(getConversationError(refreshError)))
        return false
      }
    }

    dispatch(conversationDeleted(conversationId))
    return true
  }, [accessToken, dispatch, refreshSession])

  const clearError = useCallback(() => dispatch(conversationErrorCleared()), [dispatch])
  const activeConversation = state.items.find((item) => item.id === state.activeId) ?? null

  return {
    ...state,
    activeConversation,
    startConversation,
    selectConversation,
    sendMessage,
    deleteConversation,
    clearError
  }
}
