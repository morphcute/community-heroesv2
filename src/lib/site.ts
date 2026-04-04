export function getSiteUrl() {
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.AUTH_URL ||
    "http://localhost:3000";

  return envUrl.endsWith("/") ? envUrl.slice(0, -1) : envUrl;
}
