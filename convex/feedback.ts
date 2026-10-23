import { v } from "convex/values";
import { authedMutation } from "./lib/customFunctions";

const MAX_FEEDBACK = 500;

function normalizeFeedback(raw: string): string {
  const message = raw.trim();
  if (!message) {
    throw new Error("Write a short idea first.");
  }
  if (message.length > MAX_FEEDBACK) {
    throw new Error("Keep it to 500 characters.");
  }
  return message;
}

export const send = authedMutation({
  args: {
    message: v.string(),
    path: v.optional(v.string()),
  },
  returns: v.id("feedbackBox"),
  handler: async (ctx, args) => {
    const message = normalizeFeedback(args.message);
    const path = args.path?.trim();
    return await ctx.db.insert("feedbackBox", {
      userId: ctx.user._id,
      message,
      createdAt: Date.now(),
      path: path ? path.slice(0, 200) : undefined,
      email: ctx.user.email,
      name: ctx.user.name,
    });
  },
});
