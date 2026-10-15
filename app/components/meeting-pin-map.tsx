"use client";

import { BARCELONA_BOUNDS } from "@/convex/lib/barcelona";
import type { CircleMarker, LeafletMouseEvent, Map as LeafletMap } from "leaflet";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export const BARCELONA_CENTER = { lat: 41.3874, lng: 2.1686 };

export type MapPin = { lat: number; lng: number };

type MeetingPinMapProps = {
  pin: MapPin | null;
  onPin: (pin: MapPin) => void;
};

export function MeetingPinMap({ pin, onPin }: MeetingPinMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<CircleMarker | null>(null);
  const onPinRef = useRef(onPin);
  const pinRef = useRef(pin);
  onPinRef.current = onPin;
  pinRef.current = pin;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) {
      return;
    }

    let cancelled = false;

    void import("leaflet").then((leaflet) => {
      if (cancelled || !containerRef.current) {
        return;
      }
      const L = leafletFromModule(leaflet);
      const map = L.map(containerRef.current, {
        center: [BARCELONA_CENTER.lat, BARCELONA_CENTER.lng],
        zoom: 13,
        maxBounds: [
          [BARCELONA_BOUNDS.minLat, BARCELONA_BOUNDS.minLng],
          [BARCELONA_BOUNDS.maxLat, BARCELONA_BOUNDS.maxLng],
        ],
        maxBoundsViscosity: 1,
        scrollWheelZoom: false,
        attributionControl: true,
      });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      map.on("click", (event: LeafletMouseEvent) => {
        onPinRef.current({ lat: event.latlng.lat, lng: event.latlng.lng });
      });

      mapRef.current = map;
      const current = pinRef.current;
      if (current) {
        markerRef.current = L.circleMarker([current.lat, current.lng], markerStyle()).addTo(map);
        map.panTo([current.lat, current.lng]);
      }
      window.setTimeout(() => {
        map.invalidateSize();
      }, 80);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !pin) {
      return;
    }
    void import("leaflet").then((leaflet) => {
      const L = leafletFromModule(leaflet);
      if (markerRef.current) {
        markerRef.current.setLatLng([pin.lat, pin.lng]);
      } else {
        markerRef.current = L.circleMarker([pin.lat, pin.lng], markerStyle()).addTo(map);
      }
      map.panTo([pin.lat, pin.lng]);
    });
  }, [pin]);

  return (
    <div className="meeting-pin-map overflow-hidden border border-white/20">
      <div ref={containerRef} className="h-56 w-full bg-black" />
    </div>
  );
}

function markerStyle() {
  return {
    radius: 8,
    color: "#d8b878",
    fillColor: "#d8b878",
    fillOpacity: 1,
    weight: 2,
  };
}

function leafletFromModule(mod: typeof import("leaflet") & { default?: typeof import("leaflet") }) {
  return mod.default ?? mod;
}
