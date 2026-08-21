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
  return `${base}/dental-test/create`;
}

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId =
      searchParams.get("student_id") ||
      searchParams.get("studentId") ||
      searchParams.get("id");

    const base = API_BASE_URL.endsWith("/api/v1")
      ? API_BASE_URL
      : `${API_BASE_URL}/api/v1`;

    let targetUrl;
    if (studentId) {
      targetUrl = `${base}/dental-test/student/${encodeURIComponent(studentId)}`;
    } else {
      const query = searchParams.toString();
      targetUrl = `${base}/dental-test${query ? `?${query}` : ""}`;
    }

    const headers = {
      Accept: "application/json",
    };
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const response = await fetch(targetUrl, {
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
            message: payload?.message || "Dental screening API request failed",
            detail: payload?.detail || payload?.error || payload,
          },
          { status: response.status },
        );
      }
      return NextResponse.json(payload, { status: response.status });
    } catch {
      return new NextResponse(responseText, {
        status: response.status,
        headers: { "Content-Type": "text/plain" },
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to fetch dental screening data",
        detail: error?.message || "Unknown error",
      },
      { status: 502 },
    );
  }
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
        message: "Unable to create dental screening",
        detail: error?.message || "Unknown error",
      },
      { status: 502 },
    );
  }
}
