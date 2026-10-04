// Worker de Cloudflare que avisa por Web Push cuando alguien entra al server de Minecraft.
//
// - Cada minuto (cron) mira quién está conectado y, si ha entrado alguien, avisa a los suscritos.
// - GET  /key          clave pública VAPID, para que la web pueda suscribirse.
// - POST /subscribe    { subscription, me }  registra un dispositivo ("me" = su jugador, para no avisarle de sí mismo).
// - POST /unsubscribe  { endpoint }          lo borra.
//
// Configuración en wrangler.toml. Todo lo demás (estado, suscripciones y claves VAPID, que se
// generan solas la primera vez) se guarda en el KV "PUSH".

const COOLDOWN = 5 * 60; // si alguien sale y vuelve en menos de esto (o el server parpadea), no se avisa

export default {
  async fetch(request, env) {
    const cors = {
      "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN,
      "Access-Control-Allow-Methods": "GET, POST",
      "Access-Control-Allow-Headers": "Content-Type",
    };
    const reply = (body, status = 200) =>
      new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    const { pathname } = new URL(request.url);

    if (request.method === "GET" && pathname === "/key") {
      return reply({ key: (await vapid(env)).publicKey });
    }

    if (request.method === "POST" && pathname === "/subscribe") {
      const { subscription: s, me } = await request.json().catch(() => ({}));
      if (!s?.endpoint?.startsWith("https://") || !s.keys?.p256dh || !s.keys?.auth) {
        return reply({ error: "Suscripción no válida" }, 400);
      }
      const key = await subKey(s.endpoint);
      const sub = JSON.stringify({
        subscription: { endpoint: s.endpoint, keys: { p256dh: s.keys.p256dh, auth: s.keys.auth } },
        me: typeof me === "string" ? me.slice(0, 16) : "",
      });
      const old = await env.PUSH.get(key);
      if (old === sub) return reply({ ok: true });
      await env.PUSH.put(key, sub);
      if (!old) {
        // Aviso de prueba: si llega, toda la cadena funciona
        await sendPush(env, JSON.parse(sub).subscription, {
          title: "🔔 Avisos activados",
          body: "Te avisaremos cuando alguien entre al server.",
        });
      }
      return reply({ ok: true });
    }

    if (request.method === "POST" && pathname === "/unsubscribe") {
      const { endpoint } = await request.json().catch(() => ({}));
      if (typeof endpoint === "string") await env.PUSH.delete(await subKey(endpoint));
      return reply({ ok: true });
    }

    return reply({ error: "No encontrado" }, 404);
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(checkServer(env));
  },
};

// ---------- Vigilar el server ----------

async function onlinePlayers(server) {
  const r = await fetch(`https://api.mcstatus.io/v2/status/java/${encodeURIComponent(server)}`);
  if (!r.ok) return null;
  const d = await r.json();
  if (!d.online) return [];
  return (d.players?.list || [])
    .map(p => p.name_clean || p.name_raw)
    .filter(n => n && !/^anonymous player$/i.test(n));
}

async function checkServer(env) {
  const online = await onlinePlayers(env.SERVER);
  if (!online) return; // la API ha fallado: mejor no tocar nada
  const now = Math.floor(Date.now() / 1000);
  const state = await env.PUSH.get("state", "json");
  if (!state) {
    await env.PUSH.put("state", JSON.stringify({ online, left: {} }));
    return;
  }

  const before = new Set(state.online);
  const joined = online.filter(n => !before.has(n) && !(now - (state.left[n] || 0) < COOLDOWN));
  const changed = online.length !== before.size || online.some(n => !before.has(n));
  if (changed) {
    // Solo se escribe cuando cambia algo: el plan gratis de KV permite 1000 escrituras al día
    const left = {};
    for (const [n, t] of Object.entries(state.left)) if (now - t < COOLDOWN) left[n] = t;
    for (const n of before) if (!online.includes(n)) left[n] = now;
    for (const n of online) delete left[n];
    await env.PUSH.put("state", JSON.stringify({ online, left }));
  }
  if (joined.length) await notifyAll(env, joined, online);
}

const list = names => new Intl.ListFormat("es", { type: "conjunction" }).format(names);

async function notifyAll(env, joined, online) {
  const { keys } = await env.PUSH.list({ prefix: "sub:" });
  await Promise.all(keys.map(async ({ name }) => {
    const sub = await env.PUSH.get(name, "json");
    const others = joined.filter(n => n !== sub?.me);
    if (!others.length) return;
    const res = await sendPush(env, sub.subscription, {
      title: `🟢 ${list(others)} ${others.length === 1 ? "se ha conectado" : "se han conectado"}`,
      body: online.length === 1 ? "Está solo en el server." : `Ahora hay ${online.length} jugando: ${list(online)}.`,
    });
    // 404/410: el dispositivo ya no existe o ha desactivado los avisos
    if (res.status === 404 || res.status === 410) await env.PUSH.delete(name);
  }));
}

async function subKey(endpoint) {
  const hash = await crypto.subtle.digest("SHA-256", enc(endpoint));
  return "sub:" + [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

// ---------- Web Push (RFC 8291 para el cifrado, RFC 8292 para VAPID) ----------

let vapidCache = null;

async function vapid(env) {
  if (vapidCache) return vapidCache;
  let jwk = await env.PUSH.get("vapid", "json");
  if (!jwk) {
    const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
    jwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
    await env.PUSH.put("vapid", JSON.stringify(jwk));
  }
  const privateKey = await crypto.subtle.importKey("jwk", jwk, { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]);
  const publicKey = b64url(concat([4], b64urlDecode(jwk.x), b64urlDecode(jwk.y)));
  return (vapidCache = { privateKey, publicKey });
}

async function sendPush(env, subscription, payload) {
  const { privateKey, publicKey } = await vapid(env);
  const header = b64url(enc(JSON.stringify({ typ: "JWT", alg: "ES256" })));
  const claims = b64url(enc(JSON.stringify({
    aud: new URL(subscription.endpoint).origin,
    exp: Math.floor(Date.now() / 1000) + 12 * 3600,
    sub: env.CONTACT,
  })));
  const signature = await crypto.subtle.sign({ name: "ECDSA", hash: "SHA-256" }, privateKey, enc(`${header}.${claims}`));
  const jwt = `${header}.${claims}.${b64url(new Uint8Array(signature))}`;

  return fetch(subscription.endpoint, {
    method: "POST",
    headers: {
      Authorization: `vapid t=${jwt}, k=${publicKey}`,
      "Content-Encoding": "aes128gcm",
      "Content-Type": "application/octet-stream",
      TTL: "600", // si el móvil está apagado más de 10 min, el aviso ya no tiene sentido
      Urgency: "high",
    },
    body: await encrypt(JSON.stringify(payload), subscription.keys),
  });
}

async function encrypt(text, keys) {
  const uaPublic = b64urlDecode(keys.p256dh);
  const authSecret = b64urlDecode(keys.auth);
  const local = await crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveBits"]);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey("raw", local.publicKey));
  const uaKey = await crypto.subtle.importKey("raw", uaPublic, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const shared = await crypto.subtle.deriveBits({ name: "ECDH", public: uaKey }, local.privateKey, 256);

  const ikm = await hkdf(authSecret, shared, concat(enc("WebPush: info\0"), uaPublic, asPublic), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc("Content-Encoding: aes128gcm\0"), 16);
  const nonce = await hkdf(salt, ikm, enc("Content-Encoding: nonce\0"), 12);
  const aes = await crypto.subtle.importKey("raw", cek, "AES-GCM", false, ["encrypt"]);
  const cipher = await crypto.subtle.encrypt({ name: "AES-GCM", iv: nonce }, aes, concat(enc(text), [2]));

  // Cabecera: salt (16) | tamaño de registro (4) | longitud de la clave (1) | clave pública efímera (65)
  const head = new Uint8Array(21);
  head.set(salt);
  new DataView(head.buffer).setUint32(16, 4096);
  head[20] = asPublic.length;
  return concat(head, asPublic, new Uint8Array(cipher));
}

async function hkdf(salt, ikm, info, length) {
  const key = await crypto.subtle.importKey("raw", ikm, "HKDF", false, ["deriveBits"]);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: "HKDF", hash: "SHA-256", salt, info }, key, length * 8));
}

function enc(text) {
  return new TextEncoder().encode(text);
}

function concat(...parts) {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let i = 0;
  for (const p of parts) {
    out.set(p, i);
    i += p.length;
  }
  return out;
}

function b64url(bytes) {
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(text) {
  const bin = atob(text.replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}
