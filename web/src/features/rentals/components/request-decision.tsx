"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Dialog } from "@/shared/ui";
import { allowedTransitions } from "@/shared/lib/status";
import type { RentalStatus } from "@/shared/types";
import { decideRequestAction } from "../model/actions";

export function RequestDecision({
  requestId,
  status,
}: {
  requestId: string;
  status: RentalStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const options = allowedTransitions("LANDLORD", status);
  if (options.length === 0) return null;

  function decide(next: RentalStatus) {
    setError(null);
    startTransition(async () => {
      const result = await decideRequestAction(requestId, next);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setConfirming(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <div className="flex items-center justify-end gap-2">
        {options.includes("APPROVED") && (
          <Button size="sm" disabled={pending} onClick={() => decide("APPROVED")}>
            {pending ? "Working…" : "Approve"}
          </Button>
        )}
        {options.includes("REJECTED") && (
          <Button
            size="sm"
            variant="danger"
            disabled={pending}
            onClick={() => {
              setError(null);
              setConfirming(true);
            }}
          >
            Reject
          </Button>
        )}
      </div>

      {error && !confirming && (
        <p role="alert" className="text-micro text-critical">
          {error}
        </p>
      )}

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Reject this request?"
        description="Rejection is final. The tenant cannot re-open this request and will have to submit a new one."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => setConfirming(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={pending}
              onClick={() => decide("REJECTED")}
            >
              {pending ? "Rejecting…" : "Reject request"}
            </Button>
          </>
        }
      >
        {error && (
          <p role="alert" className="text-meta text-critical">
            {error}
          </p>
        )}
      </Dialog>
    </div>
  );
}
