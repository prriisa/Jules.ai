
import { generateTitle } from "../services/ai/ai-title.service.js"
import AppError from "../utils/AppError.js"
import { sendSuccess } from "../utils/apiResponse.js"
import { createConversation, deleteConversationByIdAndUser, findConversationByIdAndUser, findConversationsByUser } from "../DAO/conversation.dao.js"
import model from "../services/ai/main.service.js"
import { createMessage, deleteMessagesByConversation, findMessagesByConversation } from "../DAO/message.dao.js"
import { AIMessage, HumanMessage } from "langchain"

export const handleMessage = async (req, res, next) => {
    const { content, conversation: conversationId } = req.body
    const user = req.user

    let conversation = null

    if (!conversationId) {
        const { title } = await generateTitle(content)

        conversation = await createConversation({ user: user.id, title })
    }
    else {
        conversation = await findConversationByIdAndUser(conversationId, user.id)

        if (!conversation) {
            return next(new AppError(404, 'Conversation not found'))
        }
    }

    const messages = (await findMessagesByConversation(conversation._id)).map(message => {
        if (message.role === "user") {
            return new HumanMessage(message.content)
        }
        else if (message.role === "assistant") {
            return new AIMessage(message.content)
        }
        return null
    }).filter(Boolean)

    messages.push(new HumanMessage(content))

    await createMessage({
        role: "user",
        content: content,
        conversation: conversation._id
    })

    const stream = await model.stream(messages)


    //----------------- set headers of SSE ------------------------

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // ––––––––––––––––––––– send conversation details via SSE –––––––––––––––––––––
    res.write(`data: ${JSON.stringify({
        conversationId: conversation._id,
        title: conversation.title
    })}\n\n`)

    let aiMessage = null

    for await (const chunk of stream) {
        if (!aiMessage) {
            aiMessage = chunk
        }
        else {
            aiMessage = aiMessage.concat(chunk)
        }

        res.write(`data: ${JSON.stringify({ chunk: chunk.content })}\n\n`)
    }

    //------------------------end of SSE ------------------------------

    res.end()

    await createMessage({
        role: "assistant",
        conversation: conversation._id,
        content: JSON.stringify(aiMessage.toDict())
    })

}

export const getAllConversation = async (req, res) => {
    let user = req.user

    let conversation = await findConversationsByUser(user.id)

    return sendSuccess(res, 200, "Conversations fetched successfully", conversation)
}

export const getmessageByConversation = async (req, res, next) => {
    const { conversationId } = req.params
    const user = req.user

    const conversation = await findConversationByIdAndUser(conversationId, user.id)
    if (!conversation) {
        return next(new AppError(404, "conversation not found"))
    }

    const message = await findMessagesByConversation(conversationId)

    return sendSuccess(res, 200, "messages fetched successfully", message)
}

export const deleteConversation = async (req, res, next) => {
    const { conversationId } = req.params
    const user = req.user

    const conversation = await findConversationByIdAndUser(conversationId, user.id)

    if (!conversation) {
        return next(new AppError(404, "conversation not found"))
    }

    const messages = await findMessagesByConversation(conversationId)

    if(!messages){
        return next(new AppError(404, "messages not found"))
    }

    await deleteConversationByIdAndUser(conversationId, user.id)

    await deleteMessagesByConversation(conversationId)

    return sendSuccess(res, 200, "conversation deleted successfully")
}