import { NextResponse } from "next/server";

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

export async function GET(request) {
  try {
    const backendUrl = new URL(`${API_BASE_URL}/students`);

    for (const [key, value] of request.nextUrl.searchParams.entries()) {
      if (value) {
        backendUrl.searchParams.set(key, value);
      }
    }

    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const response = await fetch(backendUrl, {
      method: "GET",
      headers,
      cache: "no-store",
    });
    const data = await response.json();
    const headers = new Headers({ "Content-Type": "application/json" });
    const total = response.headers.get("x-total-count");

    if (total) {
      headers.set("x-total-count", total);
    }

    return NextResponse.json(data, {
      status: response.status,
      headers,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to fetch student data",
        detail: error?.message || "Unknown error",
      },
      { status: 502 },
    );
  }
}