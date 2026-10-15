import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const whoCanJoin = v.union(
  v.literal("open"),
  v.literal("women"),
  v.literal("men"),
);

const gender = v.union(
  v.literal("woman"),
  v.literal("man"),
  v.literal("unspecified"),
);

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.optional(v.string()),
    image: v.optional(v.string()),
    email: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
    easyPaceMinPerKm: v.optional(v.number()),
    gender: v.optional(gender),
    genderChangedAt: v.optional(v.number()),
  })
    .index("email", ["email"])
    .index("phone", ["phone"]),

  runs: defineTable({
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
    createdAt: v.number(),
  })
    .index("by_startsAt", ["startsAt"])
    .index("by_city_and_startsAt", ["city", "startsAt"])
    .index("by_host", ["hostId"]),

  rsvps: defineTable({
    runId: v.id("runs"),
    userId: v.id("users"),
    createdAt: v.number(),
    hideName: v.optional(v.boolean()),
  })
    .index("by_run", ["runId"])
    .index("by_user", ["userId"])
    .index("by_run_and_user", ["runId", "userId"]),
});
