import "dotenv/config";

/**
 * Reads a required environment value and rejects missing configuration.
 * @param {string | undefined} value - Environment value to validate.
 * @param {string} name - Variable name used in the startup error.
 * @returns {string} The non-empty value.
 * @throws {Error} When the value is missing.
 */
const required = (value, name) => {
  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
};

const accessTokenSecret = required(process.env.ACCESS_TOKEN_SECRET, "ACCESS_TOKEN_SECRET");
const refreshTokenSecret = required(process.env.REFRESH_TOKEN_SECRET, "REFRESH_TOKEN_SECRET");
const groqApiKey = required(process.env.GROQ_API_KEY, "GROQ_API_KEY");

if (accessTokenSecret.length < 32 || refreshTokenSecret.length < 32) {
  throw new Error("JWT secrets must be at least 32 characters long.");
}

export const config = Object.freeze({
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  mongoUri: required(process.env.MONGODB_URI, "MONGODB_URI"),
  accessTokenSecret,
  refreshTokenSecret,
  groqApiKey
});