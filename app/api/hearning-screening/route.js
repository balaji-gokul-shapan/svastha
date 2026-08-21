import { NextResponse } from "next/server";

function buildBackendUrl(searchParams) {
  const params = new URLSearchParams();

  for (const [key, value] of searchParams.entries()) {
    if (value === undefined || value === null || value === "") {
      continue;
    }
    params.set(key, value);
  }

  const query = params.toString();
  return `http://localhost:5000/hear-test${query ? `?${query}` : ""}`;
}

export async function GET(request) {
  try {
    const backendUrl = buildBackendUrl(request.nextUrl.searchParams);
    const response = await fetch(backendUrl, {
      method: "GET",
      cache: "no-store",
    });

    if (!response.ok) {
      const detail = await response.text();
      return NextResponse.json(
        {
          message: "Failed to fetch hearing screening data",
          detail: detail || response.statusText,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unexpected error while fetching hearing screening data",
        detail: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
