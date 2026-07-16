"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CloseIcon, PlayIcon } from "@/components/icons";

/**
 * Rendered through a portal into <body>: the detail page wraps everything in an
 * animated ancestor whose transform turns it into the containing block for
 * position:fixed, which used to push the dialog far below the viewport.
 */
export function TrailerModal({ videoKey, title }: { videoKey: string; title: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  // `open` only flips on user interaction (post-hydration), so document is always available here.
  const dialog =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Tráiler de ${title}`}
            className="fixed inset-0 z-[70] flex items-center justify-center p-4 sm:p-8"
          >
            <button
              type="button"
              aria-label="Cerrar tráiler"
              onClick={() => setOpen(false)}
              className="absolute inset-0 cursor-default bg-black/85 backdrop-blur-md animate-scale-in"
            />

            <div className="relative w-full max-w-4xl animate-scale-in">
              {/* Marco con borde degradado */}
              <div className="rounded-3xl bg-gradient-nebula p-[1.5px] shadow-pop">
                <div className="overflow-hidden rounded-[calc(1.5rem-1.5px)] bg-dark-surface">
                  <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                    <div className="flex min-w-0 items-center gap-2.5 text-on-dark">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-nebula text-ink">
                        <PlayIcon className="h-3.5 w-3.5" />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{title}</p>
                        <p className="text-[11px] uppercase tracking-wider text-on-dark-soft">Tráiler oficial</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label="Cerrar"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-on-dark-soft transition-colors hover:bg-white/10 hover:text-white"
                    >
                      <CloseIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="aspect-video w-full bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`}
                      title={`Tráiler de ${title}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                </div>
              </div>

              <p className="mt-3 text-center text-xs text-white/50">
                Presiona <kbd className="rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-sans">Esc</kbd> o
                haz clic fuera para cerrar
              </p>
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur transition-all hover:scale-[1.02] hover:bg-white/20 active:scale-95"
      >
        <PlayIcon className="h-4 w-4" />
        Ver tráiler
      </button>
      {dialog}
    </>
  );
}
