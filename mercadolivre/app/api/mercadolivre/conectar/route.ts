
import { NextResponse } from "next/server";
import { randomBytes, createHash } from "crypto";

export async function GET() {
  const appId = process.env.ML_APP_ID;
  const redirectUri = process.env.ML_REDIRECT_URI;

  if (!appId || !redirectUri) {
    return NextResponse.json(
      { error: "Configurações do Mercado Livre ausentes." },
      { status: 500 }
    );
  }

  // Gera proteção contra CSRF
  const state = randomBytes(32).toString("hex");

  // Gera os dados do PKCE
  const codeVerifier = randomBytes(32).toString("base64url");

  const codeChallenge = createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");

  const authorizationUrl = new URL(
    "https://auth.mercadolivre.com.br/authorization"
  );

  authorizationUrl.searchParams.set("response_type", "code");
  authorizationUrl.searchParams.set("client_id", appId);
  authorizationUrl.searchParams.set("redirect_uri", redirectUri);
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("code_challenge", codeChallenge);
  authorizationUrl.searchParams.set(
    "code_challenge_method",
    "S256"
  );

  const response = NextResponse.redirect(authorizationUrl);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
  };

  response.cookies.set("ml_oauth_state", state, cookieOptions);
  response.cookies.set("ml_code_verifier", codeVerifier, cookieOptions);

  return response;
}
