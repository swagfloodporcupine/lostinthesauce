"use client";

import { useRef, useState } from "react";
import { Check, Copy, Download, ExternalLink, FileText, Receipt } from "lucide-react";
import {
  DEPOSIT_RATE,
  QUOTE_VALID_DAYS,
  buildQuoteHtml,
  buildTaxInvoiceHtml,
  documentTotals,
  money,
  type MediaKitDocumentInput,
  type MediaKitVendor,
} from "@/lib/vendor-documents";

type VendorMediaKitProps = {
  vendor: MediaKitVendor;
};

type DocumentKind = "quote" | "invoice";

const FIELD = "market-filter-control";
const LABEL = "grid gap-1 text-[10px] font-medium text-neutral-400";
const ACTION = "inline-flex min-h-9 items-center justify-center gap-2 rounded-md border border-neutral-700 px-3 text-xs font-semibold text-neutral-200 transition hover:border-cyan-300/50 hover:text-cyan-100";
const PRIMARY = "inline-flex min-h-9 items-center justify-center gap-2 rounded-md bg-cyan-300 px-3 text-xs font-bold text-neutral-950 transition hover:bg-cyan-200";

function slugify(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "vendor";
}

export function VendorMediaKit({ vendor }: VendorMediaKitProps) {
  const [input, setInput] = useState<MediaKitDocumentInput>(() => ({
    clientName: "",
    clientAddress: "",
    clientVatNumber: "",
    eventName: "",
    eventDate: "",
    venue: "",
    quantity: 1,
    agreedAmount: vendor.rateFrom ?? 0,
    depositPaid: 0,
    vatRegistered: false,
    vatNumber: "",
    supplierAddress: `${vendor.area}, ${vendor.locationCode === "CT" ? "Cape Town" : "Western Cape"}`,
    notes: "",
  }));
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ html: string; kind: DocumentKind } | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const totals = documentTotals(input);

  function update<K extends keyof MediaKitDocumentInput>(key: K, value: MediaKitDocumentInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  async function copyProfileLink() {
    setMessage("");
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setMessage("Profile link copied. Paste it in your Instagram bio, proposal or WhatsApp chat.");
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setMessage("Copy was blocked by the browser — use the address bar to copy this profile link.");
    }
  }

  function validate(kind: DocumentKind): string | null {
    if (!Number.isFinite(input.agreedAmount) || input.agreedAmount <= 0) {
      return "Add the agreed amount before generating a document.";
    }
    if (input.vatRegistered && !input.vatNumber.trim()) {
      return "Add your VAT registration number, or untick VAT registered.";
    }
    if (kind === "invoice" && !input.clientName.trim()) {
      return "Add the client name — a tax invoice needs a bill-to party.";
    }
    return null;
  }

  function build(kind: DocumentKind): string | null {
    const problem = validate(kind);
    if (problem) {
      setMessage(problem);
      return null;
    }
    setMessage("");
    return kind === "quote" ? buildQuoteHtml(vendor, input) : buildTaxInvoiceHtml(vendor, input);
  }

  function preview(kind: DocumentKind) {
    const html = build(kind);
    if (!html) return;
    setPreviewDoc({ html, kind });
    dialogRef.current?.showModal();
  }

  function closePreview() {
    dialogRef.current?.close();
    setPreviewDoc(null);
  }

  function download(kind: DocumentKind) {
    const html = build(kind);
    if (!html) return;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `vibeshift-${kind === "quote" ? "quote" : "tax-invoice"}-${slugify(vendor.name)}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage("Downloaded. Open the file in a browser to print or save it as a PDF.");
  }

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Media kit</h3>
          <p className="mt-1 text-xs leading-5 text-neutral-400">
            Share this profile, or send a client a quote or tax invoice.
          </p>
        </div>
        <FileText size={16} className="mt-0.5 shrink-0 text-cyan-300" aria-hidden="true" />
      </div>

      <button type="button" onClick={copyProfileLink} className={`${PRIMARY} mt-4 w-full`}>
        {copied ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
        {copied ? "Link copied" : "Copy profile link"}
      </button>

      <details className="group mt-3 rounded-lg border border-neutral-800 bg-neutral-950/50">
        <summary className="cursor-pointer list-none px-3 py-2.5 text-xs font-semibold text-neutral-200 marker:hidden">
          Quote &amp; invoice details
          <span className="ml-1 font-normal text-neutral-500">({QUOTE_VALID_DAYS}-day quotes, 15% VAT, {Math.round(DEPOSIT_RATE * 100)}% deposit)</span>
        </summary>
        <div className="grid gap-2.5 border-t border-neutral-800 p-3 sm:grid-cols-2">
          <label className={LABEL}>
            Client name
            <input className={FIELD} value={input.clientName} onChange={(event) => update("clientName", event.target.value)} placeholder="e.g. Harbour Lights Events" />
          </label>
          <label className={LABEL}>
            Client address
            <input className={FIELD} value={input.clientAddress} onChange={(event) => update("clientAddress", event.target.value)} placeholder="Street, suburb, city" />
          </label>
          <label className={LABEL}>
            Event name
            <input className={FIELD} value={input.eventName} onChange={(event) => update("eventName", event.target.value)} placeholder="e.g. Summer launch" />
          </label>
          <label className={LABEL}>
            Event date
            <input className={FIELD} type="date" value={input.eventDate} onChange={(event) => update("eventDate", event.target.value)} />
          </label>
          <label className={`${LABEL} sm:col-span-2`}>
            Venue / area
            <input className={FIELD} value={input.venue} onChange={(event) => update("venue", event.target.value)} placeholder="e.g. The Glasshouse, Woodstock" />
          </label>
          <label className={LABEL}>
            Quantity ({vendor.rateUnit || "booking"})
            <input className={FIELD} type="number" min="1" step="1" value={input.quantity} onChange={(event) => update("quantity", Math.max(1, Number(event.target.value) || 1))} />
          </label>
          <label className={LABEL}>
            Agreed amount (excl. VAT)
            <input className={FIELD} type="number" min="0" step="50" value={input.agreedAmount} onChange={(event) => update("agreedAmount", Math.max(0, Number(event.target.value) || 0))} />
          </label>
          <label className={LABEL}>
            Deposit already received
            <input className={FIELD} type="number" min="0" step="50" value={input.depositPaid} onChange={(event) => update("depositPaid", Math.max(0, Number(event.target.value) || 0))} />
          </label>
          <label className={LABEL}>
            Supplier address (invoice)
            <input className={FIELD} value={input.supplierAddress} onChange={(event) => update("supplierAddress", event.target.value)} placeholder="Street, suburb, city, postal code" />
          </label>
          <label className="flex items-start gap-2 text-[10px] leading-4 text-neutral-400 sm:col-span-2">
            <input
              type="checkbox"
              checked={input.vatRegistered}
              onChange={(event) => update("vatRegistered", event.target.checked)}
              className="mt-0.5 size-4 accent-cyan-300"
            />
            This supplier is VAT registered — add 15% VAT and show a VAT number.
          </label>
          {input.vatRegistered && (
            <>
              <label className={LABEL}>
                VAT registration number
                <input className={FIELD} value={input.vatNumber} onChange={(event) => update("vatNumber", event.target.value)} placeholder="e.g. 4123456789" />
              </label>
              <label className={LABEL}>
                Client VAT number (optional)
                <input className={FIELD} value={input.clientVatNumber} onChange={(event) => update("clientVatNumber", event.target.value)} placeholder="If the client is VAT registered" />
              </label>
            </>
          )}
          <label className={`${LABEL} sm:col-span-2`}>
            Notes on the document
            <textarea className={`${FIELD} min-h-16 resize-y py-2`} value={input.notes} onChange={(event) => update("notes", event.target.value)} placeholder="Set times, load-in, travel, what's included…" />
          </label>
        </div>
      </details>

      <div className="mt-3 grid gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs font-semibold text-neutral-400">Quote</span>
          <span className="text-[10px] text-neutral-500">
            {money(totals.total)} total · {money(totals.depositDue)} deposit
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => preview("quote")} className={ACTION}>
            <ExternalLink size={13} aria-hidden="true" />Preview
          </button>
          <button type="button" onClick={() => download("quote")} className={ACTION}>
            <Download size={13} aria-hidden="true" />Download
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-800 pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
            <Receipt size={13} className="text-cyan-300" aria-hidden="true" />
            Tax invoice
          </span>
          <span className="text-[10px] text-neutral-500">
            {input.vatRegistered ? `${money(totals.vatAmount)} VAT` : "No VAT charged"}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={() => preview("invoice")} className={ACTION}>
            <ExternalLink size={13} aria-hidden="true" />Preview
          </button>
          <button type="button" onClick={() => download("invoice")} className={ACTION}>
            <Download size={13} aria-hidden="true" />Download
          </button>
        </div>
      </div>

      {message && (
        <p role="status" className="mt-3 rounded-md border border-neutral-800 bg-neutral-950/60 px-3 py-2 text-[10px] leading-4 text-neutral-400">
          {message}
        </p>
      )}

      <p className="mt-3 text-[9px] leading-4 text-neutral-600">
        Documents are drafts generated in your browser from this profile. Confirm rates, VAT details and availability before sending.
      </p>

      <dialog
        ref={dialogRef}
        aria-labelledby="media-kit-preview-title"
        onClose={() => setPreviewDoc(null)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closePreview();
        }}
        className="w-[min(920px,calc(100vw-2rem))] max-w-none rounded-xl border border-neutral-800 bg-white p-0 backdrop:bg-neutral-950/60"
      >
        <div className="flex items-start justify-between gap-3 border-b border-neutral-800 px-4 py-3">
          <div>
            <h3 id="media-kit-preview-title" className="text-sm font-semibold text-white">
              {previewDoc?.kind === "invoice" ? "Tax invoice preview" : "Quote preview"}
            </h3>
            <p className="mt-0.5 text-[10px] text-neutral-500">
              Draft document — check rates, VAT details and availability before sending.
            </p>
          </div>
          <button
            type="button"
            onClick={closePreview}
            className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-md border border-neutral-700 px-2.5 text-[11px] font-semibold text-neutral-200 transition hover:border-neutral-500"
          >
            Close
          </button>
        </div>
        {previewDoc && (
          <iframe
            title={`${previewDoc.kind === "invoice" ? "Tax invoice" : "Quote"} preview`}
            srcDoc={previewDoc.html}
            className="h-[68dvh] w-full bg-white"
          />
        )}
        <div className="flex flex-wrap justify-end gap-2 border-t border-neutral-800 px-4 py-3">
          <button
            type="button"
            onClick={() => previewDoc && download(previewDoc.kind)}
            className="inline-flex min-h-9 items-center gap-2 rounded-md bg-cyan-300 px-3 text-xs font-bold text-neutral-950 transition hover:bg-cyan-200"
          >
            <Download size={13} aria-hidden="true" />
            Download HTML
          </button>
        </div>
      </dialog>
    </section>
  );
}
