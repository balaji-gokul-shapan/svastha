import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

// Adjust these two constants if the backend paths change.
const CREATE_SCHOOL_ENDPOINT = "/api/register";
const UPDATE_SCHOOL_ENDPOINT = "/api/v1/school";
const GET_SCHOOL_ENDPOINT = "/api/v1/school";
const GET_ALLSCHOOL_ENDPOINT = "/api/v1/school/all";

const initialState = {
createLoading: false,
updateLoading: false,
getLoading: false,
success: false,
error: null,
createdRecord: null,
updatedRecord: null,
fetchedRecord: null,
getAllLoading: false,
allSchools: [],
};

export const getRegisterSchool = createAsyncThunk(
"registerSchool/getSchool",
async ({ id } = {}, { rejectWithValue, dispatch }) => {
try {
const normalizedId = String(id ?? "").trim();

// READ (GET). With an id it targets /school/:id; without one, the
// endpoint returns the signed-in school''s own profile.
const endpoint = normalizedId
? `${GET_SCHOOL_ENDPOINT}/${encodeURIComponent(normalizedId)}`
: GET_SCHOOL_ENDPOINT;

const { response } = await fetchWithAuth(endpoint, { method: "GET", headers: { Accept: "application/json" } }, dispatch);

if (!response.ok) {
const errorText = await response.text();
throw new Error(errorText || "Failed to load the school profile");
}

return await response.json();
} catch (error) {
return rejectWithValue(
error.message || "Unable to load the school profile",
);
}
},
);

export const getAllRegisterSchool = createAsyncThunk(
"registerSchool/getAllSchool",
async (_, { rejectWithValue, dispatch }) => {
try {
const { response } = await fetchWithAuth(GET_ALLSCHOOL_ENDPOINT, {
method: "GET",
headers: { Accept: "application/json" },
}, dispatch);

if (!response.ok) {
const errorText = await response.text();
throw new Error(errorText || "Failed to load the registered schools");
}

return await response.json();
} catch (error) {
return rejectWithValue(
error.message || "Unable to load the registered schools",
);
}
},
);

export const createRegisterSchool = createAsyncThunk(
"registerSchool/createSchool",
async (payload, { rejectWithValue, dispatch }) => {
try {
const isFormData =
typeof FormData !== "undefined" && payload instanceof FormData;

const fetchOptions = {
method: "POST",
body: isFormData ? payload : JSON.stringify(payload ?? {}),
};

if (!isFormData) {
fetchOptions.headers = { "Content-Type": "application/json" };
}

const { response } = await fetchWithAuth(CREATE_SCHOOL_ENDPOINT, fetchOptions, dispatch);

if (!response.ok) {
const errorText = await response.text();
throw new Error(errorText || "Failed to register the school");
}

return await response.json();
} catch (error) {
return rejectWithValue(
error.message || "Unable to register the school",
);
}
},
);

export const updateRegisterSchool = createAsyncThunk(
"registerSchool/updateSchool",
async ({ id, payload } = {}, { rejectWithValue, dispatch }) => {
try {
const normalizedId = String(id ?? "").trim();

const isFormData =
typeof FormData !== "undefined" && payload instanceof FormData;

const fetchOptions = {
method: "PATCH",
body: isFormData ? payload : JSON.stringify(payload ?? {}),
};

if (!isFormData) {
fetchOptions.headers = { "Content-Type": "application/json" };
}

// WRITE (PATCH). With an id it
// targets /school/branch/profile/:id; without one, the endpoint
// is treated as the signed-in school''s own branch profile.
const endpoint = normalizedId
? `${UPDATE_SCHOOL_ENDPOINT}/${encodeURIComponent(normalizedId)}/update`
: UPDATE_SCHOOL_ENDPOINT;

const { response } = await fetchWithAuth(endpoint, fetchOptions, dispatch);

if (!response.ok) {
const errorText = await response.text();
throw new Error(errorText || "Failed to update the school profile");
}

return await response.json();
} catch (error) {
return rejectWithValue(
error.message || "Unable to update the school profile",
);
}
},
);

const registerSchoolSlice = createSlice({
name: "registerSchool",
initialState,
reducers: {
resetRegisterSchoolState: () => initialState,
},
extraReducers: (builder) => {
builder
.addCase(getAllRegisterSchool.pending, (state) => {
state.getAllLoading = true;
state.error = null;
})
.addCase(getAllRegisterSchool.fulfilled, (state, action) => {
state.getAllLoading = false;
// Tolerate both a raw array and a wrapped { data: [...] } response.
state.allSchools = Array.isArray(action.payload)
? action.payload
: (action.payload?.data ?? []);
})
.addCase(getAllRegisterSchool.rejected, (state, action) => {
state.getAllLoading = false;
state.error =
action.payload || "Unable to load the registered schools";
})
.addCase(getRegisterSchool.pending, (state) => {
state.getLoading = true;
state.error = null;
})
.addCase(getRegisterSchool.fulfilled, (state, action) => {
state.getLoading = false;
state.fetchedRecord = action.payload;
})
.addCase(getRegisterSchool.rejected, (state, action) => {
state.getLoading = false;
state.error = action.payload || "Unable to load the school profile";
})
.addCase(createRegisterSchool.pending, (state) => {
state.createLoading = true;
state.success = false;
state.error = null;
})
.addCase(createRegisterSchool.fulfilled, (state, action) => {
state.createLoading = false;
state.success = true;
state.createdRecord = action.payload;
})
.addCase(createRegisterSchool.rejected, (state, action) => {
state.createLoading = false;
state.success = false;
state.error = action.payload || "Unable to register the school";
})
.addCase(updateRegisterSchool.pending, (state) => {
state.updateLoading = true;
state.success = false;
state.error = null;
})
.addCase(updateRegisterSchool.fulfilled, (state, action) => {
state.updateLoading = false;
state.success = true;
state.updatedRecord = action.payload;
})
.addCase(updateRegisterSchool.rejected, (state, action) => {
state.updateLoading = false;
state.success = false;
state.error = action.payload || "Unable to update the school profile";
});
},
});

export const { resetRegisterSchoolState } = registerSchoolSlice.actions;
export default registerSchoolSlice.reducer;
