import NextAuth from "next-auth";

const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

console.warn = (...args) => {
    if (
        typeof args[0] === "string" &&
        args[0].includes("CHUNKING_SESSION_COOKIE")
    ) {
        return; // suppress
    }
    originalConsoleWarn(...args);
};

console.log = (...args) => {
    if (
        typeof args[0] === "string" &&
        args[0].includes("CHUNKING_SESSION_COOKIE")
    ) {
        return; // suppress
    }
    originalConsoleLog(...args);
};

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        {
            id: "authentik",
            name: "Authentik",
            type: "oidc",
            issuer: process.env.AUTHENTIK_ISSUER + "/pnb/",
            clientId: process.env.AUTHENTIK_CLIENT_ID,
            authorization: {
                url: process.env.AUTHENTIK_ISSUER + "/authorize/",
                params: {
                    scope: "openid email profile offline_access authorities bankCode privileges adminName ifsc path user_name created",
                    response_type: "code",
                },
            },
            token: process.env.AUTHENTIK_ISSUER + "/token/",
            userinfo: process.env.AUTHENTIK_ISSUER + "/userinfo/",
            jwks_endpoint: process.env.AUTHENTIK_ISSUER + "/pnb/jwks/",
            checks: ["pkce", "state"],
            profile(profile) {
                return {
                    id: profile.sub,
                    name:
                        profile.name ??
                        profile.preferred_username ??
                        profile.user_name,
                    email: profile.email,
                    image: profile.picture ?? null,

                    // Standard OIDC claims
                    sub: profile.sub,
                    preferred_username: profile.preferred_username,
                    given_name: profile.given_name,
                    nickname: profile.nickname,
                    email_verified: profile.email_verified,
                    groups: profile.groups ?? [],

                    // Custom Authentik claims
                    user_name: profile.user_name,
                    adminName: profile.adminName,
                    authorities: profile.authorities ?? [],
                    bankCode: profile.bankCode,
                    privileges: profile.privileges ?? [],
                    ifsc: profile.ifsc,
                    path: profile.path,
                    created: profile.created,
                };
            },
        },
    ],

    callbacks: {
        async jwt({ token, account, profile }) {
            // On initial sign-in, persist tokens and all profile claims
            if (account && profile) {
                token.accessToken = account.access_token;
                token.refreshToken = account.refresh_token;
                token.idToken = account.id_token;
                token.expiresAt = account.expires_at;

                // Standard OIDC claims
                token.sub = profile.sub;
                token.preferred_username = profile.preferred_username;
                token.given_name = profile.given_name;
                token.nickname = profile.nickname;
                token.email_verified = profile.email_verified;
                token.groups = profile.groups ?? [];

                // Custom Authentik claims
                token.user_name = profile.user_name;
                token.adminName = profile.adminName;
                token.authorities = profile.authorities ?? [];
                token.bankCode = profile.bankCode;
                token.privileges = profile.privileges ?? [];
                token.ifsc = profile.ifsc;
                token.path = profile.path;
                token.created = profile.created;
            }

            // Return token if not expired
            if (Date.now() < token.expiresAt * 1000) {
                return token;
            }

            // Access token expired — attempt refresh
            return await refreshAccessToken(token);
        },

        async session({ session, token }) {
            // Expose everything to the client session

            session.accessToken = token.accessToken;
            session.refreshToken = token.refreshToken;
            session.idToken = token.idToken;
            session.error = token.error ?? null;

            session.user = {
                ...session.user,

                // Standard OIDC claims

                sub: token.sub,
                preferred_username: token.preferred_username,
                given_name: token.given_name,
                nickname: token.nickname,
                email_verified: token.email_verified,
                groups: token.groups,

                // Custom Authentik claims

                user_name: token.user_name,
                adminName: token.adminName,
                authorities: token.authorities,
                bankCode: token.bankCode,
                privileges: token.privileges,
                ifsc: token.ifsc,
                path: token.path,
                created: token.created,
            };

            return session;
        },
    },

    events: {
        async signOut({ token }) {
            // Hit Authentik's end-session endpoint on sign-out
            if (token?.idToken) {
                const endSessionUrl = new URL(
                    process.env.AUTHENTIK_ISSUER + "/pnb/end-session/",
                );
                endSessionUrl.searchParams.set("id_token_hint", token.idToken);
                endSessionUrl.searchParams.set(
                    "post_logout_redirect_uri",
                    process.env.NEXTAUTH_URL ?? "http://localhost:3000",
                );

                try {
                    await fetch(endSessionUrl.toString());
                } catch (err) {
                    console.error("[auth] End-session request failed:", err);
                }
            }
        },
    },

    session: {
        strategy: "jwt",
    },

    debug: process.env.NODE_ENV === "development",
});

// ---------------------------------------------------------------------------
// Token refresh helper
// ---------------------------------------------------------------------------
async function refreshAccessToken(token) {
    try {
        const response = await fetch(process.env.AUTHENTIK_ISSUER + "/token/", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: process.env.AUTHENTIK_CLIENT_ID,
                client_secret: process.env.AUTHENTIK_CLIENT_SECRET,
                grant_type: "refresh_token",
                refresh_token: token.refreshToken,
            }),
        });

        const refreshed = await response.json();

        if (!response.ok) throw refreshed;

        return {
            ...token,
            accessToken: refreshed.access_token,
            idToken: refreshed.id_token ?? token.idToken,
            refreshToken: refreshed.refresh_token ?? token.refreshToken,
            expiresAt: Math.floor(Date.now() / 1000) + refreshed.expires_in,
            error: null,
        };
    } catch (err) {
        console.error("[auth] Token refresh failed:", err);
        return { ...token, error: "RefreshAccessTokenError" };
    }
}
