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

function getRequestOptions(method, payload) {
	const isFormData = typeof FormData !== "undefined" && payload instanceof FormData;

	return {
		method,
		headers: isFormData ? undefined : { "Content-Type": "application/json" },
		body: isFormData ? payload : JSON.stringify(payload ?? {}),
	};
}

export const createInitialScreening = createAsyncThunk(
	"registerGeneralScreening/createInitialScreening",
	async (payload, { rejectWithValue }) => {
		try {
			const response = await fetch(
				INITIAL_SCREENING_ENDPOINT,
				getRequestOptions("POST", payload),
			);

			if (!response.ok) {
				throw new Error("Failed to create initial screening");
			}

			return await response.json();
		} catch (error) {
			return rejectWithValue(error.message || "Unable to create initial screening");
		}
	},
);

export const updateInitialScreening = createAsyncThunk(
	"registerGeneralScreening/updateInitialScreening",
	async ({ id, payload }, { rejectWithValue }) => {
		try {
			const normalizedId = String(id ?? "").trim();
			if (!normalizedId) {
				throw new Error("Initial screening ID is required for update");
			}

			const endpoint = `${INITIAL_SCREENING_ENDPOINT}/${encodeURIComponent(normalizedId)}`;
			const response = await fetch(endpoint, getRequestOptions("PATCH", payload));

			if (!response.ok) {
				throw new Error("Failed to update initial screening");
			}

			return await response.json();
		} catch (error) {
			return rejectWithValue(error.message || "Unable to update initial screening");
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
