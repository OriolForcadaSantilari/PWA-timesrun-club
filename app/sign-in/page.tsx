"use client";

import { AnnouncementBar, SiteHeader } from "@/app/components/site-header";
import { useT } from "@/app/components/i18n-provider";
import { SiteFooter } from "@/app/components/site-footer";
import type { MessageKey } from "@/lib/i18n";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvex, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";

type Mode = "signIn" | "signUp" | "forgot" | "resetCode";

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInForm />
    </Suspense>
  );
}

function SignInFallback() {
  const { t } = useT();
  return <SignInShell>{t("loading")}</SignInShell>;
}

function SignInForm() {
  const { t } = useT();
  const { signIn } = useAuthActions();
  const { isAuthenticated } = useConvexAuth();
  const convex = useConvex();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeNextPath(searchParams.get("next"));
  const [mode, setMode] = useState<Mode>("signIn");
  const [resetEmail, setResetEmail] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [welcome, setWelcome] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !welcome) {
      router.replace(next);
    }
  }, [isAuthenticated, next, router, welcome]);

  useEffect(() => {
    if (!welcome) {
      return;
    }
    const timeoutId = window.setTimeout(() => {
      window.location.assign(next);
    }, 2000);
    return () => window.clearTimeout(timeoutId);
  }, [welcome, next]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formData = new FormData(event.currentTarget);
    if (mode === "signUp" || mode === "resetCode") {
      const password = String(
        formData.get(mode === "resetCode" ? "newPassword" : "password") ?? "",
      );
      if (password.length < 8 || password.length > 20) {
        setError(t("passwordLength"));
        return;
      }
    }
    setPending(true);
    if (mode === "signUp") {
      const name = String(formData.get("name") ?? "").trim();
      if (name.length < 2 || name.length > 30) {
        setError(t("nameLength"));
        setPending(false);
        return;
      }
      const taken = await convex.query(api.users.isNameTaken, { name });
      if (taken) {
        setError(t("nameTaken"));
        setPending(false);
        return;
      }
      formData.set("name", name);
    }
    if (mode === "forgot") {
      formData.set("flow", "reset");
    } else if (mode === "resetCode") {
      formData.set("flow", "reset-verification");
      formData.set("email", resetEmail);
    } else {
      formData.set("flow", mode);
    }
    try {
      const result = await signIn("password", formData);
      if (mode === "forgot") {
        setResetEmail(String(formData.get("email") ?? ""));
        setMode("resetCode");
        return;
      }
      if (result.signingIn) {
        if (mode === "signUp") {
          setWelcome(true);
          return;
        }
        window.location.assign(next);
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      if (mode === "forgot" && message.includes("InvalidAccountId")) {
        setResetEmail(String(formData.get("email") ?? ""));
        setMode("resetCode");
        return;
      }
      setError(messageFor(mode, caught, t));
    } finally {
      setPending(false);
    }
  }

  if (welcome) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-black px-6 text-center text-[#f4efe6]">
        <p className="text-[11px] tracking-[0.28em] uppercase text-white/55">TimesRun Club</p>
        <h1
          role="status"
          className="mt-4 max-w-xl font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-[-0.04em] md:text-7xl"
        >
          {t("welcomeIn")}
          <br />
          {t("welcomePack")}
        </h1>
      </div>
    );
  }

  return (
    <SignInShell>
      <p className="text-[11px] tracking-[0.28em] uppercase">{t("account")}</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-[-0.04em]">
        {heading(mode, t)}
      </h1>
      <p className="mt-4 max-w-md text-sm text-white/65">{copy(mode, resetEmail, t)}</p>
      <form key={mode} className="mt-10 flex flex-col gap-5" onSubmit={onSubmit}>
        {mode === "signUp" ? (
          <label className="flex flex-col gap-2 text-[11px] tracking-[0.18em] uppercase">
            {t("name")}
            <input
              name="name"
              type="text"
              placeholder={t("placeholderName")}
              required
              minLength={2}
              maxLength={30}
              autoComplete="name"
              className="h-11 border border-white/20 bg-transparent px-3 text-base tracking-normal normal-case text-[#f4efe6] outline-none placeholder:text-white/30 focus:border-white"
            />
            <span className="text-[11px] tracking-normal normal-case text-white/55">
              {t("nameShownJoin")}
            </span>
          </label>
        ) : null}
        {mode === "signIn" || mode === "signUp" || mode === "forgot" ? (
          <Field
            label={t("labelEmail")}
            name="email"
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
            defaultValue={resetEmail}
            hidePasswordLabel={t("hidePassword")}
            showPasswordLabel={t("showPassword")}
          />
        ) : null}
        {mode === "signIn" || mode === "signUp" ? (
          <Field
            label={t("labelPassword")}
            name="password"
            type="password"
            placeholder={t("placeholderPassword")}
            autoComplete={mode === "signUp" ? "new-password" : "current-password"}
            hidePasswordLabel={t("hidePassword")}
            showPasswordLabel={t("showPassword")}
            hint={mode === "signUp" ? t("passwordHint") : undefined}
          />
        ) : null}
        {mode === "resetCode" ? (
          <>
            <Field
              label={t("labelCode")}
              name="code"
              type="text"
              placeholder={t("placeholderCode")}
              autoComplete="one-time-code"
              inputMode="numeric"
              hidePasswordLabel={t("hidePassword")}
              showPasswordLabel={t("showPassword")}
            />
            <Field
              label={t("labelNewPassword")}
              name="newPassword"
              type="password"
              placeholder={t("placeholderPassword")}
              autoComplete="new-password"
              hidePasswordLabel={t("hidePassword")}
              showPasswordLabel={t("showPassword")}
              hint={t("passwordHint")}
            />
          </>
        ) : null}
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 inline-flex h-11 items-center justify-center rounded-full border border-white text-[11px] tracking-[0.28em] uppercase hover:bg-white hover:text-black disabled:opacity-50"
        >
          {pending ? t("working") : submitLabel(mode, t)}
        </button>
      </form>
      {mode === "signIn" ? (
        <button
          type="button"
          className="mt-6 block text-[11px] tracking-[0.18em] uppercase text-white/70 underline"
          onClick={() => {
            setError("");
            setMode("forgot");
          }}
        >
          {t("forgotPassword")}
        </button>
      ) : null}
      <button
        type="button"
        className="mt-4 block text-[11px] tracking-[0.18em] uppercase text-white/70 underline"
        onClick={() => {
          setError("");
          if (mode === "signIn") {
            setMode("signUp");
          } else if (mode === "signUp") {
            setMode("signIn");
          } else {
            setMode("signIn");
          }
        }}
      >
        {mode === "signIn"
          ? t("needAccount")
          : mode === "signUp"
            ? t("haveAccount")
            : t("backToSignIn")}
      </button>
      {mode === "signUp" ? (
        <p className="mt-8 text-[11px] tracking-normal normal-case text-white/55">
          {t("agreePrivacyPrefix")}
          <Link href="/privacy" className="underline">{t("privacy")}</Link>{t("agreePrivacySuffix")}
        </p>
      ) : (
        <Link
          href="/privacy"
          className="mt-8 block text-[11px] tracking-[0.18em] uppercase text-white/55 underline"
        >
          {t("privacy")}
        </Link>
      )}
    </SignInShell>
  );
}

type Translate = (key: MessageKey, vars?: Record<string, string | number>) => string;

function heading(mode: Mode, t: Translate) {
  if (mode === "signUp") return t("headingSignUp");
  if (mode === "forgot") return t("headingForgot");
  if (mode === "resetCode") return t("headingReset");
  return t("headingSignIn");
}

function copy(mode: Mode, email: string, t: Translate) {
  if (mode === "forgot") {
    return t("copyForgot");
  }
  if (mode === "resetCode") {
    return t("copyReset", { email });
  }
  return t("copySignIn");
}

function submitLabel(mode: Mode, t: Translate) {
  if (mode === "signUp") return t("headingSignUp");
  if (mode === "forgot") return t("sendCode");
  if (mode === "resetCode") return t("updatePassword");
  return t("headingSignIn");
}

function safeNextPath(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("://")) {
    return "/find";
  }
  return value;
}

function rawAuthMessage(caught: unknown) {
  if (caught instanceof Error) {
    return caught.message;
  }
  return typeof caught === "string" ? caught : "";
}

function messageFor(mode: Mode, caught: unknown, t: Translate) {
  const message = rawAuthMessage(caught);
  if (message.includes("AuthProviderDiscoveryFailed")) {
    return t("authUnavailable");
  }
  if (mode === "forgot" && (message.includes("Could not send") || message.includes("not configured"))) {
    return t("resetEmailFail");
  }
  if (mode === "resetCode" && message.includes("Invalid code")) {
    return t("codeWrong");
  }
  if (mode === "signUp" && message.includes("already taken")) {
    return t("nameTaken");
  }
  if (
    (mode === "signUp" || mode === "resetCode") &&
    (message.toLowerCase().includes("password") || message.includes("TooShort") || message.includes("TooLong"))
  ) {
    return t("passwordLength");
  }
  if (
    (mode === "signIn" || mode === "signUp") &&
    (message.includes("InvalidSecret") ||
      message.includes("InvalidAccountId") ||
      message.includes("Server Error"))
  ) {
    return t("wrongEmailPassword");
  }
  return t("authUnavailable");
}

function SignInShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-svh bg-black text-[#f4efe6]">
      <AnnouncementBar />
      <SiteHeader />
      <div className="mx-auto max-w-xl px-5 py-12 md:px-8">{children}</div>
      <SiteFooter />
    </div>
  );
}

function Field({
  label,
  name,
  type,
  placeholder,
  autoComplete,
  defaultValue,
  inputMode,
  hidePasswordLabel,
  showPasswordLabel,
  hint,
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  autoComplete: string;
  defaultValue?: string;
  inputMode?: "numeric";
  hidePasswordLabel: string;
  showPasswordLabel: string;
  hint?: string;
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <label className="flex flex-col gap-2 text-[11px] tracking-[0.18em] uppercase">
      {label}
      <div className={isPassword ? "relative" : undefined}>
        <input
          name={name}
          type={isPassword ? (visible ? "text" : "password") : type}
          placeholder={placeholder}
          required
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          inputMode={inputMode}
          className={`h-11 w-full border border-white/20 bg-transparent px-3 text-base tracking-normal normal-case text-[#f4efe6] outline-none placeholder:text-white/30 focus:border-white ${
            isPassword ? "pr-11" : ""
          }`}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((open) => !open)}
            aria-label={visible ? hidePasswordLabel : showPasswordLabel}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-white/70 hover:text-white"
          >
            <PasswordEye open={visible} />
          </button>
        ) : null}
      </div>
      {hint ? (
        <span className="text-[11px] tracking-normal normal-case text-white/55">{hint}</span>
      ) : null}
    </label>
  );
}

function PasswordEye({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 3 21 21"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M10.5 6.2A10.8 10.8 0 0 1 12 6c5.2 0 9.2 3.6 10.5 6-.4.8-1.1 1.8-2.1 2.8M6.2 6.2C4.4 7.4 3.1 9 2.5 12c1.3 2.4 5.3 6 10.5 6 1.3 0 2.5-.2 3.6-.6"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        <path
          d="M9.9 9.9A3 3 0 0 0 12 15a3 3 0 0 0 3-3"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}
