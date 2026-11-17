"use client";

import { useState } from "react";
import { Check, Download, FileText, Printer } from "lucide-react";
import type { BookingAgreement, InvoiceProfile, TaxInvoiceRecord } from "@/lib/agreement-types";
import { formatZar, type VendorListing } from "@/lib/directory-types";

type SATaxInvoiceProps = {
  listing: VendorListing;
  agreement: BookingAgreement;
  bookingAmount: number;
  serviceDescription: string;
  quantity: number;
  onChange: (agreement: BookingAgreement) => void;
};

const STANDARD_VAT_RATE = 0.15;

function money(amount: number): string {
  return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

function defaultProfile(listing: VendorListing): InvoiceProfile {
  return {
    supplierLegalName: listing.name,
    supplierAddress: "",
    supplierVatRegistered: false,
    supplierVatNumber: "",
    customerLegalName: "",
    customerAddress: "",
    customerVatNumber: "",
  };
}

function invoiceHtml(listing: VendorListing, invoice: TaxInvoiceRecord): string {
  const profile = invoice.profile;
  const vatLabel = invoice.vatRate > 0 ? `VAT (${(invoice.vatRate * 100).toFixed(0)}%)` : "VAT (not charged)";
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Tax invoice ${escapeHtml(invoice.invoiceNumber)}</title><style>@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap");
    *{box-sizing:border-box}body{max-width:820px;margin:36px auto;padding:0 28px;color:#000000;font:14px/1.5 "DM Sans",sans-serif}header{display:flex;justify-content:space-between;gap:20px;border-bottom:2px solid #1e293b;padding-bottom:18px}h1{font-size:27px;margin:0;letter-spacing:-.035em;font-weight:600}h2{font-size:14px;margin:0 0 10px;letter-spacing:-.035em;font-weight:600}.brand{font-weight:bold;font-size:16px}.muted{color:#64748b}.details{display:grid;grid-template-columns:1fr 1fr;gap:20px;margin:22px 0}.box{border:1px solid #e2e8f0;border-radius:7px;padding:13px}.label{display:block;color:#64748b;font-size:9px;font-weight:bold;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px}.details p{margin:0 0 8px;white-space:pre-line}.details p:last-child{margin-bottom:0}table{width:100%;border-collapse:collapse;margin:18px 0}th,td{text-align:left;padding:10px 8px;border-bottom:1px solid #e2e8f0}th:last-child,td:last-child{text-align:right}.totals{width:min(360px,100%);margin-left:auto}.totals td{border:0;padding:4px 8px}.totals tr:last-child{border-top:2px solid #1e293b;font-weight:bold;font-size:16px}.notice{margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;color:#64748b;font-size:10px}@media(max-width:600px){body{margin:18px auto;padding:0 16px}.details{grid-template-columns:1fr}header{flex-direction:column}}@media print{body{margin:0 auto;padding:0 10mm}.no-print{display:none}}
    </style></head><body><header><div><p class="label">VibeShift · Supplier invoice</p><h1>TAX INVOICE</h1><p class="muted">Invoice no. ${escapeHtml(invoice.invoiceNumber)}</p></div><div style="text-align:right"><p class="brand">${escapeHtml(profile.supplierLegalName)}</p><p class="muted">Issued ${escapeHtml(invoice.issuedAt.slice(0,10))}<br>Booking completed ${escapeHtml(invoice.completedAt.slice(0,10))}</p></div></header><section class="details"><div class="box"><h2>Supplier</h2><p>${escapeHtml(profile.supplierLegalName)}</p><p>${escapeHtml(profile.supplierAddress)}</p>${profile.supplierVatRegistered?`<p><span class="label">VAT registration no.</span>${escapeHtml(profile.supplierVatNumber)}</p>`:'<p class="muted">Supplier indicated as not VAT registered. VAT not charged.</p>'}</div><div class="box"><h2>Bill to</h2><p>${escapeHtml(profile.customerLegalName)}</p><p>${escapeHtml(profile.customerAddress)}</p>${profile.customerVatNumber?`<p><span class="label">Customer VAT no.</span>${escapeHtml(profile.customerVatNumber)}</p>`:""}</div></section><section><span class="label">Supply details</span><table><thead><tr><th>Description</th><th>Qty / hours</th><th>Unit amount</th><th>Line total</th></tr></thead><tbody><tr><td>${escapeHtml(invoice.serviceDescription)}<br><span class="muted">${escapeHtml(listing.category)} · ${escapeHtml(listing.area)}, ${escapeHtml(listing.locationCode)}</span></td><td>${invoice.quantity}</td><td>${money(invoice.unitPrice)}</td><td>${money(invoice.subtotal)}</td></tr></tbody></table><table class="totals"><tbody><tr><td>Subtotal</td><td>${money(invoice.subtotal)}</td></tr><tr><td>${vatLabel}</td><td>${money(invoice.vatAmount)}</td></tr><tr><td>Total consideration</td><td>${money(invoice.total)}</td></tr><tr><td>Deposit received</td><td>- ${money(invoice.depositPaid)}</td></tr><tr><td>Balance due</td><td>${money(invoice.balanceDue)}</td></tr></tbody></table></section><section class="box"><span class="label">Payment reference</span><strong>${escapeHtml(invoice.paymentReference)}</strong></section><p class="notice">Draft invoice preview generated by VibeShift. Supplier must verify its VAT status, tax invoice particulars, invoice numbering, values and tax treatment before issuing this document as a SARS-compliant tax invoice. This preview is not tax or legal advice.</p><button class="no-print" onclick="window.print()">Print / Save as PDF</button></body></html>`;
}

export function SATaxInvoice({ listing, agreement, bookingAmount, serviceDescription, quantity, onChange }: SATaxInvoiceProps) {
  const [exportMessage, setExportMessage] = useState("");
  const profile = agreement.invoiceProfile ?? defaultProfile(listing);
  const bothSigned = Boolean(agreement.signers.planner && agreement.signers.vendor);
  const depositPaid = agreement.simulatedDeposit?.amount ?? 0;
  const profileValid = Boolean(profile.supplierLegalName.trim() && profile.supplierAddress.trim() && profile.customerLegalName.trim() && profile.customerAddress.trim() && (!profile.supplierVatRegistered || profile.supplierVatNumber.trim()));
  const invoice = agreement.invoice;

  function updateProfile<K extends keyof InvoiceProfile>(field: K, value: InvoiceProfile[K]) {
    onChange({ ...agreement, invoiceProfile: { ...profile, [field]: value } });
  }

  function addAudit(action: "booking-completed" | "invoice-issued", at: string, detail: string) {
    const planner = agreement.signers.planner;
    return [...agreement.auditTrail, {
      id: crypto.randomUUID(),
      action,
      fullName: planner?.fullName ?? "VibeShift planner",
      email: planner?.email ?? "",
      role: "planner" as const,
      timestamp: at,
      detail,
    }];
  }

  function completeBooking() {
    if (!bothSigned || !agreement.simulatedDeposit || !profileValid || agreement.completedAt) return;
    const completedAt = new Date().toISOString();
    onChange({
      ...agreement,
      invoiceProfile: profile,
      completedAt,
      auditTrail: addAudit("booking-completed", completedAt, "Booking marked complete after signatures and simulated deposit."),
    });
  }

  function generateInvoice() {
    if (!agreement.completedAt || !agreement.simulatedDeposit || !profileValid || invoice) return;
    const issuedAt = new Date().toISOString();
    const subtotal = Math.max(0, bookingAmount);
    const vatRate = profile.supplierVatRegistered ? STANDARD_VAT_RATE : 0;
    const vatAmount = Math.round(subtotal * vatRate * 100) / 100;
    const total = Math.round((subtotal + vatAmount) * 100) / 100;
    const depositAmount = Math.min(depositPaid, total);
    const invoiceRecord: TaxInvoiceRecord = {
      invoiceNumber: `VS-${issuedAt.slice(0, 10).replaceAll("-", "")}-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      issuedAt,
      completedAt: agreement.completedAt,
      profile,
      serviceDescription,
      quantity: Math.max(1, quantity),
      unitPrice: subtotal / Math.max(1, quantity),
      subtotal,
      vatRate,
      vatAmount,
      total,
      depositPaid: depositAmount,
      balanceDue: Math.max(0, Math.round((total - depositAmount) * 100) / 100),
      paymentReference: agreement.simulatedDeposit.reference,
    };
    onChange({
      ...agreement,
      invoiceProfile: profile,
      invoice: invoiceRecord,
      auditTrail: addAudit("invoice-issued", issuedAt, `Draft tax invoice ${invoiceRecord.invoiceNumber} generated.`),
    });
  }

  function downloadInvoice() {
    if (!invoice) return;
    const blob = new Blob([invoiceHtml(listing, invoice)], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `vibeshift-invoice-${invoice.invoiceNumber.toLowerCase()}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setExportMessage("Invoice HTML downloaded. Open it in a browser to print or save as PDF.");
  }

  function printInvoice() {
    if (!invoice) return;
    setExportMessage("");
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setExportMessage("Allow pop-ups to open the print-ready invoice.");
      return;
    }
    printWindow.opener = null;
    printWindow.document.open();
    printWindow.document.write(invoiceHtml(listing, invoice));
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 300);
  }

  return (
    <section className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/50">
      <div className="border-b border-neutral-800 px-4 py-3"><h3 className="text-sm font-semibold text-white">Tax invoice preview</h3></div>
      <div className="space-y-4 p-4">
        {invoice ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-lime-300/20 bg-lime-300/[.04] p-3"><p className="inline-flex items-center gap-1.5 text-xs font-semibold text-lime-200"><Check size={14} aria-hidden="true" />Draft invoice generated</p><p className="mt-1 break-all font-mono text-[10px] text-neutral-300">{invoice.invoiceNumber}</p><p className="mt-1 text-[10px] text-neutral-500">Issued {invoice.issuedAt} · {invoice.vatRate ? "VAT at 15%" : "Supplier indicated as not VAT registered"}</p></div>
            <div className="rounded-lg border border-neutral-800 bg-white p-4 text-neutral-900">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 pb-3"><div><p className="text-[9px] font-bold uppercase tracking-wider text-teal-700">VibeShift · supplier invoice</p><h4 className="mt-1 text-lg font-bold">TAX INVOICE</h4></div><div className="text-right text-[10px]"><strong>{profile.supplierLegalName}</strong><p>Invoice no. {invoice.invoiceNumber}</p><p>Issued {invoice.issuedAt.slice(0, 10)}</p></div></div>
              <div className="mt-3 grid gap-2 text-[10px] sm:grid-cols-2"><div><strong>Supplier</strong><p className="whitespace-pre-line">{profile.supplierLegalName}<br />{profile.supplierAddress}{profile.supplierVatRegistered ? `\nVAT no. ${profile.supplierVatNumber}` : "\nNot VAT registered"}</p></div><div><strong>Bill to</strong><p className="whitespace-pre-line">{profile.customerLegalName}<br />{profile.customerAddress}{profile.customerVatNumber ? `\nVAT no. ${profile.customerVatNumber}` : ""}</p></div></div>
              <div className="mt-3 overflow-x-auto"><table className="w-full min-w-[400px] border-collapse text-left text-[10px]"><thead><tr className="border-b border-neutral-200"><th className="py-2">Description</th><th className="py-2">Qty</th><th className="py-2 text-right">Amount</th></tr></thead><tbody><tr className="border-b border-neutral-200"><td className="py-2">{invoice.serviceDescription}<span className="block text-neutral-500">{listing.category} · {listing.area}, {listing.locationCode}</span></td><td className="py-2">{invoice.quantity}</td><td className="py-2 text-right">{money(invoice.subtotal)}</td></tr></tbody></table></div>
              <div className="ml-auto mt-3 max-w-xs space-y-1 text-right text-[10px]"><p>Subtotal <strong>{money(invoice.subtotal)}</strong></p><p>{invoice.vatRate ? "VAT (15%)" : "VAT (not charged)"} <strong>{money(invoice.vatAmount)}</strong></p><p className="border-t border-neutral-300 pt-1 text-xs">Total <strong>{money(invoice.total)}</strong></p><p>Deposit received <strong>- {money(invoice.depositPaid)}</strong></p><p>Balance due <strong>{money(invoice.balanceDue)}</strong></p></div>
              <p className="mt-3 border-t border-neutral-200 pt-2 text-[8px] leading-3 text-neutral-500">Draft preview only. Supplier is responsible for confirming SARS invoice particulars, numbering and VAT treatment before issuing.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2"><button type="button" onClick={downloadInvoice} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-3 text-xs font-bold text-neutral-950 hover:bg-cyan-200"><Download size={13} aria-hidden="true" />Download invoice HTML</button><button type="button" onClick={printInvoice} className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-neutral-700 px-3 text-xs font-semibold text-neutral-200 hover:border-neutral-500"><Printer size={13} aria-hidden="true" />Print / Save as PDF</button></div>
            {exportMessage && <p role="status" className="text-[10px] text-neutral-400">{exportMessage}</p>}
          </div>
        ) : (
          <>
            <div className="rounded-lg border border-neutral-800 bg-neutral-950/60 p-3"><h4 className="text-sm font-semibold text-white">Invoice parties</h4><div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-[10px] font-medium text-neutral-400">Supplier legal / registered name<input className="market-filter-control" disabled={Boolean(agreement.completedAt)} value={profile.supplierLegalName} onChange={(event) => updateProfile("supplierLegalName", event.target.value)} placeholder="Legal entity name" /></label>
              <label className="grid gap-1 text-[10px] font-medium text-neutral-400">Supplier address<input className="market-filter-control" disabled={Boolean(agreement.completedAt)} value={profile.supplierAddress} onChange={(event) => updateProfile("supplierAddress", event.target.value)} placeholder="Street, suburb, city, postal code" /></label>
              <label className="grid gap-1 text-[10px] font-medium text-neutral-400">Customer / bill-to name<input className="market-filter-control" disabled={Boolean(agreement.completedAt)} value={profile.customerLegalName} onChange={(event) => updateProfile("customerLegalName", event.target.value)} placeholder="Person or business name" /></label>
              <label className="grid gap-1 text-[10px] font-medium text-neutral-400">Customer address<input className="market-filter-control" disabled={Boolean(agreement.completedAt)} value={profile.customerAddress} onChange={(event) => updateProfile("customerAddress", event.target.value)} placeholder="Street, suburb, city, postal code" /></label>
              <label className="flex items-center gap-2 text-[10px] font-medium text-neutral-300 sm:col-span-2"><input type="checkbox" disabled={Boolean(agreement.completedAt)} checked={profile.supplierVatRegistered} onChange={(event) => updateProfile("supplierVatRegistered", event.target.checked)} className="size-4 accent-cyan-300" />Supplier is VAT registered; calculate standard 15% VAT on the agreed amount.</label>
              {profile.supplierVatRegistered && <label className="grid gap-1 text-[10px] font-medium text-neutral-400">Supplier VAT registration number<input className="market-filter-control" disabled={Boolean(agreement.completedAt)} value={profile.supplierVatNumber} onChange={(event) => updateProfile("supplierVatNumber", event.target.value)} placeholder="VAT registration number" /></label>}
              <label className="grid gap-1 text-[10px] font-medium text-neutral-400">Customer VAT number <span className="text-neutral-600">(optional)</span><input className="market-filter-control" disabled={Boolean(agreement.completedAt)} value={profile.customerVatNumber} onChange={(event) => updateProfile("customerVatNumber", event.target.value)} placeholder="If applicable" /></label>
            </div></div>

            {agreement.completedAt ? <div className="space-y-3 rounded-lg border border-neutral-800 bg-neutral-950/60 p-3"><p className="inline-flex items-center gap-1.5 text-xs font-semibold text-lime-200"><Check size={13} aria-hidden="true" />Booking completed · {agreement.completedAt}</p><p className="text-[10px] text-neutral-500">Finalization is recorded in this browser preview. Generate the invoice snapshot when party details are ready.</p><button type="button" disabled={!profileValid || !agreement.simulatedDeposit} onClick={generateInvoice} className="inline-flex min-h-9 items-center gap-2 rounded-lg bg-cyan-300 px-3 text-xs font-bold text-neutral-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"><FileText size={13} aria-hidden="true" />Generate tax invoice preview</button></div> : <div className="space-y-2"><button type="button" disabled={!agreement.signers.planner || !agreement.signers.vendor || !agreement.simulatedDeposit || !profileValid} onClick={completeBooking} className="inline-flex min-h-9 w-full items-center justify-center gap-2 rounded-lg border border-neutral-700 px-3 text-xs font-semibold text-neutral-200 hover:border-lime-300/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"><Check size={13} aria-hidden="true" />Mark booking completed</button><p className="text-[9px] leading-4 text-neutral-600">Requires both signatures, a simulated deposit, supplier and customer names/addresses, and a VAT number if the supplier is VAT registered.</p></div>}
            <p className="text-[9px] leading-4 text-amber-200/60">Draft invoice preview only. Verify supplier VAT status, SARS particulars, sequential numbering and tax treatment with the supplier/accountant before issuing.</p>
          </>
        )}
      </div>
    </section>
  );
}
