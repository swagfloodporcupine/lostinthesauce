"use client";

import { useRef, useState } from "react";
import { Check, Download, FileLock2, PenLine, Type, X } from "lucide-react";
import { SignatureCanvas, type SignatureCanvasHandle } from "@/components/signature-canvas";
import { SADepositCheckout } from "@/components/sa-deposit-checkout";
import { SATaxInvoice } from "@/components/sa-tax-invoice";
import { formatZar, type VendorListing } from "@/lib/directory-types";
import type { AgreementAuditEntry, AgreementPartyRole, AgreementSigner, BookingAgreement, SignatureMethod, SimulatedDeposit } from "@/lib/agreement-types";

type BookingAgreementPanelProps = {
  listing: VendorListing;
  agreement: BookingAgreement | null;
  initialTerms: string;
  bookingAmount: number;
  eventName: string;
  eventDate: string;
  eventVenue: string;
  durationHours: number;
  onChange: (agreement: BookingAgreement) => void;
};

const partyRoles: AgreementPartyRole[] = ["planner", "vendor"];

function emptyAgreement(terms: string): BookingAgreement {
  return {
    terms,
    lockedAt: null,
    termsSha256: null,
    signers: {},
    auditTrail: [],
    simulatedDeposit: null,
    completedAt: null,
    invoiceProfile: {
      supplierLegalName: "",
      supplierAddress: "",
      supplierVatRegistered: false,
      supplierVatNumber: "",
      customerLegalName: "",
      customerAddress: "",
      customerVatNumber: "",
    },
    invoice: null,
  };
}

function validEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
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

async function hashTerms(terms: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(terms));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function typedSignaturePng(fullName: string): string | null {
  if (!fullName.trim()) return null;
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 280;
  const context = canvas.getContext("2d");
  if (!context) return null;
  context.fillStyle = "#111827";
  context.font = "italic 92px cursive";
  context.textBaseline = "middle";
  context.fillText(fullName.trim(), 48, 140, 1104);
  return canvas.toDataURL("image/png");
}

function formatRole(role: AgreementPartyRole): string {
  return role === "planner" ? "Planner" : "Vendor";
}

function signedAgreementHtml(listing: VendorListing, agreement: BookingAgreement): string {
  const signatureBlocks = partyRoles.map((role) => {
    const signer = agreement.signers[role];
    return `<section class="signature"><h2>${formatRole(role)}</h2>${signer
      ? `<img class="signature-image" src="${signer.signaturePngDataUrl}" alt="Signature of ${escapeHtml(signer.fullName)}"><p><strong>${escapeHtml(signer.fullName)}</strong></p><p>${escapeHtml(signer.email)}</p><p>${escapeHtml(formatRole(signer.role))} · Signed ${escapeHtml(signer.signedAt)}</p>`
      : "<p>Pending signature</p>"}</section>`;
  }).join("");
  const auditRows = agreement.auditTrail.map((entry) => `<tr><td>${escapeHtml(entry.timestamp)}</td><td>${escapeHtml(entry.detail)}</td><td>${escapeHtml(entry.fullName)}<br>${escapeHtml(entry.email)}<br>${escapeHtml(formatRole(entry.role))}</td></tr>`).join("");
  const safeTerms = escapeHtml(agreement.terms);
  const safeName = escapeHtml(listing.name);
  const location = escapeHtml(`${listing.area}, ${listing.locationCode}`);
  const total = listing.rateFrom === null ? "Rate to be agreed" : `${formatZar(listing.rateFrom)} starting rate`;

  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Signed booking agreement - ${safeName}</title><style>@import url("https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap");
    *{box-sizing:border-box}body{max-width:820px;margin:36px auto;padding:0 28px;color:#000000;font:15px/1.55 "DM Sans",sans-serif}header{border-bottom:2px solid #1e293b;padding-bottom:18px}h1{font-size:26px;margin:0;letter-spacing:-.035em;font-weight:600}h2{font-size:15px;margin:0 0 12px;letter-spacing:-.035em;font-weight:600}.meta{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:20px 0}.meta div,.signature{border:1px solid #e2e8f0;border-radius:8px;padding:12px}.label{display:block;color:#64748b;font-size:10px;text-transform:uppercase;letter-spacing:.08em}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:14px/1.6 "DM Sans",sans-serif}.signatures{display:grid;grid-template-columns:1fr 1fr;gap:12px}.signature-image{display:block;max-width:100%;height:72px;object-fit:contain;object-position:left center;margin:8px 0}.audit{width:100%;border-collapse:collapse;font-size:11px}.audit th,.audit td{text-align:left;vertical-align:top;padding:8px;border-bottom:1px solid #e2e8f0}.hash{overflow-wrap:anywhere;font:11px/1.5 "DM Sans",sans-serif;color:#0f172a}.notice{margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;color:#64748b;font-size:10px}@media(max-width:600px){body{margin:18px auto;padding:0 16px}.signatures,.meta{grid-template-columns:1fr}}@media print{body{margin:0 auto;padding:0 10mm}.no-print{display:none}}
    </style></head><body><header><h1>Booking agreement</h1><p>${safeName} · ${location}</p></header><section class="meta"><div><span class="label">Vendor</span><strong>${safeName}</strong></div><div><span class="label">Starting rate</span><strong>${escapeHtml(total)}</strong></div></section><section><h2>Agreed terms</h2><pre>${safeTerms}</pre></section><section><h2>Party signatures</h2><div class="signatures">${signatureBlocks}</div></section><section><h2>Audit trail</h2><table class="audit"><thead><tr><th>ISO timestamp</th><th>Record</th><th>Actor</th></tr></thead><tbody>${auditRows}</tbody></table><p class="label">Terms SHA-256 snapshot</p><p class="hash">${escapeHtml(agreement.termsSha256 ?? "Not recorded")}</p></section><p class="notice">Electronic signature record generated in the VibeShift browser preview. Signer identity is self-attested; this document is not a certificate-based or accredited advanced electronic signature. Seek South African legal advice regarding ECT Act requirements and enforceability.</p><button class="no-print" onclick="window.print()">Print / Save as PDF</button></body></html>`;
}

export function BookingAgreementPanel({ listing, agreement: savedAgreement, initialTerms, bookingAmount, eventName, eventDate, eventVenue, durationHours, onChange }: BookingAgreementPanelProps) {
  const signatureCanvasRef = useRef<SignatureCanvasHandle>(null);
  const [signatureMethod, setSignatureMethod] = useState<SignatureMethod>("drawn");
  const [signerRole, setSignerRole] = useState<AgreementPartyRole>("planner");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [hasStroke, setHasStroke] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [exportError, setExportError] = useState("");
  const agreement = savedAgreement ?? emptyAgreement(initialTerms);
  const existingSigner = agreement.signers[signerRole];
  const bothSigned = partyRoles.every((role) => Boolean(agreement.signers[role]));
  const canSign = !existingSigner && fullName.trim().length > 0 && validEmail(email) && (signatureMethod === "drawn" ? hasStroke : fullName.trim().length > 0);

  function updateAgreement(update: Partial<BookingAgreement>) {
    onChange({ ...agreement, ...update });
  }

  function selectRole(role: AgreementPartyRole) {
    setSignerRole(role);
    setFullName(agreement.signers[role]?.fullName ?? "");
    setEmail(agreement.signers[role]?.email ?? "");
    setHasStroke(false);
    signatureCanvasRef.current?.clear();
  }

  async function signAgreement() {
    if (!canSign || isSigning) return;
    setIsSigning(true);
    try {
      const signaturePngDataUrl = signatureMethod === "drawn"
        ? signatureCanvasRef.current?.exportPng()
        : typedSignaturePng(fullName);
      if (!signaturePngDataUrl) return;

      const signedAt = new Date().toISOString();
      const normalizedEmail = email.trim().toLowerCase();
      const signer: AgreementSigner = {
        fullName: fullName.trim(),
        email: normalizedEmail,
        role: signerRole,
        signedAt,
        method: signatureMethod,
        signaturePngDataUrl,
      };
      const newAuditEntries: AgreementAuditEntry[] = [];
      if (!agreement.lockedAt) {
        newAuditEntries.push({
          id: crypto.randomUUID(),
          action: "terms-locked",
          fullName: signer.fullName,
          email: signer.email,
          role: signer.role,
          timestamp: signedAt,
          detail: "Agreement terms locked after first party signature.",
        });
      }
      newAuditEntries.push({
        id: crypto.randomUUID(),
        action: "signature-recorded",
        fullName: signer.fullName,
        email: signer.email,
        role: signer.role,
        timestamp: signedAt,
        detail: `${formatRole(signer.role)} signature recorded using ${signatureMethod} sign-off.`,
      });
      const termsSha256 = agreement.termsSha256 ?? await hashTerms(agreement.terms);
      onChange({
        ...agreement,
        lockedAt: agreement.lockedAt ?? signedAt,
        termsSha256,
        signers: { ...agreement.signers, [signerRole]: signer },
        auditTrail: [...agreement.auditTrail, ...newAuditEntries],
      });
      setFullName("");
      setEmail("");
      setHasStroke(false);
      signatureCanvasRef.current?.clear();
    } finally {
      setIsSigning(false);
    }
  }

  function openPrintView() {
    setExportError("");
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      setExportError("Allow pop-ups to open the print-ready agreement.");
      return;
    }
    printWindow.opener = null;
    printWindow.document.open();
    printWindow.document.write(signedAgreementHtml(listing, agreement));
    printWindow.document.close();
    printWindow.focus();
    window.setTimeout(() => printWindow.print(), 300);
  }

  function recordDeposit(deposit: SimulatedDeposit) {
    const auditEntry: AgreementAuditEntry = {
      id: crypto.randomUUID(),
      action: "deposit-simulated",
      fullName: agreement.signers.planner?.fullName ?? "VibeShift planner",
      email: agreement.signers.planner?.email ?? "",
      role: "planner",
      timestamp: deposit.paidAt,
      detail: `Demo ${deposit.method} deposit simulated for ${formatZar(deposit.amount)}. No funds were transferred.`,
    };
    onChange({ ...agreement, simulatedDeposit: deposit, auditTrail: [...agreement.auditTrail, auditEntry] });
  }

  function downloadAgreementHtml() {
    const blob = new Blob([signedAgreementHtml(listing, agreement)], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const safeName = listing.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    anchor.href = url;
    anchor.download = `vibeshift-agreement-${safeName || listing.id}.html`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <section className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900/50">
      <div className="border-b border-neutral-800 px-4 py-3">
        <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-sm font-semibold text-white">Agreement · {listing.name}</h3>
          {agreement.lockedAt && <span className="inline-flex items-center gap-1 rounded border border-lime-300/20 bg-lime-300/5 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-lime-200"><FileLock2 size={11} aria-hidden="true" />Terms locked</span>}
        </div>
      </div>

      <div className="space-y-5 p-4">
        <label className="grid gap-1.5 text-xs font-medium text-neutral-400">Agreement terms<textarea
          className="market-filter-control min-h-28 resize-y py-2 leading-5"
          value={agreement.terms}
          disabled={Boolean(agreement.lockedAt)}
          onChange={(event) => updateAgreement({ terms: event.target.value })}
        /></label>
        {agreement.lockedAt && <p className="-mt-3 text-[10px] text-neutral-500">Locked at {agreement.lockedAt} · SHA-256: <span className="font-mono">{agreement.termsSha256?.slice(0, 16)}…</span></p>}

        <div>
          <div className="mb-2 flex items-center justify-between gap-3"><h4 className="text-sm font-semibold text-white">Party signatures</h4><span className="text-[10px] text-neutral-500">{bothSigned ? "Both parties signed" : "Awaiting both parties"}</span></div>
          <div className="grid gap-2 sm:grid-cols-2">
            {partyRoles.map((role) => {
              const signer = agreement.signers[role];
              return <article key={role} className="min-w-0 rounded-lg border border-neutral-800 bg-neutral-950/70 p-3">
                <div className="flex items-center justify-between gap-2"><p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{formatRole(role)}</p>{signer ? <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase text-lime-300"><Check size={11} aria-hidden="true" />Signed</span> : <span className="text-[9px] font-semibold uppercase text-amber-300">Pending</span>}</div>
                {signer ? <>
                  <img className="signature-stamp mt-2" src={signer.signaturePngDataUrl} alt={`${signer.method === "typed" ? "Typed signature" : "Signature"} of ${signer.fullName}`} />
                  <p className="truncate text-xs font-semibold text-neutral-200">{signer.fullName}</p>
                  <p className="mt-0.5 truncate text-[10px] text-neutral-500">{signer.email}</p>
                  <p className="mt-1 break-all text-[9px] leading-4 text-neutral-600">{signer.role} · {signer.signedAt}</p>
                </> : <p className="mt-3 text-xs text-neutral-600">Awaiting {formatRole(role).toLowerCase()} sign-off</p>}
              </article>;
            })}
          </div>
        </div>

        {!bothSigned && (
          <div className="border-t border-neutral-800 pt-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h4 className="text-sm font-semibold text-white">Sign this agreement</h4>
              <div className="flex rounded-md border border-neutral-800 p-0.5" aria-label="Signer role">
                {partyRoles.map((role) => <button key={role} type="button" disabled={Boolean(agreement.signers[role])} aria-pressed={signerRole === role} onClick={() => selectRole(role)} className={`rounded px-2.5 py-1.5 text-[10px] font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${signerRole === role ? "bg-neutral-700 text-white" : "text-neutral-500 hover:text-neutral-200"}`}>{formatRole(role)}</button>)}
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1.5 text-xs font-medium text-neutral-400">Full legal name<input className="market-filter-control" autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="As shown on your ID" /></label>
              <label className="grid gap-1.5 text-xs font-medium text-neutral-400">Email address<input className="market-filter-control" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" /></label>
            </div>
            <div className="my-3 flex items-center gap-1 rounded-lg border border-neutral-800 bg-neutral-950 p-1" role="group" aria-label="Signature method">
              <button type="button" aria-pressed={signatureMethod === "drawn"} onClick={() => setSignatureMethod("drawn")} className={`inline-flex min-h-8 flex-1 items-center justify-center gap-1.5 rounded px-2 text-xs font-semibold ${signatureMethod === "drawn" ? "bg-neutral-700 text-white" : "text-neutral-500 hover:text-neutral-200"}`}><PenLine size={13} aria-hidden="true" />Draw</button>
              <button type="button" aria-pressed={signatureMethod === "typed"} onClick={() => setSignatureMethod("typed")} className={`inline-flex min-h-8 flex-1 items-center justify-center gap-1.5 rounded px-2 text-xs font-semibold ${signatureMethod === "typed" ? "bg-neutral-700 text-white" : "text-neutral-500 hover:text-neutral-200"}`}><Type size={13} aria-hidden="true" />Type name</button>
            </div>
            {signatureMethod === "drawn" ? <SignatureCanvas ref={signatureCanvasRef} onSignatureChange={setHasStroke} /> : <div className="rounded-lg border border-dashed border-neutral-700 bg-neutral-950/70 px-4 py-5"><p className="font-serif text-2xl italic text-neutral-100">{fullName.trim() || "Your typed signature will appear here"}</p><p className="mt-2 text-[10px] text-neutral-500">Your full legal name above is recorded as the typed sign-off.</p></div>}

            <button type="button" disabled={!canSign || isSigning} onClick={signAgreement} className="mt-4 inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 text-xs font-bold text-neutral-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"><Check size={14} aria-hidden="true" />{isSigning ? "Recording signature…" : `Sign as ${formatRole(signerRole)}`}</button>
            {!canSign && <p className="mt-2 text-[10px] text-neutral-600">Enter a valid email and full legal name, then {signatureMethod === "drawn" ? "draw a signature" : "use the typed name as your signature"} to enable sign-off.</p>}
          </div>
        )}

        <SADepositCheckout amount={bookingAmount} signedByBoth={bothSigned} deposit={agreement.simulatedDeposit} onDeposit={recordDeposit} />
        {bothSigned && <SATaxInvoice
          listing={listing}
          agreement={agreement}
          bookingAmount={bookingAmount}
          serviceDescription={`${eventName.trim() || "Event services"} · ${durationHours} hours${eventDate ? ` · ${eventDate}` : ""}${eventVenue.trim() ? ` · ${eventVenue.trim()}` : ""}`}
          quantity={durationHours}
          onChange={onChange}
        />}

        <div className="rounded-lg border border-neutral-800 bg-neutral-950/70 p-3">
          <div className="mb-2 flex items-center justify-between gap-2"><h4 className="text-sm font-semibold text-white">Audit trail</h4><span className="text-[9px] text-neutral-600">ISO 8601 · self-attested</span></div>
          {agreement.auditTrail.length ? <ol className="space-y-2">
            {agreement.auditTrail.map((entry) => <li key={entry.id} className="flex gap-2 border-l border-neutral-700 pl-2.5">
              <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-cyan-300" />
              <div className="min-w-0"><p className="text-[10px] leading-4 text-neutral-300">{entry.detail}</p><p className="mt-0.5 break-all text-[9px] leading-4 text-neutral-600">{entry.fullName} · {entry.email} · {entry.role} · {entry.timestamp}</p></div>
            </li>)}
          </ol> : <p className="text-[10px] text-neutral-600">Signatures and term-lock events will be recorded here.</p>}
        </div>

        <div className="rounded-md border border-amber-300/15 bg-amber-300/[.035] p-3 text-[10px] leading-4 text-neutral-500">This preview records a self-attested electronic signature and browser-generated audit trail; it does not verify identity or provide an accredited advanced electronic signature. Obtain South African legal advice before relying on it for ECT Act compliance.</div>
        {exportError && <p role="alert" className="text-xs text-rose-300">{exportError}</p>}
        <div className="grid gap-2 sm:grid-cols-2">
          <button type="button" disabled={!bothSigned} onClick={downloadAgreementHtml} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-cyan-300 px-4 text-xs font-bold text-neutral-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"><Download size={14} aria-hidden="true" />Download signed agreement</button>
          <button type="button" disabled={!bothSigned} onClick={openPrintView} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-neutral-700 px-4 text-xs font-semibold text-neutral-200 transition hover:border-cyan-300/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-40">Print / Save as PDF</button>
        </div>
      </div>
    </section>
  );
}