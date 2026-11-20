import { ChatGroq } from "@langchain/groq"
import { config } from "../../config/env.js"
import * as z from "zod"
import { SystemMessage, HumanMessage } from "langchain"

model = new ChatGroq({
    model: "qwen/qwen3.8-27b",
    apiKey: config.groqApiKey
})

const structureModel = model.withStructuredOutput(z.object({
    title: z.string().min(3).max(60).describe("the title of the conversation on the basis of the user's first message")
}))

export const generateTitle = async (message) => {
    const systemMessage = new SystemMessage(`
    You are an AI assistant that generates a concise and relevant title for a conversation based on the user's message.

        ## Follow these guidelines:
        - The title should be concise and relevant to the user's message.
        - The title should be no longer than 60 characters.
        - Avoid using generic titles like "Chat" or "Conversation".
        - Focus on the main topic or intent of the user's message.
        
        `)

    const humanMessage = new HumanMessage(message)

    const response = await structureModel.invoke([systemMessage, humanMessage])

    return response
}