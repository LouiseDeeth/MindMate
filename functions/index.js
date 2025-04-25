const { onRequest } = require("firebase-functions/v2/https");
const cors = require("cors")({ origin: true });
const axios = require("axios");
const { defineString } = require("firebase-functions/params");

// Define your config parameter with a default (which won't be used)
const claudeApiKey = defineString("CLAUDE_API_KEY");

// Export the function using v2 syntax
exports.claudeProxy = onRequest(async (req, res) => {
  return cors(req, res, async () => {
    try {
      if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
      }

      // Try using process.env for Firebase config
      const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;

      if (!CLAUDE_API_KEY) {
        console.error("Missing Claude API key in configuration");
        return res.status(500).json({ error: "Server configuration error" });
      }

      const {
        model = "claude-3-opus-20240229",
        messages,
        system,
        temperature = 0.7
      } = req.body;

      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Invalid or missing 'messages' array" });
      }

      console.log("Making request to Claude API");
      
      const response = await axios.post(
        "https://api.anthropic.com/v1/messages",
        {
          model,
          messages,
          system,
          max_tokens: 350,
          temperature
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": CLAUDE_API_KEY,
            "anthropic-version": "2023-06-01"
          }
        }
      );

      console.log("Received response from Claude API");
      
      const content = response.data?.content?.[0]?.text || "";
      return res.json({ role: "assistant", content });

    } catch (err) {
      console.error("Claude Proxy Error:", err.response?.data || err.message);
      return res.status(err.response?.status || 500).json({
        error: err.response?.data || "Internal Server Error"
      });
    }
  });
});