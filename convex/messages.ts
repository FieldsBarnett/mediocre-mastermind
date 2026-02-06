import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

export const get = query({
    args: { sessionId: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("messages")
            .withIndex("by_sessionId", (q) => q.eq("sessionId", args.sessionId))
            .order("asc")
            .collect();
    },
});

export const send = mutation({
    args: {
        body: v.string(),
        author: v.string(),
        sessionId: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("messages", {
            body: args.body,
            author: args.author,
            timestamp: Date.now(),
            sessionId: args.sessionId,
        });

        if (args.author === "Me") {
            await ctx.scheduler.runAfter(0, api.ai.generateResponse, {
                sessionId: args.sessionId,
            });
        }
    },
});

export const sendBatch = mutation({
    args: {
        messages: v.array(
            v.object({
                body: v.string(),
                author: v.string(),
                sessionId: v.string(),
            })
        )
    },
    handler: async (ctx, args) => {
        for (const msg of args.messages) {
            await ctx.db.insert("messages", {
                body: msg.body,
                author: msg.author,
                timestamp: Date.now(),
                sessionId: msg.sessionId
            });
        }
    }
});
