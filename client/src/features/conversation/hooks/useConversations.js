import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getConversations, saveConversation } from "../api/conversationApi.js";
import {
  conversationErrorCleared,
  conversationFailed,
  conversationSelected,
  conversationsLoaded
} from "../state/conversationSlice.js";

const createId = () => window.crypto.randomUUID();

/**
 * Provides local conversation history and actions for the chat interface.
 * @returns {object} Conversation state and actions.
 */
export function useConversations() {
  const dispatch = useDispatch();
  const state = useSelector((store) => store.conversations);

  useEffect(() => {
    try {
      dispatch(conversationsLoaded({ items: getConversations(), activeId: null }));
    } catch (error) {
      dispatch(conversationFailed(error.message));
    }
  }, [dispatch]);

  const startConversation = useCallback(() => {
    const conversation = {
      id: createId(),
      title: "New conversation",
      messages: [],
      updatedAt: new Date().toISOString()
    };

    try {
      const items = saveConversation(conversation);
      dispatch(conversationsLoaded({ items, activeId: conversation.id }));
      return conversation.id;
    } catch (error) {
      dispatch(conversationFailed(error.message));
      return null;
    }
  }, [dispatch]);

  const selectConversation = useCallback(
    (id) => dispatch(conversationSelected(id)),
    [dispatch]
  );

  const sendMessage = useCallback((content) => {
    let conversation = state.items.find((item) => item.id === state.activeId);
    if (!conversation) {
      conversation = {
        id: createId(),
        title: "New conversation",
        messages: [],
        updatedAt: new Date().toISOString()
      };
    }

    const trimmedContent = content.trim();
    if (!trimmedContent) return false;

    const message = {
      id: createId(),
      role: "user",
      content: trimmedContent,
      createdAt: new Date().toISOString()
    };
    const updatedConversation = {
      ...conversation,
      title: conversation.messages.length ? conversation.title : trimmedContent.slice(0, 48),
      messages: [...conversation.messages, message],
      updatedAt: message.createdAt
    };

    try {
      const items = saveConversation(updatedConversation);
      dispatch(conversationsLoaded({ items, activeId: updatedConversation.id }));
      return true;
    } catch (error) {
      dispatch(conversationFailed(error.message));
      return false;
    }
  }, [dispatch, state.activeId, state.items]);

  const clearError = useCallback(() => dispatch(conversationErrorCleared()), [dispatch]);
  const activeConversation = state.items.find((item) => item.id === state.activeId) ?? null;

  return {
    ...state,
    activeConversation,
    startConversation,
    selectConversation,
    sendMessage,
    clearError
  };
}
