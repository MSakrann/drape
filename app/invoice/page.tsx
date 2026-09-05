import { IBM_Plex_Mono } from "next/font/google";

import { InvoiceStage } from "./invoice-stage";

const receiptMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata = {
  title: "Invoice — Drape",
};

export default function InvoicePage() {
  return (
    <main className="invoice-page">
      <InvoiceStage receiptClassName={receiptMono.className} />
    </main>
  );
}
