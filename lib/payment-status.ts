export type PaymentLifecycle = "PENDING" | "PAID" | "FAILED" | "EXPIRED" | "REFUNDED";
export function canActivateEntitlement(status: PaymentLifecycle) { return status === "PAID"; }
export function isTerminalPaymentStatus(status: PaymentLifecycle) { return ["PAID", "FAILED", "EXPIRED", "REFUNDED"].includes(status); }
