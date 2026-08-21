import { NextResponse } from "next/server";

const API_BASE_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

export async function POST(request) {
  try {
    const body = await request.json();
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const responseText = await response.text();

    try {
      return NextResponse.json(JSON.parse(responseText), {
        status: response.status,
      });
    } catch {
      return new NextResponse(responseText, {
        status: response.status,
        headers: { "Content-Type": "text/plain" },
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to reach the authentication service",
        detail: error?.message || "Unknown error",
      },
      { status: 502 },
    );
  }
}