"use client";

import { api } from "@/convex/_generated/api";
import { useConvexAuth, useMutation } from "convex/react";
import { useEffect, useId, useState, type FormEvent } from "react";
import { useT } from "./i18n-provider";

const MAX_FEEDBACK = 500;

export function FeedbackBox() {
  const { t } = useT();
  const { isAuthenticated } = useConvexAuth();
  const sendFeedback = useMutation(api.feedback.send);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [thanks, setThanks] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (!isAuthenticated) {
    return null;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const next = message.trim();
    if (!next) {
      setError(t("feedbackEmpty"));
      return;
    }
    setPending(true);
    setError("");
    try {
      await sendFeedback({
        message: next,
        path: window.location.pathname,
      });
      setThanks(true);
      setMessage("");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : t("feedbackEmpty"));
    } finally {
      setPending(false);
    }
  }

  function close() {
    setOpen(false);
    setThanks(false);
    setError("");
  }

  return (
    <div className="pointer-events-none fixed bottom-16 left-4 z-40 md:left-8">
      <div className="pointer-events-auto flex flex-col items-start gap-3">
        {open ? (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-[min(92vw,20rem)] border border-white/20 bg-black p-4 text-[#f4efe6] shadow-[0_8px_40px_rgba(0,0,0,0.45)]"
          >
            {thanks ? (
              <div className="flex flex-col gap-4">
                <p id={titleId} className="text-sm text-white/80">
                  {t("feedbackThanks")}
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="inline-flex h-9 items-center justify-center rounded-full border border-white text-[11px] tracking-[0.28em] uppercase hover:bg-white hover:text-black"
                >
                  {t("feedbackClose")}
                </button>
              </div>
            ) : (
              <form className="flex flex-col gap-3" onSubmit={(event) => void onSubmit(event)}>
                <p
                  id={titleId}
                  className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-[-0.03em]"
                >
                  {t("feedbackTitle")}
                </p>
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  maxLength={MAX_FEEDBACK}
                  rows={4}
                  placeholder={t("feedbackPlaceholder")}
                  className="resize-none border border-white/20 bg-transparent px-3 py-2 text-base text-[#f4efe6] outline-none placeholder:text-white/30 focus:border-white"
                />
                {error ? <p className="text-sm text-red-300">{error}</p> : null}
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={pending}
                    className="inline-flex h-9 flex-1 items-center justify-center rounded-full border border-white text-[11px] tracking-[0.28em] uppercase hover:bg-white hover:text-black disabled:opacity-50"
                  >
                    {pending ? t("feedbackSending") : t("feedbackSend")}
                  </button>
                  <button
                    type="button"
                    onClick={close}
                    className="text-[11px] tracking-[0.18em] uppercase text-white/55 underline"
                  >
                    {t("feedbackClose")}
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setOpen((value) => !value);
            setThanks(false);
            setError("");
          }}
          aria-expanded={open}
          className="max-w-[16rem] text-left font-[family-name:var(--font-mono)] text-[12px] tracking-[0.08em] text-white/70 hover:text-[#f4efe6]"
        >
          {t("feedbackButton")}
        </button>
      </div>
    </div>
  );
}
