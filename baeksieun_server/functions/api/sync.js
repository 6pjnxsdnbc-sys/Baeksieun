// Cloudflare Pages Function — record sync via KV.
// Bind a KV namespace named LOGS in Pages > Settings > Functions > KV bindings.
const CORS = { "access-control-allow-origin": "*", "access-control-allow-methods": "GET,POST,OPTIONS", "access-control-allow-headers": "content-type", "content-type": "application/json" };
export async function onRequestOptions() { return new Response(null, { headers: CORS }); }
export async function onRequestGet({ request, env }) {
  const key = new URL(request.url).searchParams.get("key");
  if (!key || !env.LOGS) return new Response("{}", { headers: CORS });
  const v = await env.LOGS.get("log:" + key);
  return new Response(v || "{}", { headers: CORS });
}
export async function onRequestPost({ request, env }) {
  const key = new URL(request.url).searchParams.get("key");
  if (!key) return new Response('{"error":"no key"}', { status: 400, headers: CORS });
  if (!env.LOGS) return new Response('{"error":"no KV bound"}', { status: 500, headers: CORS });
  let body = {};
  try { body = await request.json(); } catch (e) {}
  const existRaw = await env.LOGS.get("log:" + key);
  const exist = existRaw ? JSON.parse(existRaw) : {};
  for (const k in body) exist[k] = Math.max(Number(exist[k] || 0), Number(body[k] || 0));
  await env.LOGS.put("log:" + key, JSON.stringify(exist));
  return new Response(JSON.stringify(exist), { headers: CORS });
}
