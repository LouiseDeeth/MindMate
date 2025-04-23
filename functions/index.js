const functions = require("firebase-functions");
const cors = require("cors")({ origin: true });
const axios = require("axios");

// Cloud function to proxy requests to Claude API
exports.claudeProxy = functions.https.onRequest((request, response) => {
    return cors(request, response, async () => {
        try {
            // Only allow POST requests
            if (request.method !== "POST") {
                return response.status(405).send("Method Not Allowed");
            }

            // Extract Claude API details from the request
            const {
                apiKey,
                model = "claude-3-opus-20240229",
                messages,
                system,
                temperature = 0.7,
            } = request.body;
            const maxTokens = 350;
            if (!apiKey) {
                return response.status(400).json({ error: "API key is required" });
            }

            // Make the request to Claude API
            const claudeResponse = await axios.post(
                "https://api.anthropic.com/v1/messages",
                {
                    model: model || "claude-3-opus-20240229",
                    messages: messages,
                    system: system,
                    max_tokens: maxTokens,
                    temperature: temperature || 0.7,
                },
                {
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": apiKey,
                        "anthropic-version": "2023-06-01",
                    },
                },
            );

            // Transform the response to the format expected by your frontend
            const responseData = {
                content: claudeResponse.data.content[0].text,
                role: "assistant",
            };

            return response.json(responseData);
        } catch (error) {
            console.error("Error proxying to Claude API:", error.message);

            // Return appropriate status codes based on Claude API responses
            if (error.response) {
                const errorMessage = error.response.data && error.response.data.error ?
                    error.response.data.error.message : "Error from Claude API";

                return response
                    .status(error.response.status).json({ error: errorMessage });
            }

            return response.status(500)
                .json({ error: "Failed to communicate with Claude API" });
        }
    });
});
