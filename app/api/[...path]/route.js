import { NextResponse } from "next/server";

const API_BASE_URL = (
  process.env.API_URL || "http://localhost:5000/api/v1"
).replace(/\/+$/, "");

const API_PATH_PREFIXES = new Set([
  "login",
  "register",
]);

function buildBackendUrl(segments, searchParams) {
  if (!segments?.length) {
    throw new Error("API path is required");
  }

  let normalizedSegments = [...segments];

  const firstSegment = normalizedSegments[0];

  /*
   * /api/v1/students
   *
   * If API_URL already ends with /api/v1,
   * remove the frontend v1 to prevent:
   *
   * /api/v1/v1/students
   */
  if (
    normalizedSegments[0] === "v1" &&
    API_BASE_URL.endsWith("/api/v1")
  ) {
    normalizedSegments = normalizedSegments.slice(1);
  }

  /*
   * LOGIN / REGISTER
   *
   * /api/login
   *      ↓
   * https://svastha-awwpi.sms24hrs.org/api/login
   *
   * /api/register
   *      ↓
   * https://svastha-awwpi.sms24hrs.org/api/register
   */
  let prefix = API_BASE_URL;

  if (API_PATH_PREFIXES.has(firstSegment)) {
    prefix = API_BASE_URL.replace(/\/api\/v1$/, "/api");
  }

  /*
   * Everything else:
   *
   * /api/students
   *      ↓
   * https://svastha-awwpi.sms24hrs.org/api/v1/students
   */

  const url = new URL(
    `${prefix}/${normalizedSegments
      .map(encodeURIComponent)
      .join("/")}`,
  );

  for (const [key, value] of searchParams.entries()) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  }

  console.log("=================================");
  console.log("API_BASE_URL:", API_BASE_URL);
  console.log("segments:", segments);
  console.log("backend URL:", url.toString());
  console.log("=================================");

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

    const headers = {
      Accept: "application/json",
    };

    const authHeader = request.headers.get("authorization");

    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const fetchOptions = {
      method,
      headers,
      cache: "no-store",
    };

    if (!["GET", "HEAD"].includes(method)) {
      const body = await request.text();

      if (body) {
        headers["Content-Type"] =
          request.headers.get("content-type") ||
          "application/json";

        fetchOptions.body = body;
      }
    }

    const backendUrl = buildBackendUrl(
      segments,
      request.nextUrl.searchParams,
    );

    const response = await fetch(backendUrl, fetchOptions);

    const responseText = await response.text();

    const resHeaders = new Headers();

    const totalCount = response.headers.get(
      "x-total-count",
    );

    if (totalCount) {
      resHeaders.set(
        "x-total-count",
        totalCount,
      );
    }

    try {
      return NextResponse.json(
        JSON.parse(responseText),
        {
          status: response.status,
          headers: resHeaders,
        },
      );
    } catch {
      return new NextResponse(
        responseText,
        {
          status: response.status,
          headers: {
            "Content-Type":
              response.headers.get(
                "content-type",
              ) || "text/plain",
          },
        },
      );
    }
  } catch (error) {
    console.error(
      "Proxy error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Unable to reach backend service",
        detail:
          error?.message ||
          "Unknown error",
      },
      { status: 502 },
    );
  }
}

export async function GET(
  request,
  context,
) {
  return handleRequest(
    request,
    context,
  );
}

export async function POST(
  request,
  context,
) {
  return handleRequest(
    request,
    context,
  );
}

export async function PUT(
  request,
  context,
) {
  return handleRequest(
    request,
    context,
  );
}

export async function PATCH(
  request,
  context,
) {
  return handleRequest(
    request,
    context,
  );
}

export async function DELETE(
  request,
  context,
) {
  return handleRequest(
    request,
    context,
  );
}
