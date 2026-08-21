import { NextResponse } from "next/server";

const API_BASE_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

function getTargetUrl(path = "") {
  const base = API_BASE_URL.endsWith("/api/v1")
    ? API_BASE_URL
    : `${API_BASE_URL}/api/v1`;
  return `${base}${path}`;
}

export async function GET(request) {
  try {
    const backendUrl = new URL(getTargetUrl("/general-screenings"));

    for (const [key, value] of request.nextUrl.searchParams.entries()) {
      if (value !== undefined && value !== null && value !== "") {
        backendUrl.searchParams.set(key, value);
      }
    }

    const headers = { Accept: "application/json" };
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(backendUrl.toString(), {
      method: "GET",
      headers,
      cache: "no-store",
    });

    const responseText = await response.text();

    try {
      const payload = JSON.parse(responseText);
      return NextResponse.json(payload, { status: response.status });
    } catch {
      return new NextResponse(responseText, {
        status: response.status,
        headers: { "Content-Type": "text/plain" },
      });
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Unable to fetch general screenings", detail: error?.message || "Unknown error" },
      { status: 502 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const backendUrl = getTargetUrl("/general-screenings");

    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(backendUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const responseText = await response.text();

    try {
      const payload = JSON.parse(responseText);
      return NextResponse.json(payload, { status: response.status });
    } catch {
      return new NextResponse(responseText, {
        status: response.status,
        headers: { "Content-Type": "text/plain" },
      });
    }
  } catch (error) {
    return NextResponse.json(
      { message: "Unable to create general screening", detail: error?.message || "Unknown error" },
      { status: 502 }
    );
  }
}
