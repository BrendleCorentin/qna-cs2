import crypto from "crypto";
import { createUserSession, findOrCreateOAuthUser } from "../db/database.js";

const PUBLIC_URL = (process.env.PUBLIC_URL || "https://counter-quiz.com").replace(/\/$/, "");
const CLIENT_URL = (process.env.CLIENT_URL || PUBLIC_URL).replace(/\/$/, "");
const states = new Map();

const providers = {
  google: {
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "openid email profile",
  },
  twitch: {
    clientId: () => process.env.TWITCH_CLIENT_ID,
    clientSecret: () => process.env.TWITCH_CLIENT_SECRET,
    authorizeUrl: "https://id.twitch.tv/oauth2/authorize",
    tokenUrl: "https://id.twitch.tv/oauth2/token",
    scope: "user:read:email",
  },
};

const callbackUrl = (provider) => `${PUBLIC_URL}/auth/${provider}/callback`;
const fail = (res, message) => res.redirect(`${CLIENT_URL}/#oauth_error=${encodeURIComponent(message)}`);

export function attachOAuthRoutes(app) {
  app.get("/auth/:provider", (req, res) => {
    const providerName = req.params.provider;
    const provider = providers[providerName];
    if (!provider) return res.status(404).send("Provider inconnu");
    if (!provider.clientId() || !provider.clientSecret()) return fail(res, "Connexion sociale non configurée");

    const state = crypto.randomBytes(24).toString("hex");
    states.set(state, { provider: providerName, expiresAt: Date.now() + 10 * 60 * 1000 });
    const query = new URLSearchParams({
      client_id: provider.clientId(),
      redirect_uri: callbackUrl(providerName),
      response_type: "code",
      scope: provider.scope,
      state,
    });
    res.redirect(`${provider.authorizeUrl}?${query}`);
  });

  app.get("/auth/:provider/callback", async (req, res) => {
    const providerName = req.params.provider;
    const provider = providers[providerName];
    const savedState = states.get(req.query.state);
    states.delete(req.query.state);
    if (!provider || savedState?.provider !== providerName || savedState.expiresAt <= Date.now()) return fail(res, "Connexion expirée ou invalide");
    if (!req.query.code) return fail(res, "Connexion annulée");

    try {
      const tokenResponse = await fetch(provider.tokenUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: provider.clientId(),
          client_secret: provider.clientSecret(),
          code: String(req.query.code),
          grant_type: "authorization_code",
          redirect_uri: callbackUrl(providerName),
        }),
      });
      if (!tokenResponse.ok) throw new Error("Échange du code OAuth impossible");
      const tokens = await tokenResponse.json();

      let identity;
      if (providerName === "google") {
        const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { Authorization: `Bearer ${tokens.access_token}` } });
        if (!profileResponse.ok) throw new Error("Profil Google inaccessible");
        const profile = await profileResponse.json();
        identity = { provider: "google", providerId: profile.sub, username: profile.name || profile.email?.split("@")[0], email: profile.email, avatarSeed: profile.name };
      } else {
        const profileResponse = await fetch("https://api.twitch.tv/helix/users", {
          headers: { Authorization: `Bearer ${tokens.access_token}`, "Client-Id": provider.clientId() },
        });
        if (!profileResponse.ok) throw new Error("Profil Twitch inaccessible");
        const profile = (await profileResponse.json()).data?.[0];
        if (!profile) throw new Error("Profil Twitch introuvable");
        identity = { provider: "twitch", providerId: profile.id, username: profile.display_name || profile.login, email: profile.email, avatarSeed: profile.login };
      }

      const user = await findOrCreateOAuthUser(identity);
      const sessionToken = await createUserSession(user.id);
      res.redirect(`${CLIENT_URL}/#oauth_token=${encodeURIComponent(sessionToken)}`);
    } catch (error) {
      console.error(`[OAuth ${providerName}]`, error);
      fail(res, "Impossible de terminer la connexion");
    }
  });
}
