"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { VendorListing } from "@/lib/directory-types";

const STORAGE_KEY = "vibeshift:crew:v1";

type CrewContextValue = {
  listings: VendorListing[];
  count: number;
  isInCrew: (listingId: string) => boolean;
  toggleListing: (listing: VendorListing) => void;
  addListing: (listing: VendorListing) => void;
  removeListing: (listingId: string) => void;
  clear: () => void;
};

const CrewContext = createContext<CrewContextValue | null>(null);

function isValidListing(value: unknown): value is VendorListing {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return typeof record.id === "string" && typeof record.name === "string";
}

function readStoredListings(): VendorListing[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidListing);
  } catch {
    return [];
  }
}

export function CrewProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<VendorListing[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setListings(readStoredListings());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
    } catch {
      // Storage may be unavailable (private mode); cart still works in memory.
    }
  }, [listings, hydrated]);

  const isInCrew = useCallback(
    (listingId: string) => listings.some((listing) => listing.id === listingId),
    [listings],
  );

  const addListing = useCallback((listing: VendorListing) => {
    setListings((current) => (current.some((item) => item.id === listing.id) ? current : [...current, listing]));
  }, []);

  const removeListing = useCallback((listingId: string) => {
    setListings((current) => current.filter((item) => item.id !== listingId));
  }, []);

  const toggleListing = useCallback(
    (listing: VendorListing) => {
      setListings((current) =>
        current.some((item) => item.id === listing.id)
          ? current.filter((item) => item.id !== listing.id)
          : [...current, listing],
      );
    },
    [],
  );

  const clear = useCallback(() => setListings([]), []);

  const value = useMemo<CrewContextValue>(
    () => ({ listings, count: listings.length, isInCrew, toggleListing, addListing, removeListing, clear }),
    [listings, isInCrew, toggleListing, addListing, removeListing, clear],
  );

  return <CrewContext.Provider value={value}>{children}</CrewContext.Provider>;
}

export function useCrew(): CrewContextValue {
  const context = useContext(CrewContext);
  if (!context) throw new Error("useCrew must be used within a CrewProvider");
  return context;
}
