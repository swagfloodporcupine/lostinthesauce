/**
 * Standalone, print-ready documents for a vendor's shareable media kit.
 * Everything is generated in the browser from sample/supplier data, so no
 * database or PDF dependency is involved.
 */

export const VAT_RATE = 0.15;
export const DEPOSIT_RATE = 0.3;
export const QUOTE_VALID_DAYS = 14;

export type MediaKitVendor = {
  name: string;
  category: string;
  area: string;
  locationCode: string;
  rateFrom: number | null;
  rateTo: number | null;
  rateUnit: string;
  instagram?: string | null;
  gear?: string[];
  techRider?: { label: string; required: boolean }[];
};

export type MediaKitDocumentInput = {
  clientName: string;
  clientAddress: string;
  clientVatNumber: string;
  eventName: string;
  eventDate: string;
  venue: string;
  quantity: number;
  agreedAmount: number;
  depositPaid: number;
  vatRegistered: boolean;
  vatNumber: string;
  supplierAddress: string;
  notes: string;
};

export type DocumentTotals = {
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  depositDue: number;
  depositPaid: number;
  balanceDue: number;
};

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

export function documentTotals(input: MediaKitDocumentInput): DocumentTotals {
  const subtotal = round2(Math.max(0, input.agreedAmount));
  const vatRate = input.vatRegistered ? VAT_RATE : 0;
  const vatAmount = round2(subtotal * vatRate);
  const total = round2(subtotal + vatAmount);
  const depositDue = round2(total * DEPOSIT_RATE);
  const depositPaid = Math.min(round2(Math.max(0, input.depositPaid)), total);
  return { subtotal, vatRate, vatAmount, total, depositDue, depositPaid, balanceDue: round2(total - depositPaid) };
}

/**
 * Deterministic ZAR formatting ("R 3 500,00"). Locale-aware `Intl` output
 * differs between Node and the browser, which breaks hydration, so the format
 * is built by hand instead.
 */
export function money(amount: number): string {
  const [whole, decimals] = Math.abs(amount).toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${amount < 0 ? "-" : ""}R ${grouped},${decimals}`;
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

function province(vendor: MediaKitVendor): string {
  return vendor.locationCode === "CT" ? "Cape Town, Western Cape" : "Western Cape";
}

function locationLine(vendor: MediaKitVendor): string {
  const area = vendor.area.trim();
  const region = province(vendor);
  if (!area) return region;
  if (region.toLowerCase().startsWith(area.toLowerCase())) return region;
  return `${area}, ${region}`;
}

function serviceLabel(vendor: MediaKitVendor, input: MediaKitDocumentInput): string {
  const unit = vendor.rateUnit || "booking";
  return `${vendor.category} · ${input.quantity} ${unit}${input.quantity === 1 ? "" : "s"}`;
}

function documentShell(title: string, body: string): string {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title><style>
    *{box-sizing:border-box}
    body{max-width:820px;margin:36px auto;padding:0 28px;color:#0b1220;background:#fff;font:14px/1.55 "DM Sans","Segoe UI",Helvetica,Arial,sans-serif}
    header{display:flex;justify-content:space-between;gap:24px;border-bottom:2px solid #0b1220;padding-bottom:16px}
    h1{font-size:26px;margin:0;letter-spacing:-.02em;font-weight:700}
    h2{font-size:12px;margin:0 0 8px;text-transform:uppercase;letter-spacing:.08em;color:#475569}
    p{margin:0 0 6px}
    .eyebrow{margin:0 0 4px;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.12em;color:#0891b2}
    .brand{font-size:17px;font-weight:700;margin:0 0 4px}
    .right{text-align:right}
    .muted{color:#64748b}
    .details{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0}
    .box{border:1px solid #e2e8f0;border-radius:8px;padding:12px 14px}
    .box p{white-space:pre-line;margin:0 0 4px}
    .box p:last-child{margin-bottom:0}
    .label{display:block;color:#64748b;font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px}
    section{margin:18px 0}
    table{width:100%;border-collapse:collapse;margin:10px 0}
    th,td{text-align:left;padding:9px 8px;border-bottom:1px solid #e2e8f0;vertical-align:top}
    th:last-child,td:last-child{text-align:right}
    th{font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:#64748b}
    .totals{width:min(380px,100%);margin-left:auto}
    .totals td{border:0;padding:4px 8px}
    .totals tr.grand td{border-top:2px solid #0b1220;font-weight:700;font-size:16px;padding-top:8px}
    .notes{white-space:pre-line;border-left:3px solid #e2e8f0;padding-left:12px;color:#334155}
    .notice{margin-top:22px;padding-top:12px;border-top:1px solid #e2e8f0;color:#64748b;font-size:10px;line-height:1.5}
    .badge{display:inline-block;margin-top:8px;border:1px solid #e2e8f0;border-radius:999px;padding:3px 10px;font-size:10px;color:#475569}
    @media(max-width:640px){body{margin:18px auto;padding:0 16px}.details{grid-template-columns:1fr}header{flex-direction:column}.right{text-align:left}}
    @media print{body{margin:0 auto;padding:0 10mm}.no-print{display:none}}
  </style></head><body>${body}<button class="no-print" style="margin-top:20px;padding:10px 16px;border:0;border-radius:8px;background:#0b1220;color:#fff;font:600 12px 'DM Sans',sans-serif;cursor:pointer" onclick="window.print()">Print / Save as PDF</button></body></html>`;
}

function eventBlock(input: MediaKitDocumentInput): string {
  const rows = [
    input.eventName.trim() ? `<p><span class="label">Event</span>${escapeHtml(input.eventName.trim())}</p>` : "",
    input.eventDate ? `<p><span class="label">Date</span>${escapeHtml(input.eventDate)}</p>` : "",
    input.venue.trim() ? `<p><span class="label">Venue / area</span>${escapeHtml(input.venue.trim())}</p>` : "",
  ].filter(Boolean).join("");
  if (!rows) return "";
  return `<section class="box"><h2>Event details</h2>${rows}</section>`;
}

function referenceNumber(prefix: string): string {
  const stamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const suffix = crypto.randomUUID().slice(0, 5).toUpperCase();
  return `${prefix}-${stamp}-${suffix}`;
}

function vatLine(vendor: MediaKitVendor, input: MediaKitDocumentInput, totals: DocumentTotals): string {
  if (totals.vatRate > 0) {
    return `<tr><td>VAT (${(totals.vatRate * 100).toFixed(0)}%)</td><td>${money(totals.vatAmount)}</td></tr>`;
  }
  return `<tr><td>VAT</td><td>Not charged${input.vatRegistered ? "" : " · supplier not VAT registered"}</td></tr>`;
}

function lineItemTable(vendor: MediaKitVendor, input: MediaKitDocumentInput, totals: DocumentTotals): string {
  const unitPrice = round2(totals.subtotal / Math.max(1, input.quantity));
  return `<table><thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Amount</th></tr></thead><tbody><tr><td>${escapeHtml(serviceLabel(vendor, input))}<br><span class="muted">${escapeHtml(vendor.name)} · ${escapeHtml(vendor.area)}</span></td><td>${input.quantity}</td><td>${money(unitPrice)}</td><td>${money(totals.subtotal)}</td></tr></tbody></table>`;
}

function notesBlock(input: MediaKitDocumentInput): string {
  if (!input.notes.trim()) return "";
  return `<section><h2>Notes</h2><p class="notes">${escapeHtml(input.notes.trim())}</p></section>`;
}

export function buildQuoteHtml(vendor: MediaKitVendor, input: MediaKitDocumentInput): string {
  const totals = documentTotals(input);
  const issued = new Date();
  const validUntil = new Date(issued.getTime() + QUOTE_VALID_DAYS * 24 * 60 * 60 * 1000);
  const iso = (date: Date) => date.toISOString().slice(0, 10);
  const duration = vendor.rateFrom && vendor.rateTo && vendor.rateTo > vendor.rateFrom
    ? `Starting rate ${money(vendor.rateFrom)} · typical range up to ${money(vendor.rateTo)} per ${vendor.rateUnit || "booking"}`
    : "";

  const body = `<header>
      <div>
        <p class="eyebrow">VibeShift · Supplier quote</p>
        <h1>QUOTE</h1>
        <p class="muted">Ref ${escapeHtml(referenceNumber("VS-Q"))} · issued ${iso(issued)}</p>
        <p class="muted">Valid for ${QUOTE_VALID_DAYS} days, until ${iso(validUntil)}</p>
      </div>
      <div class="right">
        <p class="brand">${escapeHtml(vendor.name)}</p>
        <p class="muted">${escapeHtml(vendor.category)}<br>${escapeHtml(locationLine(vendor))}</p>
        ${vendor.instagram ? `<p class="muted">Instagram ${escapeHtml(vendor.instagram)}</p>` : ""}
      </div>
    </header>
    <section class="details">
      <div class="box"><h2>Prepared by</h2><p>${escapeHtml(vendor.name)}</p><p>${escapeHtml(locationLine(vendor))}</p>${duration ? `<p class="muted">${escapeHtml(duration)}</p>` : ""}</div>
      <div class="box"><h2>Prepared for</h2><p>${escapeHtml(input.clientName.trim() || "Client name to confirm")}</p>${input.clientAddress.trim() ? `<p>${escapeHtml(input.clientAddress.trim())}</p>` : ""}</div>
    </section>
    ${eventBlock(input)}
    <section>
      <h2>Quotation</h2>
      ${lineItemTable(vendor, input, totals)}
      <table class="totals"><tbody>
        <tr><td>Subtotal</td><td>${money(totals.subtotal)}</td></tr>
        ${vatLine(vendor, input, totals)}
        <tr class="grand"><td>Total</td><td>${money(totals.total)}</td></tr>
        <tr><td>Deposit to secure the date (${Math.round(DEPOSIT_RATE * 100)}%)</td><td>${money(totals.depositDue)}</td></tr>
        <tr><td>Balance due before the event</td><td>${money(round2(totals.total - totals.depositDue))}</td></tr>
      </tbody></table>
    </section>
    ${notesBlock(input)}
    <p class="notice">Quotation only — this is not a tax invoice. Rates are held for ${QUOTE_VALID_DAYS} days and remain subject to availability until the deposit is received. Draft generated from a VibeShift supplier profile${vendor.name ? ` for ${escapeHtml(vendor.name)}` : ""}; confirm final pricing, VAT treatment and logistics with the supplier before the client accepts.</p>`;

  return documentShell(`Quote · ${vendor.name}`, body);
}

export function buildTaxInvoiceHtml(vendor: MediaKitVendor, input: MediaKitDocumentInput): string {
  const totals = documentTotals(input);
  const issuedAt = new Date();
  const iso = issuedAt.toISOString().slice(0, 10);
  const supplierAddress = input.supplierAddress.trim() || locationLine(vendor);

  const body = `<header>
      <div>
        <p class="eyebrow">Supplier tax invoice</p>
        <h1>TAX INVOICE</h1>
        <p class="muted">Invoice no. ${escapeHtml(referenceNumber("VS-INV"))}</p>
        <p class="muted">Issued ${iso}${input.eventDate ? ` · service date ${escapeHtml(input.eventDate)}` : ""}</p>
      </div>
      <div class="right">
        <p class="brand">${escapeHtml(vendor.name)}</p>
        <p class="muted">${escapeHtml(vendor.category)}<br>${escapeHtml(locationLine(vendor))}</p>
      </div>
    </header>
    <section class="details">
      <div class="box">
        <h2>Supplier</h2>
        <p>${escapeHtml(vendor.name)}</p>
        <p>${escapeHtml(supplierAddress)}</p>
        ${input.vatRegistered
          ? `<p><span class="label">VAT registration no.</span>${escapeHtml(input.vatNumber.trim())}</p>`
          : `<p class="muted">Supplier indicated as not VAT registered. VAT not charged.</p>`}
      </div>
      <div class="box">
        <h2>Bill to</h2>
        <p>${escapeHtml(input.clientName.trim() || "Client name required")}</p>
        ${input.clientAddress.trim() ? `<p>${escapeHtml(input.clientAddress.trim())}</p>` : ""}
        ${input.clientVatNumber.trim() ? `<p><span class="label">Customer VAT no.</span>${escapeHtml(input.clientVatNumber.trim())}</p>` : ""}
      </div>
    </section>
    ${eventBlock(input)}
    <section>
      <h2>Supply details</h2>
      ${lineItemTable(vendor, input, totals)}
      <table class="totals"><tbody>
        <tr><td>Subtotal (excl. VAT)</td><td>${money(totals.subtotal)}</td></tr>
        ${vatLine(vendor, input, totals)}
        <tr class="grand"><td>Total consideration</td><td>${money(totals.total)}</td></tr>
        <tr><td>Deposit received</td><td>- ${money(totals.depositPaid)}</td></tr>
        <tr><td>Balance due</td><td>${money(totals.balanceDue)}</td></tr>
      </tbody></table>
    </section>
    ${notesBlock(input)}
    <p class="badge">Electronic draft · generated ${escapeHtml(issuedAt.toISOString())}</p>
    <p class="notice">Draft tax invoice generated from a VibeShift supplier profile. The supplier is responsible for confirming SARS invoice particulars, sequential invoice numbering, VAT registration details and tax treatment with their accountant before issuing this document to a client. No payment has been processed or held by VibeShift.</p>`;

  return documentShell(`Tax invoice · ${vendor.name}`, body);
}
