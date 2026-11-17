"use client";

import { useState } from "react";
import { Check, CreditCard, ExternalLink, LockKeyhole, ShieldCheck, WalletCards } from "lucide-react";
import { formatZar } from "@/lib/directory-types";
import type { SimulatedDeposit, SouthAfricanPaymentMethod } from "@/lib/agreement-types";

type SADepositCheckoutProps = {
  amount: number;
  signedByBoth: boolean;
  deposit: SimulatedDeposit | null;
  onDeposit: (deposit: SimulatedDeposit) => void;
};

const methods: { id: SouthAfricanPaymentMethod; name: string; detail: string; icon: typeof CreditCard }[] = [
  { id: "yoco", name: "Yoco", detail: "Card checkout", icon: CreditCard },
  { id: "ozow", name: "Ozow", detail: "Instant EFT", icon: ExternalLink },
  { id: "payfast", name: "PayFast", detail: "Instant EFT", icon: WalletCards },
];

export function SADepositCheckout({ amount, signedByBoth, deposit, onDeposit }: SADepositCheckoutProps) {
  const [method, setMethod] = useState<SouthAfricanPaymentMethod>("yoco");
  const [isProcessing, setIsProcessing] = useState(false);
  const depositAmount = Math.round(amount * 0.3);

  function simulatePayment() {
    if (!signedByBoth || !depositAmount || isProcessing || deposit) return;
    setIsProcessing(true);
    window.setTimeout(() => {
      onDeposit({
        method,
        amount: depositAmount,
        reference: `VS-DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
        paidAt: new Date().toISOString(),
        status: "simulated-paid",
      });
      setIsProcessing(false);
    }, 350);
  }

  return (
    <section className="rounded-lg border border-neutral-800 bg-neutral-900/50">
      <div className="border-b border-neutral-800 px-4 py-3">
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">Deposit payment</h3>
          <span className="inline-flex items-center gap-1 rounded-md border border-lime-300/25 bg-lime-300/5 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-lime-200"><ShieldCheck size={12} aria-hidden="true" />Escrow protection · demo</span>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3 rounded-lg bg-neutral-950/75 p-3">
          <div><p className="text-xs font-semibold text-neutral-700">30% booking deposit · ZAR</p><p className="mt-1 text-xs text-neutral-400">Based on the agreed service rate, before any VAT shown on the invoice.</p></div>
          <strong className="shrink-0 text-lg text-white">{formatZar(depositAmount)}</strong>
        </div>

        {deposit ? (
          <div className="rounded-lg border border-lime-300/20 bg-lime-300/[.05] p-3">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-lime-200"><Check size={14} aria-hidden="true" />Simulated deposit recorded</p>
            <p className="mt-1 text-[10px] leading-4 text-neutral-400">{formatZar(deposit.amount)} via {deposit.method === "yoco" ? "Yoco" : deposit.method === "ozow" ? "Ozow Instant EFT" : "PayFast Instant EFT"} · {deposit.paidAt}</p>
            <p className="mt-1 break-all font-mono text-[9px] text-neutral-500">Reference: {deposit.reference}</p>
          </div>
        ) : (
          <>
            <fieldset disabled={!signedByBoth}>
              <legend className="mb-2 text-xs font-semibold text-neutral-300">Choose a payment method</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {methods.map(({ id, name, detail, icon: Icon }) => <button key={id} type="button" aria-pressed={method === id} onClick={() => setMethod(id)} className={`min-h-[68px] rounded-lg border px-3 py-2 text-left transition ${method === id ? "border-cyan-300/50 bg-cyan-300/[.07]" : "border-neutral-800 bg-neutral-950/50 hover:border-neutral-700"}`}>
                  <span className="flex items-center justify-between gap-2"><span className="text-xs font-bold text-white">{name}</span>{method === id && <Check size={13} className="text-cyan-200" aria-hidden="true" />}</span>
                  <span className="mt-1 flex items-center gap-1 text-[10px] text-neutral-500"><Icon size={11} aria-hidden="true" />{detail}</span>
                </button>)}
              </div>
            </fieldset>
            <button type="button" disabled={!signedByBoth || !depositAmount || isProcessing} onClick={simulatePayment} className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 text-xs font-bold text-neutral-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"><LockKeyhole size={14} aria-hidden="true" />{isProcessing ? "Simulating checkout…" : `Simulate ${formatZar(depositAmount)} deposit`}</button>
            {!signedByBoth && <p className="text-[10px] text-neutral-600">Both parties must sign before deposit checkout is available.</p>}
          </>
        )}

        <p className="border-t border-neutral-800 pt-3 text-[10px] leading-4 text-neutral-600">Demo only: no card or bank details are collected, no payment provider is contacted, and no money is moved or held in escrow.</p>
      </div>
    </section>
  );
}
