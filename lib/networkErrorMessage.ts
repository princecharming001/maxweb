/** Human-readable message for undici/browser "fetch failed" and similar. */
export function networkErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) {
    return "Could not complete the request. Check your connection and try again.";
  }
  if (err.message !== "fetch failed") {
    return err.message;
  }
  const cause = (err as Error & { cause?: { code?: string; message?: string } })
    .cause;
  if (cause?.code === "ECONNREFUSED") {
    return "Could not connect to the server.";
  }
  if (cause?.code === "ENOTFOUND") {
    return "Could not reach the server (DNS).";
  }
  if (
    typeof cause?.message === "string" &&
    cause.message.toLowerCase().includes("certificate")
  ) {
    return "Secure connection failed (certificate).";
  }
  return "Network request failed. Try another network, disable VPN or ad blockers for this site, or allow Stripe and this domain.";
}
