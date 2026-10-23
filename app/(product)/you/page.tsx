"use client";

import { AnnouncementBar, SiteHeader } from "@/app/components/site-header";
import { useT } from "@/app/components/i18n-provider";
import { PaceField } from "@/app/components/pace-field";
import { RequireSignIn } from "@/app/components/require-sign-in";
import { api } from "@/convex/_generated/api";
import { formatDayMonthYear, formatPace, GENDER_COOLDOWN_MS, parsePace, type Gender } from "@/lib/types";
import { useAuthActions } from "@convex-dev/auth/react";
import { ConvexError } from "convex/values";
import { useMutation, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function YouPage() {
  return (
    <RequireSignIn>
      <YouProfile />
    </RequireSignIn>
  );
}

function messageFromSaveError(caught: unknown, t: ReturnType<typeof useT>["t"]) {
  const data =
    caught instanceof ConvexError
      ? caught.data
      : caught && typeof caught === "object" && "data" in caught
        ? (caught as { data: unknown }).data
        : undefined;
  if (data && typeof data === "object" && data !== null && "code" in data) {
    const payload = data as { code?: string; nextAllowed?: number };
    if (payload.code === "GENDER_COOLDOWN" && typeof payload.nextAllowed === "number") {
      return t("genderCooldown", { date: formatDayMonthYear(payload.nextAllowed) });
    }
  }
  return t("couldNotSave");
}

function YouProfile() {
  const { t } = useT();
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
      setError(t("paceRequired"));
      setSaved(false);
      return;
    }
    if (profile?.needsName && (name.length < 2 || name.length > 30)) {
      setError(t("nameLength"));
      setSaved(false);
      return;
    }
    if (profile && gender !== profile.gender && profile.genderChangedAt !== undefined) {
      const nextAllowed = profile.genderChangedAt + GENDER_COOLDOWN_MS;
      if (Date.now() < nextAllowed) {
        setError(t("genderCooldown", { date: formatDayMonthYear(nextAllowed) }));
        setSaved(false);
        return;
      }
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
      setError(messageFromSaveError(caught, t));
      setSaved(false);
    }
  }

  async function onDeleteAccount() {
    if (
      !window.confirm(
        t("deleteConfirm"),
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
      setError(caught instanceof Error ? caught.message : t("couldNotDelete"));
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-svh bg-black text-[#f4efe6]">
      <AnnouncementBar />
      <div className="relative h-[36vh] min-h-[220px] overflow-hidden">
        <img
          src="/heroes/timesrun-hero-4.png"
          alt={t("altCity")}
          className="absolute inset-0 h-full w-full object-cover saturate-[0.82] contrast-[1.06] sepia-[0.18]"
        />
        <div className="absolute inset-0 bg-black/40" />
        <SiteHeader overlay />
        <div className="absolute inset-x-0 bottom-8 px-5 md:px-8">
          <p className="text-[11px] tracking-[0.28em] uppercase">{t("statsLater")}</p>
          <h1 className="font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-[-0.04em]">{t("youTitle")}</h1>
        </div>
      </div>

      {profile === undefined ? (
        <p className="px-8 py-20 text-sm text-white/60">{t("loadingProfile")}</p>
      ) : profile === null ? (
        <p className="px-8 py-20 text-sm text-white/60">{t("signInToSetPace")}</p>
      ) : (
        <form className="mx-auto flex max-w-xl flex-col gap-6 px-5 py-12 md:px-8" onSubmit={(event) => void onSubmit(event)}>
          {profile.needsName ? (
            <label className="flex flex-col gap-2 text-[11px] tracking-[0.18em] uppercase">
              {t("name")}
              <input
                name="name"
                required
                minLength={2}
                maxLength={30}
                className="h-11 border border-white/20 bg-transparent px-3 text-base tracking-normal normal-case outline-none focus:border-white"
              />
              <span className="text-[11px] tracking-normal normal-case text-white/55">
                {t("nameShownOnce")}
              </span>
            </label>
          ) : (
            <div className="flex flex-col gap-2 text-[11px] tracking-[0.18em] uppercase">
              {t("name")}
              <p className="text-sm tracking-normal normal-case">{profile.name}</p>
              <span className="text-[11px] tracking-normal normal-case text-white/55">
                {t("nameFromSignup")}
              </span>
            </div>
          )}
          <PaceField
            label={t("easyPaceKm")}
            name="pace"
            placeholder="5:45"
            defaultValue={formatPace(profile.easyPaceMinPerKm)}
          />
          <label className="flex flex-col gap-2 text-[11px] tracking-[0.18em] uppercase">
            {t("genderSelfDeclared")}
            <select
              name="gender"
              defaultValue={profile.gender}
              className="h-11 border border-white/20 bg-black px-3 text-base tracking-normal normal-case"
            >
              <option value="unspecified">{t("genderUnspecified")}</option>
              <option value="woman">{t("genderWoman")}</option>
              <option value="man">{t("genderMan")}</option>
            </select>
            <span className="text-[11px] tracking-normal normal-case text-white/55">
              {t("genderHint")}
            </span>
          </label>
          {error ? <p className="text-sm text-red-300">{error}</p> : null}
          {saved ? <p className="text-sm text-white/70">{t("savedProfile")}</p> : null}
          <button
            type="submit"
            className="mt-2 inline-flex h-11 items-center justify-center rounded-full border border-white text-[11px] tracking-[0.28em] uppercase hover:bg-white hover:text-black"
          >
            {t("save")}
          </button>
          <button
            type="button"
            disabled={deleting}
            onClick={() => void onDeleteAccount()}
            className="text-left text-[11px] tracking-[0.18em] uppercase text-white/55 underline disabled:opacity-50"
          >
            {deleting ? t("deleting") : t("deleteAccount")}
          </button>
        </form>
      )}
    </div>
  );
}
