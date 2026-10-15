import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { action } from "./_generated/server";
import { isInBarcelona, nominatimViewbox } from "./lib/barcelona";

function parseNominatim(data: unknown): { lat: number; lng: number } | null {
  if (!Array.isArray(data) || data.length === 0) {
    return null;
  }
  const first = data[0];
  if (typeof first !== "object" || first === null) {
    return null;
  }
  if (!("lat" in first) || !("lon" in first)) {
    return null;
  }
  if (typeof first.lat !== "string" || typeof first.lon !== "string") {
    return null;
  }
  const lat = Number(first.lat);
  const lng = Number(first.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }
  return { lat, lng };
}

export const lookup = action({
  args: {
    placeName: v.string(),
    city: v.string(),
  },
  returns: v.union(
    v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }

    const query = `${args.placeName.trim()}, ${args.city.trim()}`;
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "1");
    url.searchParams.set("countrycodes", "es");
    url.searchParams.set("viewbox", nominatimViewbox());
    url.searchParams.set("bounded", "1");
    url.searchParams.set("q", query);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "TimesRunClub/1.0 (https://timesrun.club)",
      },
    });
    if (!response.ok) {
      return null;
    }

    const parsed = parseNominatim(await response.json());
    if (!parsed || !isInBarcelona(parsed.lat, parsed.lng)) {
      return null;
    }
    return parsed;
  },
});

function field(obj: object, key: string): string | null {
  if (!(key in obj)) {
    return null;
  }
  const value = (obj as Record<string, unknown>)[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseReverseLabel(data: unknown): string | null {
  if (typeof data !== "object" || data === null) {
    return null;
  }
  const named = field(data, "name");
  if (named) {
    return named;
  }
  if ("address" in data && typeof data.address === "object" && data.address !== null) {
    const parts: string[] = [];
    for (const key of ["park", "leisure", "tourism", "amenity", "road", "neighbourhood", "suburb"]) {
      const value = field(data.address, key);
      if (value && !parts.includes(value)) {
        parts.push(value);
      }
    }
    if (parts.length > 0) {
      return parts.slice(0, 2).join(", ");
    }
  }
  const display = field(data, "display_name");
  if (display) {
    return display.split(",").slice(0, 2).join(",").trim();
  }
  return null;
}

export const reverse = action({
  args: {
    lat: v.number(),
    lng: v.number(),
  },
  returns: v.union(v.string(), v.null()),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("Not authenticated");
    }
    if (!isInBarcelona(args.lat, args.lng)) {
      return null;
    }

    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(args.lat));
    url.searchParams.set("lon", String(args.lng));
    url.searchParams.set("zoom", "17");

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "TimesRunClub/1.0 (https://timesrun.club)",
      },
    });
    if (!response.ok) {
      return null;
    }

    return parseReverseLabel(await response.json());
  },
});
