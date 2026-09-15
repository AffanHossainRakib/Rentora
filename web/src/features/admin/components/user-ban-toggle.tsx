"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Dialog } from "@/shared/ui";
// Direct, not via the slice barrel — that barrel re-exports this component.
import { setUserActiveAction } from "../model/actions";

export function UserBanToggle({
  userId,
  userName,
  isActive,
}: {
  userId: string;
  userName: string;
  isActive: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function apply(next: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await setUserActiveAction(userId, next);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setConfirming(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        size="sm"
        variant={isActive ? "danger" : "outline"}
        disabled={pending}
        onClick={() => (isActive ? setConfirming(true) : apply(true))}
      >
        {isActive ? "Deactivate" : pending ? "Restoring…" : "Restore"}
      </Button>

      {/*
        Only one of the two live regions can ever fill — `isActive` decides
        which path this instance takes — but both are mounted up front so the
        announcement is not lost to a region that appears with its content.
      */}
      {!isActive && (
        <p role="alert" className="text-micro text-critical">
          {error}
        </p>
      )}

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={`Deactivate ${userName}?`}
        description="The API rejects every subsequent request from this account with 403, even when its session is still valid."
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirming(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => apply(false)}
              disabled={pending}
            >
              {pending ? "Deactivating…" : "Deactivate"}
            </Button>
          </>
        }
      >
        <p className="max-w-prose text-meta text-ink-muted">
          Their listings, rentals and payments stay on the platform untouched —
          they simply cannot read or change any of it. The account can be
          restored from this list at any time.
        </p>
        {isActive && (
          <p role="alert" className="mt-3 text-meta text-critical">
            {error}
          </p>
        )}
      </Dialog>
    </div>
  );
}
