"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Dialog } from "@/shared/ui";
import { decideRequestAction } from "@/features/rentals";
import { allowedTransitions } from "@/shared/lib/status";
import type { RentalStatus } from "@/shared/types";

type Terminal = "REJECTED" | "COMPLETED";

const LABEL: Partial<Record<RentalStatus, string>> = {
  APPROVED: "Approve",
  REJECTED: "Reject",
  COMPLETED: "Close manually",
};

const CONFIRM: Record<
  Terminal,
  { title: string; description: string; body: string; verb: string }
> = {
  REJECTED: {
    title: "Reject this request?",
    description:
      "REJECTED is terminal — the request can never move back to PENDING.",
    body: "The tenant would have to submit an entirely new request for the same property. Nothing has been charged, so nothing is refunded.",
    verb: "Reject request",
  },
  COMPLETED: {
    title: "Close this tenancy manually?",
    description:
      "COMPLETED is terminal — an ACTIVE tenancy cannot be reopened afterwards.",
    body: "Auto-completion on the end date is not implemented in the API, so an admin closing the tenancy by hand is the only way it ever reaches COMPLETED. Once it does, the tenant may leave exactly one review.",
    verb: "Close tenancy",
  },
};

function isTerminal(status: RentalStatus): status is Terminal {
  return status === "REJECTED" || status === "COMPLETED";
}

export function AdminRentalActions({
  requestId,
  status,
}: {
  requestId: string;
  status: RentalStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState<Terminal | null>(null);
  const [error, setError] = useState<string | null>(null);

  const targets = allowedTransitions("ADMIN", status);
  const copy = confirming ? CONFIRM[confirming] : null;

  function apply(target: RentalStatus) {
    setError(null);
    startTransition(async () => {
      const result = await decideRequestAction(requestId, target);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setConfirming(null);
      router.refresh();
    });
  }

  if (targets.length === 0) return null;

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex justify-end gap-2">
        {targets.map((target) => (
          <Button
            key={target}
            size="sm"
            variant={
              target === "APPROVED"
                ? "solid"
                : target === "REJECTED"
                  ? "danger"
                  : "outline"
            }
            disabled={pending}
            onClick={() =>
              isTerminal(target) ? setConfirming(target) : apply(target)
            }
          >
            {LABEL[target] ?? target}
          </Button>
        ))}
      </div>

      {/*
        Two live regions, both mounted from the start so neither announces from
        a node that only appears with its message. Exactly one ever fills: the
        dialog's while it is open, the inline one otherwise.
      */}
      <p role="alert" className="text-micro text-critical">
        {confirming ? null : error}
      </p>

      <Dialog
        open={copy !== null}
        onClose={() => setConfirming(null)}
        title={copy?.title ?? ""}
        description={copy?.description}
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setConfirming(null)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              variant={confirming === "REJECTED" ? "danger" : "solid"}
              size="sm"
              disabled={pending || confirming === null}
              onClick={() => confirming && apply(confirming)}
            >
              {pending ? "Working…" : (copy?.verb ?? "Confirm")}
            </Button>
          </>
        }
      >
        <p className="max-w-prose text-meta text-ink-muted">{copy?.body}</p>
        <p role="alert" className="mt-3 text-meta text-critical">
          {confirming ? error : null}
        </p>
      </Dialog>
    </div>
  );
}
