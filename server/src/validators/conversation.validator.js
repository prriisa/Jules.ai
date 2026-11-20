import { body } from "express-validator"

export const sendMessageValidator = [
    body("content")
        .exists().withMessage("content id required").bail()
        .isString().withMessage("content must be a string").bail()
        .custom((value) => value.trim().length > 0).withMessage('Message content cannot be empty'),

    body("conversation")
        .optional({ values: 'null' })
        .isMongoId().withMessage('Conversation must be a valid id'),
]