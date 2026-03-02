import { NextResponse } from "next/server";
import crypto from "node:crypto";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const returnTo = url.searchParams.get("returnTo") || "/";
  const state = crypto.randomBytes(16).toString("hex");

  const authUrl = new URL("https://github.com/login/oauth/authorize");
  authUrl.searchParams.set("client_id", process.env.GITHUB_CLIENT_ID!);
  authUrl.searchParams.set(
    "redirect_uri",
    `${url.origin}/api/auth/callback`
  );
  authUrl.searchParams.set("state", `${state}:${returnTo}`);
  const response = NextResponse.redirect(authUrl);

  response.cookies.set("gh_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
