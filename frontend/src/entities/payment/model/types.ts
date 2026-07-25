export interface Payment {
  [key: string]: unknown;
  invoiceId?: number;
  invoiceCode?: string;
  amount?: number;
  checkoutUrl?: string;
  paymentUrl: string;
  paymentLink: string;
  qrCode: string;
  qrCodeUrl?: string;
  accountName?: string;
  accountHolder?: string;
  beneficiaryName?: string;
  receiverName?: string;
  transferContent?: string;
  description?: string;
}

export interface CreatePaymentResponse {
  [key: string]: unknown;
  invoiceId?: number;
  invoiceCode?: string;
  amount?: number;
  checkoutUrl?: string;
  paymentUrl?: string;
  paymentLink?: string;
  qrCode?: string;
  qrCodeUrl?: string;
  accountName?: string;
  accountHolder?: string;
  beneficiaryName?: string;
  receiverName?: string;
  transferContent?: string;
  description?: string;
}

export interface PaymentSyncResult {
  paid: boolean;
  terminal: boolean;
  message?: string;
  courseId?: number;
}

export type PaymentResultState =
  | "VERIFYING"
  | "PENDING"
  | "PENDING_TIMEOUT"
  | "SUCCESS"
  | "FAILED"
  | "ERROR";

export interface PaymentResult {
  state: PaymentResultState;
  message: string;
  courseId: number | null;
}

