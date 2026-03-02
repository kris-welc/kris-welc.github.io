import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const REPO = "kris-welc/agent-algebra";
const API = "https://api.github.com";
const HEADERS = {
  Accept: "application/vnd.github.v3+json",
  "User-Agent": "kris-welc-portfolio",
};

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("gh_token")?.value;

  if (!token) {
    return NextResponse.json({ starred: false, authenticated: false });
  }

  const res = await fetch(`${API}/user/starred/${REPO}`, {
    headers: { ...HEADERS, Authorization: `Bearer ${token}` },
  });

  if (res.status === 401 || res.status === 403) {
    const response = NextResponse.json({
      starred: false,
      authenticated: false,
    });
    response.cookies.delete("gh_token");
    return response;
  }

  return NextResponse.json({
    starred: res.status === 204,
    authenticated: true,
  });
}

export async function PUT() {
  const cookieStore = await cookies();
  const token = cookieStore.get("gh_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const res = await fetch(`${API}/user/starred/${REPO}`, {
    method: "PUT",
    headers: { ...HEADERS, Authorization: `Bearer ${token}` },
  });

  if (res.status === 401 || res.status === 403) {
    const response = NextResponse.json(
      { error: "Token expired" },
      { status: 401 }
    );
    response.cookies.delete("gh_token");
    return response;
  }

  return NextResponse.json({ starred: true });
}
