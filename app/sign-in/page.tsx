"use client";

import { AnnouncementBar, SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvex, useConvexAuth } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";

type Mode = "signIn" | "signUp" | "forgot" | "resetCode";

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInShell>Loading…</SignInShell>}>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
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

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(next);
    }
  }, [isAuthenticated, next, router]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const formData = new FormData(event.currentTarget);
    if (mode === "signUp") {
      const name = String(formData.get("name") ?? "").trim();
      if (name.length < 2 || name.length > 30) {
        setError("Name must be 2 to 30 characters.");
        setPending(false);
        return;
      }
      const taken = await convex.query(api.users.isNameTaken, { name });
      if (taken) {
        setError("That name is already taken.");
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
        window.location.assign(next);
      }
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : "";
      if (mode === "forgot" && message.includes("InvalidAccountId")) {
        setResetEmail(String(formData.get("email") ?? ""));
        setMode("resetCode");
        return;
      }
      setError(messageFor(mode, caught));
    } finally {
      setPending(false);
    }
  }

  return (
    <SignInShell>
      <p className="text-[11px] tracking-[0.28em] uppercase">Account</p>
      <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl font-extrabold tracking-[-0.04em]">
        {heading(mode)}
      </h1>
      <p className="mt-4 max-w-md text-sm text-white/65">{copy(mode, resetEmail)}</p>
      <form key={mode} className="mt-10 flex flex-col gap-5" onSubmit={onSubmit}>
        {mode === "signUp" ? (
          <label className="flex flex-col gap-2 text-[11px] tracking-[0.18em] uppercase">
            Name
            <input
              name="name"
              type="text"
              placeholder="Your name"
              required
              minLength={2}
              maxLength={30}
              autoComplete="name"
              className="h-11 border border-white/20 bg-transparent px-3 text-sm tracking-normal normal-case text-[#f4efe6] outline-none placeholder:text-white/30 focus:border-white"
            />
            <span className="text-[11px] tracking-normal normal-case text-white/55">
              This name is shown to other members of runs you join.
            </span>
          </label>
        ) : null}
        {mode === "signIn" || mode === "signUp" || mode === "forgot" ? (
          <Field
            label="Email"
            name="email"
            type="email"
            placeholder="you@email.com"
            autoComplete="email"
            defaultValue={resetEmail}
          />
        ) : null}
        {mode === "signIn" || mode === "signUp" ? (
          <Field
            label="Password"
            name="password"
            type="password"
            placeholder="At least 8 characters"
            autoComplete={mode === "signUp" ? "new-password" : "current-password"}
          />
        ) : null}
        {mode === "resetCode" ? (
          <>
            <Field
              label="Code"
              name="code"
              type="text"
              placeholder="8-digit code"
              autoComplete="one-time-code"
              inputMode="numeric"
            />
            <Field
              label="New password"
              name="newPassword"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
            />
          </>
        ) : null}
        {error ? <p className="text-sm text-red-300">{error}</p> : null}
        <button
          type="submit"
          disabled={pending}
          className="mt-2 inline-flex h-11 items-center justify-center rounded-full border border-white text-[11px] tracking-[0.28em] uppercase hover:bg-white hover:text-black disabled:opacity-50"
        >
          {pending ? "Working…" : submitLabel(mode)}
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
          Forgot password?
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
          ? "Need an account? Create one"
          : mode === "signUp"
            ? "Already have an account? Sign in"
            : "Back to sign in"}
      </button>
      {mode === "signUp" ? (
        <p className="mt-8 text-[11px] tracking-normal normal-case text-white/55">
          By creating an account you agree we store the details described in{" "}
          <Link href="/privacy" className="underline">
            Privacy
          </Link>
          .
        </p>
      ) : (
        <Link
          href="/privacy"
          className="mt-8 block text-[11px] tracking-[0.18em] uppercase text-white/55 underline"
        >
          Privacy
        </Link>
      )}
    </SignInShell>
  );
}

function heading(mode: Mode) {
  if (mode === "signUp") return "Create account";
  if (mode === "forgot") return "Forgot password";
  if (mode === "resetCode") return "Set a new password";
  return "Sign in";
}

function copy(mode: Mode, email: string) {
  if (mode === "forgot") {
    return "We’ll email an 8-digit code if this address has an account.";
  }
  if (mode === "resetCode") {
    return `Enter the code sent to ${email}, then choose a new password.`;
  }
  return "Same board for everyone. Sign in to create a run, join, or set your pace.";
}

function submitLabel(mode: Mode) {
  if (mode === "signUp") return "Create account";
  if (mode === "forgot") return "Send code";
  if (mode === "resetCode") return "Update password";
  return "Sign in";
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

function messageFor(mode: Mode, caught: unknown) {
  const message = rawAuthMessage(caught);
  if (message.includes("AuthProviderDiscoveryFailed")) {
    return "Sign-in is temporarily unavailable. Try again in a few minutes.";
  }
  if (mode === "forgot" && (message.includes("Could not send") || message.includes("not configured"))) {
    return "Could not send the reset email yet. Create a new account, or try again later.";
  }
  if (mode === "resetCode" && message.includes("Invalid code")) {
    return "That code is wrong or expired. Request a new one.";
  }
  if (mode === "signUp" && message.includes("already taken")) {
    return "That name is already taken.";
  }
  if (
    (mode === "signIn" || mode === "signUp") &&
    (message.includes("InvalidSecret") ||
      message.includes("InvalidAccountId") ||
      message.includes("Server Error"))
  ) {
    return "Wrong email or password. If this is your first time on the live site, create an account.";
  }
  return "Sign-in is temporarily unavailable. Try again in a few minutes.";
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
}: {
  label: string;
  name: string;
  type: string;
  placeholder: string;
  autoComplete: string;
  defaultValue?: string;
  inputMode?: "numeric";
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
          className={`h-11 w-full border border-white/20 bg-transparent px-3 text-sm tracking-normal normal-case text-[#f4efe6] outline-none placeholder:text-white/30 focus:border-white ${
            isPassword ? "pr-11" : ""
          }`}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setVisible((open) => !open)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-white/70 hover:text-white"
          >
            <PasswordEye open={visible} />
          </button>
        ) : null}
      </div>
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
