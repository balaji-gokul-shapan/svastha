import { NextResponse } from "next/server";


const API_BASE_URL = (
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

// Paths that live at the backend ROOT instead of under /api/v1.
// Key = first segment of the incoming /api/<key>/... request.
const ROOT_PATH_PREFIXES = new Set(["doctor-camps"]);

// Paths that live under /api but NOT under /api/v1.
const API_PATH_PREFIXES = new Set(["login", "register"]);

function buildBackendUrl(segments, searchParams) {
  // Use the configured base as-is when it already carries an /api path
  // (ends with /api or /api/v1). Only when the base is a bare host do we
  // append the standard /api/v1 prefix.
  const base = /\/api(\/v1)?$/.test(API_BASE_URL)
    ? API_BASE_URL.replace(/\/+$/, "")
    : `${API_BASE_URL.replace(/\/+$/, "")}/api/v1`;

  // Frontend paths like /api/v1/students/filter include a redundant "v1"
  // segment while the base URL already targets /api/v1 — drop it to avoid
  // producing /api/v1/v1/... on the backend.
  let normalizedSegments =
    segments[0] === "v1" && base.endsWith("/api/v1")
      ? segments.slice(1)
      : segments;

  if (!normalizedSegments.length) {
    normalizedSegments = [""];
  }

  const firstSegment = normalizedSegments[0];
  const useRoot = ROOT_PATH_PREFIXES.has(firstSegment);
  const useApi = API_PATH_PREFIXES.has(firstSegment);

  let prefix;
  if (useRoot) {
    // Strip /api/v1 to get bare host (e.g., /doctor-camps)
    prefix = API_BASE_URL.replace(/\/+$/, "").replace(/\/api\/v1$/, "");
  } else if (useApi) {
    // Keep /api but remove /v1 (e.g., /api/login)
    prefix = API_BASE_URL.replace(/\/+$/, "").replace(/\/api\/v1$/, "/api");
  } else {
    // Default: use the resolved /api/v1 base
    prefix = base;
  }

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

    // Shared hosts (LiteSpeed/Apache, e.g. Hostinger) reject PUT/PATCH/DELETE
    // with a server-level 403 HTML page before the request ever reaches the
    // Laravel backend — GET/POST pass through fine (verified by probing).
    // Laravel supports method spoofing: resend these verbs as POST with an
    // _method override in the JSON body.
    let effectiveMethod = method;
    let outBody = fetchOptions.body;
    const contentType = headers["Content-Type"] || "";

    if (
      ["PUT", "PATCH", "DELETE"].includes(method) &&
      !contentType.startsWith("multipart/")
    ) {
      let overridePayload = {};
      if (outBody) {
        try {
          const parsed = JSON.parse(outBody);
          // Only merge into plain objects — arrays/scalars are replaced by
          // the override body (all app payloads are objects).
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            overridePayload = parsed;
          }
        } catch {
          // Non-JSON body: spoof with just the method override.
        }
      }
      overridePayload._method = method;
      effectiveMethod = "POST";
      headers["Content-Type"] = "application/json";
      outBody = JSON.stringify(overridePayload);
    }

    const response = await fetch(
      buildBackendUrl(segments, request.nextUrl.searchParams),
      { ...fetchOptions, method: effectiveMethod, body: outBody },
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
      // Non-JSON upstream body — usually a server-level HTML error page
      // (Hostinger 403/500 templates). Wrap it so clients get a clean JSON
      // message instead of raw markup.
      if (/<html[\s>]|<!doctype html/i.test(responseText)) {
        return NextResponse.json(
          {
            message: `The API server rejected this request (HTTP ${response.status}) before it reached the application — likely a hosting firewall/security rule.`,
            serverErrorPage: true,
          },
          { status: response.status, headers: resHeaders },
        );
      }
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