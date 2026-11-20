import mongoose, { Mongoose } from "mongoose"

const conversationSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    title: {
        required: true,
        type: String,
        maxLength: 50,
        trim: true,
        default: "New Conversation"
    },
    lastMessage: {
        type: Date,
        default: null
    }
}, { timestamps: { createdAt: "createdAt", updatedAt: "lastUpdate" } })

conversationSchema.index({ user: 1, lastMessage: -1 })

const conversationModel = mongoose.model("Conversation", conversationSchema)

export default conversationModel