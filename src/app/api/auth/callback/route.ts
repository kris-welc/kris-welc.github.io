import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const REPO = "kris-welc/agent-algebra";
const ALLOWED_ORIGINS = [
  "https://kris-welc.github.io",
  "http://localhost:3333",
];

function buildReturnUrl(returnTo: string, origin: string): URL {
  // If returnTo is an absolute URL (from GitHub Pages), use it directly
  if (returnTo.startsWith("http")) {
    const url = new URL(returnTo);
    url.searchParams.set("starred", "1");
    // Only allow redirects to trusted origins
    if (ALLOWED_ORIGINS.some((o) => url.origin === o)) {
      return url;
    }
  }
  // Otherwise it's a relative path (Vercel deployment)
  const url = new URL(returnTo, origin);
  url.searchParams.set("starred", "1");
  return url;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const stateParam = url.searchParams.get("state") ?? "";

  const [state, ...returnParts] = stateParam.split(":");
  const returnTo = returnParts.join(":") || "/";

  const cookieStore = await cookies();
  const savedState = cookieStore.get("gh_state")?.value;

  if (!code || !state || state !== savedState) {
    return NextResponse.redirect(buildReturnUrl(returnTo, url.origin));
  }

  const tokenRes = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    }
  );

  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    return NextResponse.redirect(buildReturnUrl(returnTo, url.origin));
  }

  // Auto-star the repo immediately after auth
  await fetch(`https://api.github.com/user/starred/${REPO}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "kris-welc-portfolio",
    },
  });

  const redirectUrl = buildReturnUrl(returnTo, url.origin);
  const response = NextResponse.redirect(redirectUrl);

  response.cookies.set("gh_token", tokenData.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  response.cookies.delete("gh_state");

  return response;
}
