import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const INITIAL_SCREENING_ENDPOINT = "http://localhost:5000/initial-Screening";

const initialState = {
	createLoading: false,
	updateLoading: false,
	success: false,
	error: null,
	createdRecord: null,
	updatedRecord: null,
};

function getAuthToken(getState) {
	const state = typeof getState === "function" ? getState() : null;
	let token = state?.auth?.token;
	let tokenType = state?.auth?.token_type || "Bearer";

	if (!token && typeof window !== "undefined") {
		try {
			const rawSession = window.sessionStorage.getItem("svastha-auth");
			if (rawSession) {
				const parsed = JSON.parse(rawSession);
				token = parsed?.token;
				tokenType = parsed?.token_type || tokenType;
			}
		} catch {}
	}

	return token ? `${tokenType} ${token}`.trim() : null;
}

export const createInitialScreening = createAsyncThunk(
	"registerGeneralScreening/createInitialScreening",
	async (payload, { rejectWithValue, getState }) => {
		try {
			const authToken = getAuthToken(getState);
			const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;

			const headers = {};
			if (!isFormData) {
				headers["Content-Type"] = "application/json";
			}
			if (authToken) {
				headers["Authorization"] = authToken;
			}

			const endpoint = `/api/v1/general-screenings`;

			const response = await fetch(endpoint, {
				method: "POST",
				headers,
				body: isFormData ? payload : JSON.stringify(payload ?? {}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || "Failed to create general screening");
			}

			return await response.json();
		} catch (error) {
			return rejectWithValue(error.message || "Unable to create general screening");
		}
	},
);

export const updateInitialScreening = createAsyncThunk(
	"registerGeneralScreening/updateInitialScreening",
	async ({ id, studentId, payload }, { rejectWithValue, getState }) => {
		try {
			const targetId = id || studentId;
			const normalizedId = String(targetId ?? "").trim();
			if (!normalizedId) {
				throw new Error("Screening or Student ID is required for update");
			}

			const authToken = getAuthToken(getState);
			const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;

			const headers = {};
			if (!isFormData) {
				headers["Content-Type"] = "application/json";
			}
			if (authToken) {
				headers["Authorization"] = authToken;
			}

			const endpoint = `/api/v1/general-screenings/${encodeURIComponent(normalizedId)}`;
			const response = await fetch(endpoint, {
				method: "PUT",
				headers,
				body: isFormData ? payload : JSON.stringify(payload ?? {}),
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(errorText || "Failed to update general screening");
			}

			return await response.json();
		} catch (error) {
			return rejectWithValue(error.message || "Unable to update general screening");
		}
	},
);

const registerGeneralScreeningSlice = createSlice({
	name: "registerGeneralScreening",
	initialState,
	reducers: {
		resetRegisterGeneralScreeningState: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(createInitialScreening.pending, (state) => {
				state.createLoading = true;
				state.success = false;
				state.error = null;
			})
			.addCase(createInitialScreening.fulfilled, (state, action) => {
				state.createLoading = false;
				state.success = true;
				state.createdRecord = action.payload;
			})
			.addCase(createInitialScreening.rejected, (state, action) => {
				state.createLoading = false;
				state.success = false;
				state.error = action.payload || "Unable to create initial screening";
			})
			.addCase(updateInitialScreening.pending, (state) => {
				state.updateLoading = true;
				state.success = false;
				state.error = null;
			})
			.addCase(updateInitialScreening.fulfilled, (state, action) => {
				state.updateLoading = false;
				state.success = true;
				state.updatedRecord = action.payload;
			})
			.addCase(updateInitialScreening.rejected, (state, action) => {
				state.updateLoading = false;
				state.success = false;
				state.error = action.payload || "Unable to update initial screening";
			});
	},
});

export const { resetRegisterGeneralScreeningState } =
	registerGeneralScreeningSlice.actions;

export default registerGeneralScreeningSlice.reducer;
