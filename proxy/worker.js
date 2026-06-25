/* ============================================================================
   A2Z Filings — Anthropic proxy (Cloudflare Worker)
   ----------------------------------------------------------------------------
   Purpose: keep the Anthropic API key OFF the public web page. The bylaws page
   sends the full Anthropic request body here; this Worker injects the secret
   key server-side, forwards to Anthropic, and streams the response back.

   Setup (Cloudflare dashboard — dash.cloudflare.com):
     1. Workers & Pages  ->  Create  ->  Create Worker  ->  name it
        "a2z-ai-proxy"  ->  Deploy.
     2. Edit code  ->  delete the sample  ->  paste THIS file  ->  Deploy.
     3. Settings  ->  Variables and Secrets  ->  Add:
            Name:  ANTHROPIC_API_KEY     Type: Secret (encrypt)
            Value: <your Anthropic key from console.anthropic.com>
        Save and deploy.
     4. Copy the Worker URL (e.g. https://a2z-ai-proxy.<you>.workers.dev)
        and give it to Jess to wire into bylaws.html (the AI_ENDPOINT value).
   ========================================================================== */

const ALLOWED_ORIGINS = [
  "https://bennygoldstein.github.io",
  "http://localhost:5990",
];

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const allowOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
    const cors = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "content-type",
      "Vary": "Origin",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST")
      return new Response("Method not allowed", { status: 405, headers: cors });
    if (!env.ANTHROPIC_API_KEY)
      return new Response("Server not configured: missing ANTHROPIC_API_KEY secret", { status: 500, headers: cors });

    let bodyText;
    try { bodyText = await request.text(); }
    catch (e) { return new Response("Bad request body", { status: 400, headers: cors }); }

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: bodyText,
    });

    // Stream Anthropic's SSE response straight back to the browser, with CORS.
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...cors,
        "content-type": upstream.headers.get("content-type") || "text/event-stream",
        "cache-control": "no-store",
      },
    });
  },
};
