// src/app/login/admin/actions.ts
"use server";

import { signIn } from "@/auth";

export async function signInGoogle() {
  await signIn("google", { redirectTo: "/home" });
}

export async function signInCredentials(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  await signIn("credentials", { email, password, redirectTo: "/home" });
}
