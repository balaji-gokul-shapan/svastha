import { NextResponse } from "next/server";

const API_BASE_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

export async function GET(request, context) {
  try {
    const { studentId } = await context.params;
    const normalizedStudentId = String(studentId ?? "").trim();
    if (!normalizedStudentId) {
      return NextResponse.json({ message: "Student ID is required" }, { status: 400 });
    }

    const base = API_BASE_URL.endsWith("/api/v1")
      ? API_BASE_URL
      : `${API_BASE_URL}/api/v1`;
    const headers = { Accept: "application/json" };
    const authorization = request.headers.get("authorization");
    if (authorization) headers.Authorization = authorization;

    const response = await fetch(
      `${base}/vision-test/student/${encodeURIComponent(normalizedStudentId)}`,
      { headers, cache: "no-store" },
    );
    const body = await response.text();

    try {
      return NextResponse.json(JSON.parse(body), { status: response.status });
    } catch {
      return new NextResponse(body, {
        status: response.status,
        headers: { "Content-Type": "text/plain" },
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to fetch vision screening data",
        detail: error?.message || "Unknown error",
      },
      { status: 502 },
    );
  }
}
