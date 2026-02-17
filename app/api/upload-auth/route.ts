import { NextResponse } from "next/server";

const COOKIE_NAME = "docshare_upload_auth";
const AUTH_MAX_AGE_SECONDS = 60 * 60 * 12;

export async function GET(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const authorized = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .some((part) => part === `${COOKIE_NAME}=1`);

  return NextResponse.json({ authorized });
}

export async function POST(req: Request) {
  const expectedPassword = process.env.UPLOAD_PAGE_PASSWORD;

  if (!expectedPassword) {
    return NextResponse.json(
      { error: "Upload password is not configured" },
      { status: 500 }
    );
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: string };
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (password !== expectedPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: COOKIE_NAME,
    value: "1",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_MAX_AGE_SECONDS,
  });

  return response;
}
