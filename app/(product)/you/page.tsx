"use client";

import { AnnouncementBar, SiteHeader } from "@/app/components/site-header";
import { PaceField } from "@/app/components/pace-field";
import { RequireSignIn } from "@/app/components/require-sign-in";
import { api } from "@/convex/_generated/api";
import { formatPace, parsePace, type Gender } from "@/lib/types";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function YouPage() {
  const profile = useQuery(api.users.me);
  const saveProfile = useMutation(api.users.updateMe);
  const deleteMe = useMutation(api.users.deleteMe);
  const { signOut } = useAuthActions();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const pace = parsePace(String(data.get("pace") ?? ""));
    const gender = String(data.get("gender")) as Gender;
    if (!pace) {
      setError("Pace like 5:45 is required.");
      setSaved(false);
      return;
    }
    if (profile?.needsName && (name.length < 2 || name.length > 30)) {
      setError("Name must be 2 to 30 characters.");
      setSaved(false);
      return;
    }
    try {
      await saveProfile({
        ...(profile?.needsName ? { name } : {}),
        easyPaceMinPerKm: pace,
        gender,
      });
      setError("");
      setSaved(true);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save.");
      setSaved(false);
    }
  }

  async function onDeleteAccount() {
    if (
      !window.confirm(
        "Delete your account and data? Your joins are removed. Runs you host come off the board.",
      )
    ) {
      return;
    }
    setDeleting(true);
    setError("");
    try {
      await deleteMe();
      await signOut();
      router.replace("/sign-in");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not delete the account.");
      setDeleting(false);
    }
  }

  return (
    <RequireSignIn>
    <div className="min-h-svh bg-black text-[#f4efe6]">
      <AnnouncementBar />
      <div className="relative h-[36vh] min-h-[220px] overflow-hidden">
        <img
          src="/heroes/timesrun-hero-4.png"
          alt="A runner in the city at golden hour"
          className="absolute inset-0 h-full w-full object-cover saturate-[0.82] contrast-[1.06] sepia-[0.18]"
        />
        <div className="absolute inset-0 bg-black/40" />
        <SiteHeader overlay />
        <div className="absolute inset-x-0 bottom-8 px-5 md:px-8">
          <p className="text-[11px] tracking-[0.28em] uppercase">Stats live here later</p>
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-[-0.04em]">You</h1>
        </div>
      </div>

      {profile === undefined ? (
        <p className="px-8 py-20 text-sm text-white/60">Loading your profile…</p>
      ) : profile === null ? (
        <p className="px-8 py-20 text-sm text-white/60">Sign in to set your pace.</p>
      ) : (
        <form className="mx-auto flex max-w-xl flex-col gap-6 px-5 py-12 md:px-8" onSubmit={(event) => void onSubmit(event)}>
          {profile.needsName ? (
            <label className="flex flex-col gap-2 text-[11px] tracking-[0.18em] uppercase">
              Name
              <input
                name="name"
                required
                minLength={2}
                maxLength={30}
                className="h-11 border border-white/20 bg-transparent px-3 text-sm tracking-normal normal-case outline-none focus:border-white"
              />
              <span className="text-[11px] tracking-normal normal-case text-white/55">
                This name is shown to other members of runs you join. Add it once — it comes from
                sign-up and is not edited here later.
              </span>
            </label>
          ) : (
            <div className="flex flex-col gap-2 text-[11px] tracking-[0.18em] uppercase">
              Name
              <p className="text-sm tracking-normal normal-case">{profile.name}</p>
              <span className="text-[11px] tracking-normal normal-case text-white/55">
                This name is shown to other members of runs you join. It was set when you created
                the account.
              </span>
            </div>
          )}
          <PaceField
            label="Easy pace /km"
            name="pace"
            placeholder="5:45"
            defaultValue={formatPace(profile.easyPaceMinPerKm)}
          />
          <label className="flex flex-col gap-2 text-[11px] tracking-[0.18em] uppercase">
            Gender (self-declared)
            <select
              name="gender"
              defaultValue={profile.gender}
              className="h-11 border border-white/20 bg-black px-3 text-sm tracking-normal normal-case"
            >
              <option value="unspecified">Prefer not to say (open runs only)</option>
              <option value="woman">Woman</option>
              <option value="man">Man</option>
            </select>
            <span className="text-[11px] tracking-normal normal-case text-white/55">
              Based on the gender members choose on their profile. We do not verify it. You can change
              it every 30 days.
            </span>
          </label>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {saved ? <p className="text-sm text-white/70">Saved. Find now uses this pace and gender rule.</p> : null}
          <button
            type="submit"
            className="mt-2 inline-flex h-11 items-center justify-center rounded-full border border-white text-[11px] tracking-[0.28em] uppercase hover:bg-white hover:text-black"
          >
            Save
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={() => void onDeleteAccount()}
            className="text-left text-[11px] tracking-[0.18em] uppercase text-white/55 underline disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete my account"}
          </button>
        </form>
      )}
    </div>
    </RequireSignIn>
  );
}
