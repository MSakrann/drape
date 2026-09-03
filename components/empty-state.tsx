import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function EmptyState() {
  return (
    <Card className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
      <p className="text-sm font-medium text-[var(--drape-accent)]">
        Your workspace
      </p>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight">
        No generations yet
      </h2>
      <p className="mt-3 max-w-md text-[var(--drape-muted)]">
        Create your first fashion image and it will appear here.
      </p>
      <Button href="/generate" className="mt-7">
        New generation
      </Button>
    </Card>
  );
}
