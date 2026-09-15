import { logoutAction } from "@/features/auth";
import { Button } from "@/shared/ui";

export function SignOut() {
  return (
    <form action={logoutAction} className="mt-4">
      <Button type="submit" variant="outline" size="sm" className="w-full">
        Sign out
      </Button>
    </form>
  );
}
