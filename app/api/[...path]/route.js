import { NextResponse } from "next/server";


const API_BASE_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

// Paths that live at the backend ROOT instead of under /api/v1.
// Key = first segment of the incoming /api/<key>/... request.
const ROOT_PATH_PREFIXES = new Set(["doctor-camps"]);

function buildBackendUrl(segments, searchParams) {
  // Use the configured base as-is when it already carries an /api path
  // (..ends with /api OR /api/v1). Only when the base has NO api segment (e.g.
  // a bare host) do we append the default /api/v1 prefix.
  const base = /\/api(\/v1)?$/.test(API_BASE_URL)
    ? API_BASE_URL
    : `${API_BASE_URL}/api/`;

  // Frontend paths like /api/v1/students/filter include a redundant "v1"
  // segment while the base URL already targets /api/v1 — drop it to avoid
  // producing /api/v1/v1/... on the backend.
  let normalizedSegments =
    segments[0] === "v1" && base.endsWith("/api/")
      ? segments.slice(1)
      : segments;

  if (!normalizedSegments.length) {
    normalizedSegments = [""];
  }

  const useRoot =
    normalizedSegments.length > 0 &&
    ROOT_PATH_PREFIXES.has(normalizedSegments[0]);
  const prefix = useRoot ? API_BASE_URL.replace(/\/api\/v1$/, "") : base;

  const url = new URL(
    `${prefix}/${normalizedSegments.map(encodeURIComponent).join("/")}`,
  );

  for (const [key, value] of searchParams.entries()) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  }

  return url.toString();
}

async function handleRequest(request, context) {
  try {
    const { path: segments = [] } = await context.params;

    if (!segments.length) {
      return NextResponse.json(
        { message: "API path is required" },
        { status: 400 },
      );
    }

    const method = request.method.toUpperCase();
    const headers = { Accept: "application/json" };

    const authHeader = request.headers.get("authorization");
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const fetchOptions = { method, headers, cache: "no-store" };

    if (!["GET", "HEAD"].includes(method)) {
      const body = await request.text();
      if (body) {
        headers["Content-Type"] =
          request.headers.get("content-type") || "application/json";
        fetchOptions.body = body;
      }
    }

    const response = await fetch(
      buildBackendUrl(segments, request.nextUrl.searchParams),
      fetchOptions,
    );

    const responseText = await response.text();

    // Pass through useful backend headers (pagination counts etc.)
    const resHeaders = new Headers();
    const totalCount = response.headers.get("x-total-count");
    if (totalCount) {
      resHeaders.set("x-total-count", totalCount);
    }

    try {
      return NextResponse.json(JSON.parse(responseText), {
        status: response.status,
        headers: resHeaders,
      });
    } catch {
      return new NextResponse(responseText, {
        status: response.status,
        headers: { "Content-Type": "text/plain", ...Object.fromEntries(resHeaders) },
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unable to reach the backend service",
        detail: error?.message || "Unknown error",
      },
      { status: 502 },
    );
  }
}

export async function GET(request, context) {
  return handleRequest(request, context);
}

export async function POST(request, context) {
  return handleRequest(request, context);
}

export async function PUT(request, context) {
  return handleRequest(request, context);
}

export async function PATCH(request, context) {
  return handleRequest(request, context);
}

export async function DELETE(request, context) {
  return handleRequest(request, context);
}