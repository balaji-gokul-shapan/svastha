import { NextResponse } from "next/server";

const API_BASE_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

function getTargetUrl() {
  const base = API_BASE_URL.endsWith("/api/v1")
    ? API_BASE_URL
    : `${API_BASE_URL}/api/v1`;
  return `${base}/hear-test/create`;
}

export async function POST(request) {
  try {
    const body = await request.json();
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const response = await fetch(getTargetUrl(), {
      method: "POST",
      headers,
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
        message: "Unable to create hearing screening",
        detail: error?.message || "Unknown error",
      },
      { status: 502 },
    );
  }
}
