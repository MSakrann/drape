import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Card } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader signedIn={false} />
      <main className="px-6 py-16 lg:px-10">
        <section className="mx-auto max-w-4xl">
          <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
            Privacy
          </h1>
          <Card className="mt-10 space-y-5 p-8 text-lg text-[var(--drape-muted)]">
            <p>Drape is a fashion photography product.</p>
            <p>AI-generated content is owned by the user.</p>
            <p>
              Contact{" "}
              <a
                href="mailto:hello@drape.example"
                className="text-[var(--drape-accent)] underline"
              >
                hello@drape.example
              </a>
              .
            </p>
          </Card>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
