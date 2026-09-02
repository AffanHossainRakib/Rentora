"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink, Dialog } from "@/shared/ui";
import { cn } from "@/shared/lib/cn";
import { deletePropertyAction } from "../model/actions";

export function PropertyRowActions({
  propertyId,
  propertyTitle,
  variant = "row",
}: {
  propertyId: string;
  propertyTitle: string;
  /** `panel` drops the edit link and fills the width — for a danger zone. */
  variant?: "row" | "panel";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panel = variant === "panel";

  function remove() {
    setError(null);
    startTransition(async () => {
      const result = await deletePropertyAction(propertyId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setOpen(false);
      if (panel) router.replace("/landlord/properties");
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2",
        panel ? "justify-start" : "justify-end",
      )}
    >
      {!panel && (
        <ButtonLink
          href={`/landlord/properties/${propertyId}`}
          variant="outline"
          size="sm"
        >
          Edit
        </ButtonLink>
      )}

      <Button
        variant="danger"
        size={panel ? "md" : "sm"}
        onClick={() => {
          setError(null);
          setOpen(true);
        }}
      >
        {panel ? "Delete listing" : "Delete"}
      </Button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Delete this listing?"
        description={`“${propertyTitle}” will be removed permanently. This cannot be undone.`}
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={pending}
              onClick={remove}
            >
              {pending ? "Deleting…" : "Delete"}
            </Button>
          </>
        }
      >
        <p className="text-meta text-ink-muted">
          Tenants browsing Rentora will no longer see this listing. A listing
          with a pending, approved or active rental cannot be deleted.
        </p>
        {error && (
          <p role="alert" className="mt-3 text-meta text-critical">
            {error}
          </p>
        )}
      </Dialog>
    </div>
  );
}
