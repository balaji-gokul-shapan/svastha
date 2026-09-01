import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
	dentalScreeningData: [],
	loading: false,
	success: false,
	error: null,
};

export const getDentalScreening = createAsyncThunk(
	"dentalScreening/getDentalScreening",
	async ({ studentId } = {}, { rejectWithValue, dispatch }) => {
		try {
			const normalizedStudentId = String(studentId ?? "").trim();
			if (!normalizedStudentId) {
				throw new Error("Student ID is required to fetch dental screening data");
			}

			const { response } = await fetchWithAuth(
				`/api/dental-test/student/${encodeURIComponent(normalizedStudentId)}`,
				{},
				dispatch,
			);

			if (!response.ok) {
				const detail = await response.text();
				throw new Error(detail || "Failed to fetch dental screening data");
			}

			const data = await response.json();
			return (
				Array.isArray(data)
					? data
					: Array.isArray(data?.data)
						? data.data
						: Array.isArray(data?.data?.items)
							? data.data.items
							: Array.isArray(data?.items)
								? data.items
								: Array.isArray(data?.results)
									? data.results
									: Array.isArray(data?.records)
										? data.records
										: data?.data && typeof data.data === "object"
											? [data.data]
											: data && typeof data === "object"
												? [data]
												: []
			);
		} catch (error) {
			return rejectWithValue(error?.message || "Failed to fetch dental screening data");
		}
	},
);

const getDentalScreeningSlice = createSlice({
	name: "getDentalScreening",
	initialState,
	reducers: {
		resetDentalScreeningState: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(getDentalScreening.pending, (state) => {
				state.loading = true;
				state.success = false;
				state.error = null;
			})
			.addCase(getDentalScreening.fulfilled, (state, action) => {
				state.loading = false;
				state.success = true;
				state.dentalScreeningData = action.payload;
			})
			.addCase(getDentalScreening.rejected, (state, action) => {
				state.loading = false;
				state.success = false;
				state.error = action.payload || "Failed to fetch dental screening data";
			});
	},
});

export const { resetDentalScreeningState } = getDentalScreeningSlice.actions;
export default getDentalScreeningSlice.reducer;

