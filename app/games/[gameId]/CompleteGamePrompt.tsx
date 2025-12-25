"use client";

import { useRef, useState } from "react";

type Props = {
  gameId: string;
  secretKey: string;
  action: (formData: FormData) => void;
};

export default function CompleteGamePrompt({ gameId, secretKey, action }: Props) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement | null>(null);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
      >
        Finish & announce winner
      </button>
      <form ref={formRef} action={action} className="hidden">
        <input type="hidden" name="gameId" value={gameId} />
        <input type="hidden" name="secretKey" value={secretKey} />
      </form>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-lg">
            <p className="text-sm font-semibold text-slate-900">
              Are all scores correct?
            </p>
            <p className="mt-2 text-sm text-slate-600">
              This will lock the game and pick the winner.
            </p>
            <div className="mt-4 flex justify-end gap-3 text-sm">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded px-3 py-2 text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => formRef.current?.requestSubmit()}
                className="rounded bg-slate-900 px-3 py-2 font-semibold text-white hover:bg-slate-800"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
