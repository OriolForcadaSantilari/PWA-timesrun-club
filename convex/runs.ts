import { v } from "convex/values";
import { query } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { getCurrentUserOrNull } from "./lib/auth";
import {
  assertBarcelonaPin,
  assertStartsInFuture,
  hasAlreadyStarted,
} from "./lib/barcelona";
import { attendeeLabel } from "./lib/names";
import { authedMutation } from "./lib/customFunctions";
import { canJoinRun, countRsvps, viewerRsvp } from "./lib/matching";

const whoCanJoin = v.union(
  v.literal("open"),
  v.literal("women"),
  v.literal("men"),
);

const runCardValidator = v.object({
  _id: v.id("runs"),
  hostId: v.optional(v.id("users")),
  startsAt: v.number(),
  distanceKm: v.number(),
  paceMin: v.number(),
  paceMax: v.number(),
  spots: v.number(),
  whoCanJoin,
  placeName: v.string(),
  city: v.string(),
  lat: v.number(),
  lng: v.number(),
  joinedCount: v.number(),
  viewerJoined: v.boolean(),
  viewerIsHost: v.boolean(),
  attendeeNames: v.union(v.array(v.string()), v.null()),
});

async function attendeeNamesFor(
  ctx: Parameters<typeof countRsvps>[0],
  run: Doc<"runs">,
  userId: Id<"users"> | null,
  viewerJoined: boolean,
  limit: number | null,
): Promise<string[] | null> {
  if (userId === null) {
    return null;
  }
  if (run.whoCanJoin !== "open" && !viewerJoined) {
    return null;
  }

  const rsvps = await ctx.db
    .query("rsvps")
    .withIndex("by_run", (q) => q.eq("runId", run._id))
    .take(40);
  rsvps.sort((a, b) => a.createdAt - b.createdAt);
  const visible = limit === null ? rsvps : rsvps.slice(0, limit);
  const names: string[] = [];
  for (const rsvp of visible) {
    if (rsvp.hideName) {
      names.push(attendeeLabel(undefined, true));
      continue;
    }
    const member = await ctx.db.get(rsvp.userId);
    names.push(attendeeLabel(member?.name, false));
  }
  return names;
}

async function toRunCard(
  ctx: Parameters<typeof countRsvps>[0],
  run: Doc<"runs">,
  userId: Id<"users"> | null,
  nameLimit: number | null,
) {
  const [joinedCount, rsvp] = await Promise.all([
    countRsvps(ctx, run._id),
    viewerRsvp(ctx, run._id, userId),
  ]);
  const viewerJoined = rsvp !== null;
  return {
    _id: run._id,
    hostId: run.hostId,
    startsAt: run.startsAt,
    distanceKm: run.distanceKm,
    paceMin: run.paceMin,
    paceMax: run.paceMax,
    spots: run.spots,
    whoCanJoin: run.whoCanJoin,
    placeName: run.placeName,
    city: run.city,
    lat: run.lat,
    lng: run.lng,
    joinedCount,
    viewerJoined,
    viewerIsHost: userId !== null && run.hostId === userId,
    attendeeNames: await attendeeNamesFor(ctx, run, userId, viewerJoined, nameLimit),
  };
}

function assertRunFields(args: {
  placeName: string;
  spots: number;
  distanceKm: number;
  paceMin: number;
  paceMax: number;
}) {
  if (!args.placeName.trim()) {
    throw new Error("Meeting point is required");
  }
  if (args.spots < 2 || args.spots > 30) {
    throw new Error("Spots must be between 2 and 30");
  }
  if (args.distanceKm < 1 || args.distanceKm > 50) {
    throw new Error("Distance must be between 1 and 50 km");
  }
  if (args.paceMax < args.paceMin) {
    throw new Error("The slower end of the band must be higher than the faster end.");
  }
}

export const list = query({
  args: {
    city: v.string(),
    now: v.number(),
  },
  returns: v.array(runCardValidator),
  handler: async (ctx, args) => {
    const user = await getCurrentUserOrNull(ctx);
    const horizon = args.now - 60 * 60 * 1000;
    // TODO: paginate Find instead of capping at 50 upcoming Barcelona runs.
    const runs = await ctx.db
      .query("runs")
      .withIndex("by_city_and_startsAt", (q) => q.eq("city", args.city).gte("startsAt", horizon))
      .take(50);

    const cards = [];
    for (const run of runs) {
      cards.push(await toRunCard(ctx, run, user?._id ?? null, 3));
    }
    return cards.sort((a, b) => a.startsAt - b.startsAt);
  },
});

export const get = query({
  args: { runId: v.id("runs") },
  returns: v.union(runCardValidator, v.null()),
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    if (!run) {
      return null;
    }
    const user = await getCurrentUserOrNull(ctx);
    return await toRunCard(ctx, run, user?._id ?? null, null);
  },
});

export const create = authedMutation({
  args: {
    startsAt: v.number(),
    distanceKm: v.number(),
    paceMin: v.number(),
    paceMax: v.number(),
    spots: v.number(),
    whoCanJoin,
    placeName: v.string(),
    city: v.string(),
    lat: v.number(),
    lng: v.number(),
  },
  returns: v.id("runs"),
  handler: async (ctx, args) => {
    assertRunFields(args);
    assertBarcelonaPin(args.city, args.lat, args.lng);
    assertStartsInFuture(args.startsAt, Date.now());

    const runId = await ctx.db.insert("runs", {
      hostId: ctx.user._id,
      startsAt: args.startsAt,
      distanceKm: args.distanceKm,
      paceMin: args.paceMin,
      paceMax: args.paceMax,
      spots: args.spots,
      whoCanJoin: args.whoCanJoin,
      placeName: args.placeName.trim(),
      city: args.city,
      lat: args.lat,
      lng: args.lng,
      createdAt: Date.now(),
    });

    await ctx.db.insert("rsvps", {
      runId,
      userId: ctx.user._id,
      createdAt: Date.now(),
      hideName: false,
    });

    return runId;
  },
});

export const join = authedMutation({
  args: {
    runId: v.id("runs"),
    hideName: v.optional(v.boolean()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    if (!run) {
      throw new Error("Run not found");
    }

    const existing = await ctx.db
      .query("rsvps")
      .withIndex("by_run_and_user", (q) => q.eq("runId", args.runId).eq("userId", ctx.user._id))
      .unique();
    if (existing) {
      return null;
    }

    if (hasAlreadyStarted(run.startsAt, Date.now())) {
      throw new Error("This run has already started.");
    }

    const joinedCount = await countRsvps(ctx, args.runId);
    const profile = {
      easyPaceMinPerKm: ctx.user.easyPaceMinPerKm ?? 5.75,
      gender: ctx.user.gender ?? "unspecified",
    };
    const gate = canJoinRun(run, joinedCount, false, profile);
    if (!gate.ok) {
      throw new Error(gate.reason ?? "You cannot join this run");
    }

    await ctx.db.insert("rsvps", {
      runId: args.runId,
      userId: ctx.user._id,
      createdAt: Date.now(),
      hideName: args.hideName === true,
    });
    return null;
  },
});

export const leave = authedMutation({
  args: { runId: v.id("runs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    if (run && run.hostId === ctx.user._id) {
      throw new Error("You're hosting this run. Cancel it to take it off the board.");
    }

    const existing = await ctx.db
      .query("rsvps")
      .withIndex("by_run_and_user", (q) => q.eq("runId", args.runId).eq("userId", ctx.user._id))
      .unique();
    if (!existing) {
      return null;
    }
    await ctx.db.delete(existing._id);
    return null;
  },
});

export const update = authedMutation({
  args: {
    runId: v.id("runs"),
    startsAt: v.number(),
    distanceKm: v.number(),
    paceMin: v.number(),
    paceMax: v.number(),
    spots: v.number(),
    whoCanJoin,
    placeName: v.string(),
    city: v.string(),
    lat: v.number(),
    lng: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    if (!run) {
      throw new Error("Run not found");
    }
    if (run.hostId !== ctx.user._id) {
      throw new Error("Only the host can edit this run");
    }
    assertRunFields(args);
    assertBarcelonaPin(args.city, args.lat, args.lng);
    assertStartsInFuture(args.startsAt, Date.now());
    const joinedCount = await countRsvps(ctx, args.runId);
    if (args.spots < joinedCount) {
      throw new Error(`At least ${joinedCount} people are going. Don't drop spots below that.`);
    }

    await ctx.db.patch(args.runId, {
      startsAt: args.startsAt,
      distanceKm: args.distanceKm,
      paceMin: args.paceMin,
      paceMax: args.paceMax,
      spots: args.spots,
      whoCanJoin: args.whoCanJoin,
      placeName: args.placeName.trim(),
      city: args.city,
      lat: args.lat,
      lng: args.lng,
    });
    return null;
  },
});

export const cancel = authedMutation({
  args: { runId: v.id("runs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const run = await ctx.db.get(args.runId);
    if (!run) {
      throw new Error("Run not found");
    }
    if (run.hostId !== ctx.user._id) {
      throw new Error("Only the host can cancel this run");
    }

    const rsvps = await ctx.db
      .query("rsvps")
      .withIndex("by_run", (q) => q.eq("runId", args.runId))
      .take(40);
    for (const rsvp of rsvps) {
      await ctx.db.delete(rsvp._id);
    }
    await ctx.db.delete(args.runId);
    return null;
  },
});
