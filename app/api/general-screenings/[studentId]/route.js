import { NextResponse } from "next/server";

const API_BASE_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

function getTargetUrl(studentId) {
  const base = API_BASE_URL.endsWith("/api/v1")
    ? API_BASE_URL
    : `${API_BASE_URL}/api/v1`;
  return `${base}/general-screenings/${encodeURIComponent(studentId)}`;
}

async function proxyRequest(request, { params }, method) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const studentId = resolvedParams?.studentId;

    if (!studentId) {
      return NextResponse.json(
        { message: "Student ID is required" },
        { status: 400 }
      );
    }

    const backendUrl = getTargetUrl(studentId);
    const headers = {};
    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const fetchOptions = {
      method,
      headers,
      cache: "no-store",
    };

    if (method === "POST" || method === "PUT" || method === "PATCH") {
      headers["Content-Type"] = "application/json";
      headers["Accept"] = "application/json";
      const body = await request.json();
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(backendUrl, fetchOptions);
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
      { message: `Unable to process request for student screening`, detail: error?.message || "Unknown error" },
      { status: 502 }
    );
  }
}

export async function GET(request, context) {
  return proxyRequest(request, context, "GET");
}

export async function POST(request, context) {
  return proxyRequest(request, context, "POST");
}

export async function PUT(request, context) {
  return proxyRequest(request, context, "PUT");
}

export async function PATCH(request, context) {
  return proxyRequest(request, context, "PATCH");
}
