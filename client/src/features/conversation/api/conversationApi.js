const STORAGE_KEY = "jules-conversations-v1";

/**
 * Loads locally saved conversations from this browser.
 * @returns {Array<object>} Saved conversations, newest first.
 */
export const getConversations = () => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  let conversations;
  try {
    conversations = JSON.parse(raw);
  } catch {
    throw new Error("Saved conversations could not be read. Clear this browser's Jules chat data and try again.");
  }

  if (!Array.isArray(conversations)) {
    throw new Error("Saved conversations have an invalid format.");
  }

  return conversations.sort((first, second) =>
    new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
  );
};

/**
 * Saves or updates a conversation in browser storage.
 * @param {object} conversation - Conversation with messages and metadata.
 * @returns {Array<object>} Updated conversations, newest first.
 */
export const saveConversation = (conversation) => {
  const conversations = getConversations().filter((item) => item.id !== conversation.id);
  const updated = [conversation, ...conversations].sort(
    (first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime()
  );
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
};
