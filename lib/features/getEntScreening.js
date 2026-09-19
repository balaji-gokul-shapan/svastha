import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
	entScreeningData: [],
	loading: false,
	success: false,
	error: null,
};

export const getEntScreening = createAsyncThunk(
	"entScreening/getEntScreening",
	async ({ studentId, campId } = {}, { rejectWithValue, dispatch }) => {
		try {
			const normalizedStudentId = String(studentId ?? "").trim();
			if (!normalizedStudentId) {
				throw new Error("Student ID is required to fetch ENT screening data");
			}

			// campId is optional: "all"/empty means "no camp filter".
			const normalizedCampId = String(campId ?? "").trim();
			const hasCamp = normalizedCampId && normalizedCampId !== "all";

			// Path form: /api/ent-assessment/student/{studentId}/{campId}
			// The camp segment is omitted entirely when no camp is active
			// (mirrors getDentalScreening / getVisionScreening).
			const path = [
				"/api/ent-assessment/student",
				encodeURIComponent(normalizedStudentId),
				hasCamp ? encodeURIComponent(normalizedCampId) : null,
			]
				.filter(Boolean)
				.join("/");

			const { response } = await fetchWithAuth(path, {}, dispatch);

			if (!response.ok) {
				const detail = await response.text();
				throw new Error(detail || "Failed to fetch ENT screening data");
			}

			const data = await response.json();
			return Array.isArray(data)
				? data
				: Array.isArray(data?.data)
					? data.data
					: data?.data && typeof data.data === "object"
						? [data.data]
						: data && typeof data === "object"
							? [data]
							: [];
		} catch (error) {
			return rejectWithValue(error?.message || "Failed to fetch ENT screening data");
		}
	},
);

const getEntScreeningSlice = createSlice({
	name: "getEntScreening",
	initialState,
	reducers: {
		resetEntScreeningState: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(getEntScreening.pending, (state) => {
				state.loading = true;
				state.success = false;
				state.error = null;
			})
			.addCase(getEntScreening.fulfilled, (state, action) => {
				state.loading = false;
				state.success = true;
				state.entScreeningData = action.payload;
			})
			.addCase(getEntScreening.rejected, (state, action) => {
				state.loading = false;
				state.success = false;
				state.error = action.payload || "Failed to fetch ENT screening data";
			});
	},
});

export const { resetEntScreeningState } = getEntScreeningSlice.actions;
export default getEntScreeningSlice.reducer;