import { NextResponse } from "next/server";

function toBase64DataUrl(file) {
  return file.arrayBuffer().then((buffer) => {
    const mimeType = file.type || "application/octet-stream";
    const base64 = Buffer.from(buffer).toString("base64");
    return `data:${mimeType};base64,${base64}`;
  });
}

async function parseRequestPayload(request) {
  const contentType = request.headers.get("content-type") || "";

  if (!contentType.includes("multipart/form-data")) {
    return await request.json();
  }

  const formData = await request.formData();
  const payload = {};

  for (const [key, value] of formData.entries()) {
    if (value instanceof File) {
      if (value.size === 0) {
        continue;
      }

      const dataUrl = await toBase64DataUrl(value);

      // Keep a backend-friendly field name while still preserving the original key.
      if (key === "profileImage") {
        payload.profile_image = dataUrl;
      }
      payload[key] = dataUrl;
      continue;
    }

    payload[key] = String(value);
  }

  return payload;
}

function normalizePayloadForBackend(payload) {
  const keyMap = {
    studentName: "student_name",
    schoolRegistrationNumber: "school_registration_number",
    admissionNumber: "admission_number",
    section: "sec",
    fatherName: "father_name",
    fatherContactNumber: "father_contact_number",
    fatherAadhaarNumber: "father_aadhaar_number",
    motherName: "mother_name",
    motherContactNumber: "mother_contact_number",
    motherAadhaarNumber: "mother_aadhaar_number",
    studentAadhaarNumber: "student_aadhaar_number",
    profileImage: "profile_image",
  };

  const normalized = { ...payload };

  for (const [fromKey, toKey] of Object.entries(keyMap)) {
    if (!(fromKey in normalized)) {
      continue;
    }

    const value = normalized[fromKey];
    normalized[toKey] = value;
  }

  // Keep list view and detail view consistent by syncing display name.
  if (typeof normalized.student_name === "string" && normalized.student_name.trim()) {
    normalized.name = normalized.student_name.trim();
  }

  return normalized;
}

function isFiniteRecordId(value) {
  if (value === null || value === undefined) {
    return false;
  }

  const n = Number(value);
  return Number.isFinite(n);
}

async function patchStudentById(recordId, payload) {
  return fetch(`http://localhost:5000/students/${encodeURIComponent(String(recordId))}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

async function resolveRecordIdFromStudentCode(studentCode) {
  const searchParams = new URLSearchParams({
    studentId: String(studentCode),
    _limit: "1",
  });

  const response = await fetch(`http://localhost:5000/students?${searchParams.toString()}`);
  if (!response.ok) {
    return null;
  }

  const rows = await response.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    return null;
  }

  return rows[0]?.id ?? null;
}

async function getErrorDetail(response) {
  try {
    const errorBody = await response.json();
    if (errorBody && typeof errorBody === "object") {
      return JSON.stringify(errorBody);
    }
  } catch {}

  try {
    const errorText = await response.text();
    return errorText || response.statusText;
  } catch {
    return response.statusText;
  }
}

export async function PATCH(request, { params }) {
  try {
    const resolvedParams = await Promise.resolve(params);
    const idFromParams = resolvedParams?.studentId;
    const idFromPath = request.nextUrl.pathname
      .split("/")
      .filter(Boolean)
      .at(-1);
    const rawId = idFromParams ?? idFromPath;
    const studentId = decodeURIComponent(String(rawId ?? "")).trim();

    if (!studentId) {
      return NextResponse.json(
        { message: "Student ID is required" },
        { status: 400 },
      );
    }

    const rawPayload = await parseRequestPayload(request);
    const payload = normalizePayloadForBackend(rawPayload);
    let response;

    if (isFiniteRecordId(studentId)) {
      response = await patchStudentById(studentId, payload);
    } else {
      const resolvedRecordId = await resolveRecordIdFromStudentCode(studentId);
      if (resolvedRecordId === null || resolvedRecordId === undefined) {
        return NextResponse.json(
          {
            message: "Failed to update student",
            detail: `No student found for identifier: ${studentId}`,
          },
          { status: 404 },
        );
      }

      response = await patchStudentById(resolvedRecordId, payload);
    }

    if (!response.ok) {
      const detail = await getErrorDetail(response);
      return NextResponse.json(
        {
          message: "Failed to update student",
          detail,
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        message: "Unexpected error while updating student",
        detail: error?.message || "Unknown error",
      },
      { status: 500 },
    );
  }
}
