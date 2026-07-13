"use server";
import { revalidatePath } from "next/cache";
import { assertEventOwner, requireUser } from "@/lib/permissions";
import { paymentProvider } from "@/lib/payments";
import { prisma } from "@/lib/prisma";

export async function createOrderAction(eventId: string, packageId: string) { const user = await requireUser(); await assertEventOwner(eventId, user.id); const pkg = await prisma.package.findFirstOrThrow({ where: { id: packageId, isActive: true } }); const order = await prisma.order.create({ data: { userId: user.id, eventId, code: `ZNV-${Date.now().toString(36).toUpperCase()}`, status: "PENDING", subtotal: pkg.price, total: pkg.price, items: { create: { packageId: pkg.id, name: pkg.name, unitPrice: pkg.price } } } }); const transaction = await paymentProvider.createTransaction({ orderId: order.id, amount: pkg.price, customerEmail: user.email ?? "customer@example.com" }); await prisma.payment.create({ data: { orderId: order.id, provider: "mock", externalId: transaction.externalId, amount: pkg.price, status: transaction.status } }); revalidatePath(`/dashboard/events/${eventId}`); return { orderId: order.id, paymentUrl: transaction.paymentUrl }; }
