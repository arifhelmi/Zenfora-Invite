"use server";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";

export async function loginAction(_: { error?: string } | undefined, formData: FormData) {
  try { await signIn("credentials", { email: String(formData.get("email") ?? ""), password: String(formData.get("password") ?? ""), redirectTo: "/dashboard" }); }
  catch (error) { if (error instanceof AuthError) return { error: "Email atau kata sandi tidak tepat." }; throw error; }
  return {};
}
