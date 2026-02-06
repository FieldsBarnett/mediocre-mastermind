/// <reference types="node" />
import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const CHARACTERS = [
    "OJ Simpson",
    "Jeffrey Epstein",
    "Jeffery Dahmer",
    "El Chapo",
    "Joseph Stalin",
];

export const generateResponse = action({
    args: { sessionId: v.string() },
    handler: async (ctx, args) => {
        // 1. Get recent context
        const messages = await ctx.runQuery(api.messages.get, { sessionId: args.sessionId });
        const recentMessages = messages.slice(-10); // Take last 10 for context

        // 2. Decide who speaks
        // Randomize number of responders (1 to 3)
        const numResponders = Math.floor(Math.random() * 3) + 1;

        // Shuffle characters and pick numResponders
        const shuffled = CHARACTERS.sort(() => 0.5 - Math.random());
        const selectedCharacters = shuffled.slice(0, numResponders);

        // 3. Construct Prompt
        const systemPrompt = `
      You are roleplaying as a group of controversial historical figures in a group chat: ${CHARACTERS.join(", ")}.
      The user is chatting with you. 
      
      Current active participants are: ${selectedCharacters.join(", ")}.
      
      Rules:
      1. ONLY generate responses for the participants listed above.
      2. Respond continuously in a conversational manner.
      3. You can argue with each other.
      4. Keep messages relatively short, like a chat app (iMessage).
      5. DO NOT break character.
      6. Output JSON format: [ { "author": "Name", "body": "Message" }, ... ]
      7. The user just sent the last message in the history.
      
      History:
      ${recentMessages.map(m => `${m.author}: ${m.body}`).join("\n")}
    `;

        // 4. Call Kimi API
        try {
            const apiKey = process.env.KIMI_API_KEY;
            if (!apiKey) {
                console.error("Missing KIMI_API_KEY environment variable");
                return;
            }

            const response = await fetch("https://api.moonshot.cn/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "moonshot-v1-8k",
                    messages: [
                        { role: "system", content: systemPrompt },
                        { role: "user", content: "Generate the next responses from the selected characters." }
                    ],
                    temperature: 0.9,
                }),
            });

            const data = await response.json();
            console.log("Kimi API Response:", data);

            if (!data.choices || !data.choices[0] || !data.choices[0].message) {
                console.error("Invalid Kimi response structure", data);
                return;
            }

            const content = data.choices[0].message.content;

            // Parse JSON from content (it might be wrapped in markdown code blocks)
            const cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
            const newMessages = JSON.parse(cleanContent);

            // 5. Save messages
            await ctx.runMutation(api.messages.sendBatch, {
                messages: newMessages.map((m: any) => ({
                    author: m.author,
                    body: m.body,
                    sessionId: args.sessionId
                }))
            });

        } catch (e) {
            console.error("Failed to generate AI response", e);
        }
    },
});
