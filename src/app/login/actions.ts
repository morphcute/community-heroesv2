"use server";

import { signIn } from "@/auth";

export async function signInGoogleWithCallback(formData: FormData) {
  const callbackUrl = (formData.get("callbackUrl") as string) || "/home";
  // Sanitize: only allow relative paths to prevent open-redirect
  const redirectTo = callbackUrl.startsWith("/") ? callbackUrl : "/home";
  await signIn("google", { redirectTo });
}
