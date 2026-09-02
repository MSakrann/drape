import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function GenerationNotFound() {
  return (
    <>
      <SiteHeader signedIn={false} />
      <main className="px-6 py-20 lg:px-10">
        <Card className="mx-auto max-w-2xl p-8 text-center sm:p-12">
          <h1 className="text-4xl font-semibold uppercase tracking-tight">
            Generation not found.
          </h1>
          <Button href="/dashboard" variant="outline" className="mt-8">
            Dashboard
          </Button>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
