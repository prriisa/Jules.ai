import conversationModel from '../models/conversation.model.js';

/**
 * @param {{user: string | import('mongoose').Types.ObjectId, title?: string}} input Conversation owner and title.
 * @returns {Promise<import('../types/conversation.js').Conversation>} Persisted conversation.
 */
export async function createConversation(input) {
    return conversationModel.create(input);
}

/**
 * @param {string | import('mongoose').Types.ObjectId} id Conversation identifier.
 * @param {string | import('mongoose').Types.ObjectId} userId Owner identifier.
 * @returns {Promise<import('../types/conversation.js').Conversation | null>} Owned conversation or null.
 */
export async function findConversationByIdAndUser(id, userId) {
    return conversationModel.findOne({ _id: id, user: userId });
}

/**
 * @param {string | import('mongoose').Types.ObjectId} userId Owner identifier.
 * @returns {Promise<import('../types/conversation.js').Conversation[]>} List of conversations owned by the user.
 */
export async function findConversationsByUser(userId) {
    return conversationModel.find({ user: userId });
}


/**
 * @param {string | import('mongoose').Types.ObjectId} id Conversation identifier.
 * @param {string | import('mongoose').Types.ObjectId} userId Owner identifier.
 * @returns {Promise<import('../types/conversation.js').Conversation | null>} Deleted conversation document if found, otherwise null.
 */

export async function deleteConversationByIdAndUser(id, userId){
    return conversationModel.findOneAndDelete({ _id: id, user: userId })
}