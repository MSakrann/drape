"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { MONTHLY_CREDITS, PLAN_PRICE_EGP } from "@/lib/credits";
import type { Plan } from "@/lib/types";

import "./invoice.css";

const plans = ["starter", "pro", "business", "agency"] as const;
type PaidPlan = (typeof plans)[number];

const TAX_RATE = 0.2;
const PRINT_MS = 6800;
const FIRST_FEED_DELAY_MS = 650;
const REPRINT_DELAY_MS = 520;

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 2,
  }).format(amount);
}

function Sparkle({ dark = false }: { dark?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        fill={dark ? "#111" : "#f0efed"}
        d="M8 0c.3 3.4 1.4 5.7 4 7-2.6 1.3-3.7 3.6-4 7-.3-3.4-1.4-5.7-4-7C6.6 5.7 7.7 3.4 8 0Z"
      />
    </svg>
  );
}

const BARCODE = [
  2, 1, 1, 3, 1, 2, 1, 1, 4, 1, 2, 1, 3, 1, 1, 2, 1, 4, 1, 1, 2, 3, 1, 1, 2, 1,
  3, 1, 1, 2, 4, 1, 2, 1, 1, 3, 2, 1, 1, 2,
];

export function InvoiceStage({
  receiptClassName = "",
  checkout = false,
  signedIn = false,
  currentPlan = null,
}: {
  receiptClassName?: string;
  checkout?: boolean;
  signedIn?: boolean;
  currentPlan?: Plan | null;
}) {
  const router = useRouter();
  const [plan, setPlan] = useState<PaidPlan>("pro");
  const [paperPlan, setPaperPlan] = useState<PaidPlan>("pro");
  const [printing, setPrinting] = useState(false);
  const [printed, setPrinted] = useState(false);
  const [ready, setReady] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("DRP-184292");
  const [paidAt, setPaidAt] = useState("4 Sep 2026  16:32");
  const printTimers = useRef<number[]>([]);
  const paperOut = useRef(false);
  const printGen = useRef(0);
  const paidPlan = currentPlan && currentPlan !== "trial" ? currentPlan : null;
  const receiptReady = ready && printed && !printing;

  const receipt = useMemo(() => {
    const subtotal = PLAN_PRICE_EGP[plan];
    const tax = Number((subtotal * TAX_RATE).toFixed(2));
    return {
      subtotal,
      tax,
      total: subtotal + tax,
      credits: MONTHLY_CREDITS[plan],
    };
  }, [plan]);

  const paperReceipt = useMemo(() => {
    const subtotal = PLAN_PRICE_EGP[paperPlan];
    const tax = Number((subtotal * TAX_RATE).toFixed(2));
    return {
      subtotal,
      tax,
      total: subtotal + tax,
      credits: MONTHLY_CREDITS[paperPlan],
    };
  }, [paperPlan]);

  useEffect(() => {
    return () => {
      printTimers.current.forEach((id) => window.clearTimeout(id));
    };
  }, []);

  function startPrint(next: PaidPlan) {
    setPaperPlan(next);
    setOrderId(`DRP-${Math.floor(100000 + Math.random() * 900000)}`);
    setPaidAt(
      new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
        .format(new Date())
        .replace(",", ""),
    );
    paperOut.current = true;
    setPrinted(true);
  }

  function printDurationMs() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ? 0
      : PRINT_MS;
  }

  function printPlan(next: PaidPlan) {
    printTimers.current.forEach((id) => window.clearTimeout(id));
    printTimers.current = [];
    const generation = ++printGen.current;

    setPlan(next);
    setPrinting(true);
    setReady(false);
    setError("");

    const retractFirst = paperOut.current;
    if (retractFirst) {
      paperOut.current = false;
      setPrinted(false);
    }

    const feedDelay = retractFirst ? REPRINT_DELAY_MS : FIRST_FEED_DELAY_MS;
    printTimers.current = [
      window.setTimeout(() => {
        if (generation !== printGen.current) return;
        startPrint(next);
      }, feedDelay),
      window.setTimeout(() => {
        if (generation !== printGen.current) return;
        setPrinting(false);
        setReady(true);
      }, feedDelay + printDurationMs()),
    ];
  }

  async function confirmPayment() {
    if (!receiptReady || confirming) return;

    if (!signedIn) {
      router.push("/sign-up");
      return;
    }

    setConfirming(true);
    setError("");

    try {
      const response = await fetch("/api/billing/choose-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: paperPlan }),
      });
      const result = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(result.message ?? "Could not confirm this payment.");
      }

      router.push("/dashboard");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Could not confirm this payment.",
      );
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="invoice-page-inner">
      {paidPlan ? (
        <p className="invoice-current-plan">You are on the {paidPlan} plan.</p>
      ) : null}
      <div className="invoice-plans" role="group" aria-label="Choose a plan">
        {plans.map((item) => (
          <button
            key={item}
            type="button"
            className="invoice-plan"
            data-active={plan === item && (printing || printed)}
            onClick={() => printPlan(item)}
          >
            <span className="invoice-plan-name">{item}</span>
            <span className="invoice-plan-price">
              {PLAN_PRICE_EGP[item]} EGP
            </span>
          </button>
        ))}
      </div>

      <div className="invoice-rig">
        <article className="invoice-printer">
          <div className="invoice-printer-bar">
            <div className="invoice-mark">
              <Sparkle />
            </div>
            <Link className="invoice-home" href="/">
              <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 4.2 4 11h2v8h5v-5h2v5h5v-8h2z"
                />
              </svg>
              Home
            </Link>
          </div>

          <div className="invoice-printer-body">
            <div>
              <h1 className="invoice-plan-title">
                {plan.charAt(0).toUpperCase() + plan.slice(1)} plan
              </h1>
              <p className="invoice-plan-sub">Annual subscription</p>
              {printing || printed ? (
                <p className="invoice-status" aria-live="polite">
                  {printing ? <span className="invoice-spin" /> : null}
                  {printing ? "Printing your receipt" : "Receipt printed"}
                </p>
              ) : null}
            </div>
            <div>
              <p className="invoice-total-label">Total</p>
              <p className="invoice-total-value">{formatMoney(receipt.total)}</p>
            </div>
          </div>
          <div className="invoice-slot" aria-hidden="true" />
        </article>

        <div
          className={`invoice-chute${printed ? " is-open" : ""}`}
          aria-hidden={!printed}
        >
          <div className={`invoice-paper ${receiptClassName}`}>
            <div className="invoice-paper-logo">
              <Sparkle dark />
            </div>
            <div className="invoice-rule" />
            <div className="invoice-row">
              <span>{paperPlan.toUpperCase()} PLAN</span>
              <span>{formatMoney(paperReceipt.subtotal)}</span>
            </div>
            <div className="invoice-row invoice-muted">
              <span>Annual subscription</span>
              <span>{paperReceipt.credits} credits</span>
            </div>
            <div className="invoice-row" style={{ marginTop: "0.85rem" }}>
              <span>Subtotal</span>
              <span>{formatMoney(paperReceipt.subtotal)}</span>
            </div>
            <div className="invoice-row">
              <span>Tax</span>
              <span>{formatMoney(paperReceipt.tax)}</span>
            </div>
            <div className="invoice-row invoice-row-strong">
              <span>TOTAL PAID</span>
              <span>{formatMoney(paperReceipt.total)}</span>
            </div>
            <div className="invoice-meta">
              <div>Order {orderId}</div>
              <div>Paid with Visa **** 4242</div>
              <div>{paidAt}</div>
            </div>
            <div className="invoice-barcode" aria-hidden="true">
              {BARCODE.map((width, index) => (
                <span key={`${width}-${index}`} style={{ width }} />
              ))}
            </div>
            <svg
              className="invoice-cut"
              viewBox="0 0 360 14"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path
                fill="#f4f1ea"
                d="M0 0 H360 V4 L350 14 340 4 330 14 320 4 310 14 300 4 290 14 280 4 270 14 260 4 250 14 240 4 230 14 220 4 210 14 200 4 190 14 180 4 170 14 160 4 150 14 140 4 130 14 120 4 110 14 100 4 90 14 80 4 70 14 60 4 50 14 40 4 30 14 20 4 10 14 0 4 Z"
              />
            </svg>
          </div>
        </div>

        {checkout && receiptReady ? (
          <div className="invoice-confirm-wrap">
            <button
              type="button"
              className="invoice-confirm"
              disabled={confirming}
              onClick={() => void confirmPayment()}
            >
              {confirming
                ? paidPlan
                  ? "Upgrading…"
                  : "Confirming…"
                : paidPlan
                  ? "Upgrade"
                  : "Confirm payment"}
            </button>
            {error ? (
              <p className="invoice-confirm-error" role="alert">
                {error}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
