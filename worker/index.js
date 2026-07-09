export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS
    const cors = {
      "Access-Control-Allow-Origin": env.FRONTEND_URL,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    // Hilfsfunktionen
    const json = (data, status = 200) =>
      new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json", ...cors }
      });

    const unauthorized = () => json({ error: "Unauthorized" }, 401);

    // Simple JWT (HMAC)
    const encodeBase64 = (obj) =>
      btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

    const sign = async (data, secret) => {
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(data));
      return btoa(String.fromCharCode(...new Uint8Array(sig)))
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_");
    };

    const verify = async (token, secret) => {
      const [h, p, s] = token.split(".");
      if (!h || !p || !s) return null;
      const data = `${h}.${p}`;
      const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
      );
      const sigBytes = Uint8Array.from(
        atob(s.replace(/-/g, "+").replace(/_/g, "/")),
        (c) => c.charCodeAt(0)
      );
      const ok = await crypto.subtle.verify(
        "HMAC",
        key,
        sigBytes,
        new TextEncoder().encode(data)
      );
      if (!ok) return null;
      return JSON.parse(atob(p.replace(/-/g, "+").replace(/_/g, "/")));
    };

    const getAuthUser = async () => {
      const auth = request.headers.get("Authorization");
      if (!auth || !auth.startsWith("Bearer ")) return null;
      const token = auth.slice("Bearer ".length);
      return await verify(token, env.JWT_SECRET);
    };

    // Discord Login
    if (url.pathname === "/login") {
      const discord =
        "https://discord.com/oauth2/authorize" +
        "?client_id=" + env.DISCORD_CLIENT_ID +
        "&response_type=code" +
        "&scope=identify guilds" +
        "&redirect_uri=" + encodeURIComponent(env.REDIRECT_URI);

      return Response.redirect(discord, 302);
    }

    // ⭐ FIX: callback.html wird jetzt erkannt
    if (url.pathname === "/callback" || url.pathname === "/callback.html") {

      const code = url.searchParams.get("code");
      if (!code) return new Response("Kein Code!", { status: 400, headers: cors });

      const body = new URLSearchParams({
        client_id: env.DISCORD_CLIENT_ID,
        client_secret: env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: env.REDIRECT_URI
      });

      const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body
      });

      const token = await tokenRes.json();
      if (!token.access_token) return new Response("Token Fehler!", { status: 400, headers: cors });

      const userRes = await fetch("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${token.access_token}` }
      });
      const user = await userRes.json();

      // JWT bauen
      const header = { alg: "HS256", typ: "JWT" };
      const payload = {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24
      };

      const h = encodeBase64(header);
      const p = encodeBase64(payload);
      const s = await sign(`${h}.${p}`, env.JWT_SECRET);
      const jwt = `${h}.${p}.${s}`;

      const redirect = new URL(env.FRONTEND_URL + "/servers.html");
      redirect.searchParams.set("token", jwt);

      return Response.redirect(redirect.toString(), 302);
    }

    // API: User
    if (url.pathname === "/api/user") {
      const user = await getAuthUser();
      if (!user) return unauthorized();
      return json({ user });
    }

    // API: Guilds
    if (url.pathname === "/api/guilds") {
      const user = await getAuthUser();
      if (!user) return unauthorized();

      const res = await fetch("https://discord.com/api/users/@me/guilds", {
        headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` }
      });

      const guilds = await res.json();
      return json({ guilds });
    }

    // API: Channels
    if (url.pathname.startsWith("/api/guilds/") && url.pathname.endsWith("/channels")) {
      const user = await getAuthUser();
      if (!user) return unauthorized();

      const parts = url.pathname.split("/");
      const guildId = parts[3];

      const res = await fetch(`https://discord.com/api/guilds/${guildId}/channels`, {
        headers: { Authorization: `Bot ${env.DISCORD_BOT_TOKEN}` }
      });

      const channels = await res.json();
      return json({ channels });
    }

    // SAVE
    if (url.pathname === "/save" && request.method === "POST") {
      const user = await getAuthUser();
      if (!user) return unauthorized();

      const body = await request.json();
      const { guildId, settings, personality, keys } = body;

      if (!guildId) return json({ error: "guildId fehlt" }, 400);

      const data = JSON.stringify({ settings, personality, keys });

      await env.DB.prepare(
        `INSERT INTO guild_settings (guild_id, data)
         VALUES (?1, ?2)
         ON CONFLICT(guild_id) DO UPDATE SET data = excluded.data`
      )
        .bind(guildId, data)
        .run();

      return json({ ok: true });
    }

    // LOAD
    if (url.pathname === "/load" && request.method === "GET") {
      const user = await getAuthUser();
      if (!user) return unauthorized();

      const guildId = url.searchParams.get("guildId");
      if (!guildId) return json({ error: "guildId fehlt" }, 400);

      const row = await env.DB.prepare(
        `SELECT data FROM guild_settings WHERE guild_id = ?1`
      )
        .bind(guildId)
        .first();

      if (!row) return json({ settings: null, personality: null, keys: null });

      const parsed = JSON.parse(row.data);
      return json(parsed);
    }

    return new Response("404", {
      status: 404,
      headers: cors
    });
  }
}

