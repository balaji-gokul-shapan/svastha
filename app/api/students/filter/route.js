import { NextResponse } from "next/server";

const API_BASE_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

export async function GET(request) {
  try {
    const rawBaseUrl = API_BASE_URL.endsWith("/students/filter")
      ? API_BASE_URL.replace(/\/students\/filter$/, "")
      : API_BASE_URL;

    const targetUrl = rawBaseUrl.endsWith("/api/v1")
      ? `${rawBaseUrl}/students/filter`
      : `${rawBaseUrl}/api/v1/students/filter`;

    const backendUrl = new URL(targetUrl);

    for (const [key, value] of request.nextUrl.searchParams.entries()) {
      if (value !== undefined && value !== null && value !== "") {
        backendUrl.searchParams.set(key, value);
      }
    }

    const headers = {
      Accept: "application/json",
    };
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

      if (!response.ok) {
        return NextResponse.json(
          {
            message: payload?.message || "Student filter API request failed",
            detail: payload?.detail || payload?.error || payload,
          },
          { status: response.status },
        );
      }

      const resHeaders = new Headers();
      const totalCount = response.headers.get("x-total-count");
      if (totalCount) {
        resHeaders.set("x-total-count", totalCount);
      }

      return NextResponse.json(payload, {
        status: response.status,
        headers: resHeaders,
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
        message: "Unable to fetch filtered students",
        detail: error?.message || "Unknown error",
      },
      { status: 502 },
    );
  }
}