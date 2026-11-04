
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");

  const savedState = request.cookies.get("ml_state")?.value;
  const verifier = request.cookies.get("ml_verifier")?.value;

  if (!code || !state || !savedState || state !== savedState || !verifier) {
    return NextResponse.json(
      { error: "Autorização inválida ou expirada." },
      { status: 400 }
    );
  }

  const appId = process.env.ML_APP_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;

  if (!appId || !clientSecret) {
    return NextResponse.json(
      { error: "Credenciais não configuradas." },
      { status: 500 }
    );
  }

  const redirectUri =
    "https://integracaototvsvista.vercel.app/api/mercadolivre/callback";

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: appId,
    client_secret: clientSecret,
    code,
    redirect_uri: redirectUri,
    code_verifier: verifier,
  });

  const tokenResponse = await fetch(
    "https://api.mercadolibre.com/oauth/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
      cache: "no-store",
    }
  );

  const tokens = await tokenResponse.json();

  if (!tokenResponse.ok) {
    return NextResponse.json(
      { error: "Falha ao obter autorização.", details: tokens.error },
      { status: 400 }
    );
  }

  // Na próxima etapa, vamos salvar os tokens em banco seguro.
  // Não os exponha no navegador ou nos logs.

  const userResponse = await fetch(
    "https://api.mercadolibre.com/users/me",
    {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
      cache: "no-store",
    }
  );

  const user = await userResponse.json();

  const response = NextResponse.json({
    success: userResponse.ok,
    message: userResponse.ok
      ? "Conta Mercado Livre autorizada!"
      : "Token obtido, mas não foi possível consultar a conta.",
    user: userResponse.ok
      ? { id: user.id, nickname: user.nickname }
      : undefined,
  });

  response.cookies.delete("ml_state");
  response.cookies.delete("ml_verifier");

  return response;
}
