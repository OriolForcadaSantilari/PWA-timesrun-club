"use client";

import { AnnouncementBar, SiteHeader } from "@/app/components/site-header";
import { SiteFooter } from "@/app/components/site-footer";
import Link from "next/link";
import { useAuthActions } from "@convex-dev/auth/react";
import { useConvexAuth } from "convex/react";
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
  return (
    <label className="flex flex-col gap-2 text-[11px] tracking-[0.18em] uppercase">
      {label}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        inputMode={inputMode}
        className="h-11 border border-white/20 bg-transparent px-3 text-sm tracking-normal normal-case text-[#f4efe6] outline-none placeholder:text-white/30 focus:border-white"
      />
    </label>
  );
}
