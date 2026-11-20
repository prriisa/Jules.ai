import mongoose from "mongoose";

export const MESSAGE_ROLE = Object.freeze(["user", "assistant", "tool"])

const messageSchema = mongoose.Schema({
    role: {
        type: String,
        enum: MESSAGE_ROLE,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    }

}, { timestamps: { createdAt: "createdAt", updatedAt: false } })

messageSchema.index({ conversation: 1, createdAt: 1 })

const messageModel = mongoose.model("Message", messageSchema)

export default messageModel