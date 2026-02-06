import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    messages: defineTable({
        body: v.string(),
        author: v.string(), // "Me" or Character Name
        sessionId: v.string(), // To keep chats separate for the user
        timestamp: v.optional(v.number()),
    }).index("by_sessionId", ["sessionId"]),
    typingIndicators: defineTable({
        author: v.string(),
        sessionId: v.string(),
    }).index("by_sessionId_author", ["sessionId", "author"])
        .index("by_sessionId", ["sessionId"]),
});
