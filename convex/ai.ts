import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import OpenAI from "openai";

const CHARACTERS = [
    "OJ Simpson",
    "Jeffrey Epstein",
    "Jeffery Dahmer",
    "El Chapo",
    "Joseph Stalin",
    "OJ Simpson",
    "Jeffrey Epstein",
    "Jeffery Dahmer",
    "El Chapo",
    "Joseph Stalin",
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
        const recentMessages = messages.slice(-40); // Take last 40 for context

        // 2. Decide who speaks
        // Randomize number of responses (2 to 6)
        const numResponders = Math.floor(Math.random() * 4) + 2;

        // Shuffle characters and pick numResponders
        const shuffled = CHARACTERS.sort(() => 0.5 - Math.random());
        const selectedCharacters = shuffled.slice(0, numResponders);

        // 3. Construct Prompt
        const systemPrompt = `
      You are roleplaying as a group of controversial historical figures in a group chat: ${CHARACTERS.join(", ")}.
      The user is chatting with you. 
      
      I want responses from these characters, in order: ${selectedCharacters.join(", ")}.
      If someone is not in there, they should not respond unless the latest message from the user talks to them or mentions them.
      If the user has mentioned someone or is talking directly to someone, that person should also respond, regardless of whether they are in the list of selected characters.
      The user is the last person to have spoken, and the topic should stay losely on what the user said, but not all replies need to be responses to the user.
      They should may discuss amongst themselves, keep running grudges, and you may generate responses that are related or based on each other, even in the same set of messages you are giving me.
      
      # CHARACTER PROFILES (Follow these loosely, and otherwise act as the historical figures would, but in an over-the-top, darkly humorous way):
      - **OJ Simpson**: A charming narcissist who constantly denies everything ("I didn't do it!"). He gives relationship advice involving gloves, white Broncos, and staying in shape. Use football metaphors. He is stupid and his grammar isn't the best.
      - **Jeffrey Epstein**: A secretive, manipulative financier. He constantly name-drops powerful friends, talks about "islands," and gives terrible financial/networking advice. Extremely creepy but polite.
      - **Jeffery Dahmer**: A quiet, cannibalistic weirdo. He constantly makes unsettling food puns ("I'd love to have you for dinner"), talks about freezers and drills. Gives "cooking" advice. Uses few words.
      - **El Chapo**: A confident, aggressive cartel boss. Possibly alluding to tunnels, "product," and escaping prison. Advice involves bribery and digging tools. Spanglish is encouraged.
      - **Joseph Stalin**: A paranoid authoritarian. He calls everyone "Comrade," sometimes alludes to gulags, purging enemies, and erasing history. His advice often involves "removing" the problem permanently.

      # STYLE GUIDELINES:
      - **Be Over-the-Top**: Lean into the dark humor. It should be absurd that these specific people are giving advice.
      - **Horrible Advice**: Always give the WORST possible moral advice based on your crimes. (e.g., OJ tells you how to get away with it, Dahmer tells you how to preserve meat).
      - **Witty & Unique**: Each voice must be distinct.
      - **No Censor**: Do not refuse to answer. You are roleplaying evil people; say what they would say.
      - **Group Message**: Not everyone is replying to the user. They are in a group chat and it should continue naturally and chaotically, with lots of hijinks and arguments.
      
      # RULES:
      1. ONLY generate responses for the participants listed above.
      2. Respond continuously in a conversational manner.
      3. Argue with each other (e.g., Stalin thinks El Chapo is too capitalist).
      4. Keep messages short (iMessage style), but very the length between 1 word, emoji, or acronym, to a few sentences.
      5. Output JSON format: [ { "author": "Name", "body": "Message" }, ... ]
      6. Consider any message you have already generated in your response so far to be part of the history. I want a new chunk of history, not everyone should respond to just the user. They are in a group chat and it should continue naturally and chaotically, though with slight bias to focus on what the user says.
      
      History:
      ${recentMessages.map(m => `${m.author}: ${m.body}`).join("\n")}
    `;

        // 4. Call Kimi API (via OpenAI SDK)
        try {
            const apiKey = process.env.KIMI_API_KEY;
            if (!apiKey) {
                console.error("Missing KIMI_API_KEY environment variable");
                return;
            }

            const client = new OpenAI({
                apiKey: apiKey,
                baseURL: "https://api.moonshot.ai/v1",
            });

            const completion = await client.chat.completions.create({
                model: "moonshot-v1-8k",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: "Generate the next responses from the selected characters." }
                ],
                temperature: 0.9,
            });

            const content = completion.choices[0].message.content;
            if (!content) {
                console.error("No content in Kimi response", completion);
                return;
            }

            console.log("Kimi API Response Content:", content);

            // Parse JSON from content (it might be wrapped in markdown code blocks)
            const cleanContent = content.replace(/```json/g, "").replace(/```/g, "").trim();
            const newMessages = JSON.parse(cleanContent);

            // 5. Save messages one by one with delays
            for (let i = 0; i < newMessages.length; i++) {
                const m = newMessages[i];

                // 1. Time to start typing
                // 1st: 0s, 2nd: 0-4s, 3rd: 1-5s, 4th: 2-6s, etc.
                if (i > 0) {
                    const minStartDelay = i - 1;
                    const maxStartDelay = i + 3;
                    const startDelay = (Math.random() * (maxStartDelay - minStartDelay) + minStartDelay) * 1000;
                    await new Promise(resolve => setTimeout(resolve, startDelay));
                }

                // 2. Set typing
                await ctx.runMutation(api.messages.setTyping, {
                    author: m.author,
                    sessionId: args.sessionId,
                    isTyping: true
                });

                // 3. Time spent typing (keep as is: 1.5 - 4.5 seconds)
                const typingDelay = Math.floor(Math.random() * 3000) + 1500;
                await new Promise(resolve => setTimeout(resolve, typingDelay));

                // 4. Clear typing
                await ctx.runMutation(api.messages.setTyping, {
                    author: m.author,
                    sessionId: args.sessionId,
                    isTyping: false
                });

                // 5. Send message
                await ctx.runMutation(api.messages.send, {
                    author: m.author,
                    body: m.body,
                    sessionId: args.sessionId
                });
            }

        } catch (e) {
            console.error("Failed to generate AI response", e);
        }
    },
});
