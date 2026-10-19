import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUserOrNull } from "./lib/auth";
import { authedMutation } from "./lib/customFunctions";
import {
  assertNameAvailable,
  assertPublicName,
  FALLBACK_NAME,
  storedPublicName,
} from "./lib/names";

const GENDER_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000;

const gender = v.union(
  v.literal("woman"),
  v.literal("man"),
  v.literal("unspecified"),
);

const meValidator = v.union(
  v.object({
    _id: v.id("users"),
    name: v.string(),
    needsName: v.boolean(),
    easyPaceMinPerKm: v.number(),
    gender,
    genderChangedAt: v.optional(v.number()),
  }),
  v.null(),
);

export const isNameTaken = query({
  args: { name: v.string() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const wanted = args.name.trim().toLowerCase();
    if (wanted.length < 2) {
      return false;
    }
    const users = await ctx.db.query("users").collect();
    return users.some((user) => storedPublicName(user.name)?.toLowerCase() === wanted);
  },
});

export const me = query({
  args: {},
  returns: meValidator,
  handler: async (ctx) => {
    const user = await getCurrentUserOrNull(ctx);
    if (!user) {
      return null;
    }
    const stored = storedPublicName(user.name);
    return {
      _id: user._id,
      name: stored ?? FALLBACK_NAME,
      needsName: stored === null,
      easyPaceMinPerKm: user.easyPaceMinPerKm ?? 5.75,
      gender: user.gender ?? "unspecified",
      genderChangedAt: user.genderChangedAt,
    };
  },
});

export const updateMe = authedMutation({
  args: {
    name: v.optional(v.string()),
    easyPaceMinPerKm: v.number(),
    gender,
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    if (args.easyPaceMinPerKm < 3 || args.easyPaceMinPerKm > 12) {
      throw new Error("Easy pace must be between 3:00 and 12:00 /km");
    }

    const stored = storedPublicName(ctx.user.name);
    let nextName = stored;
    if (stored === null) {
      if (args.name === undefined) {
        throw new Error("Name is required");
      }
      nextName = assertPublicName(args.name);
      await assertNameAvailable(ctx, nextName, ctx.user._id);
    }

    const currentGender = ctx.user.gender;
    const genderChanged = currentGender !== undefined && currentGender !== args.gender;
    if (genderChanged && ctx.user.genderChangedAt !== undefined) {
      const nextAllowed = ctx.user.genderChangedAt + GENDER_COOLDOWN_MS;
      if (Date.now() < nextAllowed) {
        const when = new Date(nextAllowed).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        throw new Error(`Gender can be changed every 30 days. Next change on ${when}.`);
      }
    }

    await ctx.db.patch(ctx.user._id, {
      ...(nextName !== stored && nextName !== null ? { name: nextName } : {}),
      easyPaceMinPerKm: args.easyPaceMinPerKm,
      gender: args.gender,
      ...(genderChanged || currentGender === undefined
        ? { genderChangedAt: Date.now() }
        : {}),
    });
    return null;
  },
});

export const deleteMe = authedMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    const userId = ctx.user._id;

    for (;;) {
      const rsvps = await ctx.db
        .query("rsvps")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .take(100);
      if (rsvps.length === 0) {
        break;
      }
      for (const rsvp of rsvps) {
        await ctx.db.delete(rsvp._id);
      }
    }

    for (;;) {
      const hosted = await ctx.db
        .query("runs")
        .withIndex("by_host", (q) => q.eq("hostId", userId))
        .take(50);
      if (hosted.length === 0) {
        break;
      }
      for (const run of hosted) {
        const runRsvps = await ctx.db
          .query("rsvps")
          .withIndex("by_run", (q) => q.eq("runId", run._id))
          .take(40);
        for (const rsvp of runRsvps) {
          await ctx.db.delete(rsvp._id);
        }
        await ctx.db.delete(run._id);
      }
    }

    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", userId))
      .take(64);
    for (const session of sessions) {
      const tokens = await ctx.db
        .query("authRefreshTokens")
        .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
        .take(64);
      for (const token of tokens) {
        await ctx.db.delete(token._id);
      }
      await ctx.db.delete(session._id);
    }

    const accounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", userId))
      .take(16);
    for (const account of accounts) {
      const codes = await ctx.db
        .query("authVerificationCodes")
        .withIndex("accountId", (q) => q.eq("accountId", account._id))
        .take(32);
      for (const code of codes) {
        await ctx.db.delete(code._id);
      }
      await ctx.db.delete(account._id);
    }

    await ctx.db.delete(userId);
    return null;
  },
});
