export type AgreementPartyRole = "planner" | "vendor";
export type SignatureMethod = "drawn" | "typed";

export type AgreementSigner = {
  fullName: string;
  email: string;
  role: AgreementPartyRole;
  signedAt: string;
  method: SignatureMethod;
  signaturePngDataUrl: string;
};

export type AgreementAuditEntry = {
  id: string;
  action: "terms-locked" | "signature-recorded" | "deposit-simulated" | "booking-completed" | "invoice-issued";
  fullName: string;
  email: string;
  role: AgreementPartyRole;
  timestamp: string;
  detail: string;
};

export type SouthAfricanPaymentMethod = "yoco" | "ozow" | "payfast";

export type SimulatedDeposit = {
  method: SouthAfricanPaymentMethod;
  amount: number;
  reference: string;
  paidAt: string;
  status: "simulated-paid";
};

export type InvoiceProfile = {
  supplierLegalName: string;
  supplierAddress: string;
  supplierVatRegistered: boolean;
  supplierVatNumber: string;
  customerLegalName: string;
  customerAddress: string;
  customerVatNumber: string;
};

export type TaxInvoiceRecord = {
  invoiceNumber: string;
  issuedAt: string;
  completedAt: string;
  profile: InvoiceProfile;
  serviceDescription: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  depositPaid: number;
  balanceDue: number;
  paymentReference: string;
};

export type BookingAgreement = {
  terms: string;
  lockedAt: string | null;
  termsSha256: string | null;
  signers: Partial<Record<AgreementPartyRole, AgreementSigner>>;
  auditTrail: AgreementAuditEntry[];
  simulatedDeposit: SimulatedDeposit | null;
  completedAt: string | null;
  invoiceProfile: InvoiceProfile;
  invoice: TaxInvoiceRecord | null;
};