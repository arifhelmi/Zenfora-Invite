import crypto from "node:crypto";

export type CreatePaymentInput = { orderId: string; amount: number; customerEmail: string };
export type PaymentResult = { externalId: string; status: "PENDING" | "PAID" | "FAILED"; paymentUrl?: string };
export type WebhookResult = { externalId: string; status: "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED"; valid: boolean };
export interface PaymentProvider { createTransaction(input: CreatePaymentInput): Promise<PaymentResult>; verifyWebhook(payload: unknown, headers: Headers): Promise<WebhookResult>; getStatus(externalId: string): Promise<PaymentResult["status"]>; }

export class MockPaymentProvider implements PaymentProvider {
  async createTransaction(input: CreatePaymentInput) { return { externalId: `mock_${input.orderId}_${crypto.randomUUID()}`, status: "PENDING" as const, paymentUrl: `/api/payments/mock/${input.orderId}/complete` }; }
  async verifyWebhook(payload: unknown) { const data = payload as { externalId?: string; status?: WebhookResult["status"] }; return { externalId: data.externalId ?? "", status: data.status ?? "FAILED", valid: Boolean(data.externalId) }; }
  async getStatus() { return "PENDING" as const; }
}
export const paymentProvider: PaymentProvider = new MockPaymentProvider();
