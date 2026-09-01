import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

/**
 * Payload shape expected by the backend:
 * {
 *   school_registration_number: "string",
 *   academic_year: "string",
 *   student_name: "string",
 *   gender: "string",
 *   dob: "string",
 *   class: "string",
 *   sec: "string",
 *   admission_number: "string",
 *   student_aadhaar_number: "string",
 *   father_name: "string",
 *   father_contact_number: "string",
 *   father_aadhaar_number: "string",
 *   mother_name: "string",
 *   mother_contact_number: "string",
 *   mother_aadhaar_number: "string",
 *   school_id: 0,
 * }
 */

const PAYLOAD_KEYS = [
"school_registration_number",
"academic_year",
"student_name",
"gender",
"dob",
"class",
"sec",
"admission_number",
"student_aadhaar_number",
"father_name",
"father_contact_number",
"father_aadhaar_number",
"mother_name",
"mother_contact_number",
"mother_aadhaar_number",
"school_id",
];

/** Normalise incoming form values into the exact backend contract. */
export function buildRegisterStudentPayload(values = {}) {
const payload = {};
PAYLOAD_KEYS.forEach((key) => {
const value = values[key];
if (key === "school_id") {
payload.school_id = Number(value) || 0;
return;
}
payload[key] = String(value ?? "").trim();
});
return payload;
}

export const registerStudent = createAsyncThunk(
"registerStudent/registerStudent",
async ({ student: values, profileImage } = {}, { rejectWithValue, dispatch }) => {
try {
const body = buildRegisterStudentPayload(values);

if (!body.student_name) {
throw new Error("Student name is required.");
}
if (!body.school_registration_number) {
throw new Error("School registration number is required.");
}
if (!body.academic_year) {
throw new Error("Academic year is required.");
}
if (!body.class) {
throw new Error("Class is required.");
}
if (!body.sec) {
throw new Error("Section is required.");
}
if (!body.gender) {
throw new Error("Gender is required.");
}
if (!body.dob) {
throw new Error("Date of birth is required.");
}
if (!body.school_id || Number(body.school_id) < 1) {
throw new Error("A valid School ID is required.");
}

let fetchOptions;
if (profileImage instanceof File) {
// Multipart so the backend can persist the optional profile photo
// alongside the student record. No Content-Type here  the browser
// sets the multipart boundary automatically.
const formData = new FormData();
PAYLOAD_KEYS.forEach((key) => {
formData.append(key, String(body[key]));
});
formData.append("profile_image", profileImage);
fetchOptions = { method: "POST", body: formData };
} else {
fetchOptions = {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(body),
};
}

const { response } = await fetchWithAuth("/api/students", fetchOptions, dispatch);

const responseText = await response.text();

if (!response.ok) {
// Backend validation errors usually arrive as JSON  surface the
// human-readable detail when we can.
let detail = null;
try {
const parsed = responseText ? JSON.parse(responseText) : null;
detail =
parsed?.detail || parsed?.message || responseText || null;
} catch {
detail = responseText || null;
}
throw new Error(detail || "Failed to register student.");
}

try {
return responseText ? JSON.parse(responseText) : null;
} catch {
return responseText;
}
} catch (error) {
return rejectWithValue(
error?.message || "Unable to register the student.",
);
}
},
);

const initialState = {
loading: false,
success: false,
error: null,
createdStudent: null,
};

const registerStudentSlice = createSlice({
name: "registerStudent",
initialState,
reducers: {
resetRegisterStudentState: () => initialState,
},
extraReducers: (builder) => {
builder
.addCase(registerStudent.pending, (state) => {
state.loading = true;
state.success = false;
state.error = null;
state.createdStudent = null;
})
.addCase(registerStudent.fulfilled, (state, action) => {
state.loading = false;
state.success = true;
state.createdStudent = action.payload;
})
.addCase(registerStudent.rejected, (state, action) => {
state.loading = false;
state.success = false;
state.error = action.payload || "Unable to register the student.";
});
},
});

export const { resetRegisterStudentState } = registerStudentSlice.actions;
export default registerStudentSlice.reducer;
