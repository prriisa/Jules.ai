import { body } from "express-validator";

/**
 * Validates registration fields before the controller is called.
 * @type {import("express-validator").ValidationChain[]}
 */
export const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Enter your name")
    .bail()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Enter your email address")
    .bail()
    .isEmail()
    .withMessage("Enter a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Enter a password")
    .bail()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .bail()
    .matches(/^(?=.*[A-Za-z])(?=.*\d).+$/)
    .withMessage("Password must contain a letter and a number")
];

/**
 * Validates login credentials without revealing which value was incorrect.
 * @type {import("express-validator").ValidationChain[]}
 */
export const loginValidator = [
  body("email").trim().isEmail().withMessage("Enter a valid email address").normalizeEmail(),
  body("password").notEmpty().withMessage("Enter your password")
];