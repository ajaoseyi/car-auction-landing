// Talks to car-auction-app-backend (POST /v1/waitlist). The API's CORS_ORIGINS must include this site's origin.
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(/\/$/, "");

export type JoinResult = { paddleNo: number; created: boolean };

export async function joinWaitlist(email: string, name?: string): Promise<JoinResult> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/v1/waitlist`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, name: name || undefined, source: "landing" }),
    });
  } catch {
    throw new Error("Couldn't reach us. Check your connection and try again.");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    // Errors are RFC 7807 problems; `message` is a string, or string[] for validation failures.
    const msg = Array.isArray(body?.message) ? body.message[0] : body?.message;
    throw new Error(res.status === 429 ? "Too many tries. Please wait a minute." : msg || "Something went wrong. Please try again.");
  }
  return body.data as JoinResult;
}
