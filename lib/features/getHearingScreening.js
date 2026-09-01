import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
	hearingScreeningData: [],
	loading: false,
	success: false,
	error: null,
};

export const getHearingScreening = createAsyncThunk(
	"hearingScreening/getHearingScreening",
	async ({ studentId } = {}, { rejectWithValue, dispatch }) => {
		try {
			const normalizedStudentId = String(studentId ?? "").trim();
			if (!normalizedStudentId) {
				throw new Error("Student ID is required to fetch hearing screening data");
			}

			const { response } = await fetchWithAuth(
				`/api/hear-test/student/${encodeURIComponent(normalizedStudentId)}`,
				{},
				dispatch,
			);

			if (!response.ok) {
				const detail = await response.text();
				throw new Error(detail || "Failed to fetch hearing screening data");
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
			return rejectWithValue(error?.message || "Failed to fetch hearing screening data");
		}
	},
);

const getHearingScreeningSlice = createSlice({
	name: "getHearingScreening",
	initialState,
	reducers: {
		resetHearingScreeningState: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(getHearingScreening.pending, (state) => {
				state.loading = true;
				state.success = false;
				state.error = null;
			})
			.addCase(getHearingScreening.fulfilled, (state, action) => {
				state.loading = false;
				state.success = true;
				state.hearingScreeningData = action.payload;
			})
			.addCase(getHearingScreening.rejected, (state, action) => {
				state.loading = false;
				state.success = false;
				state.error = action.payload || "Failed to fetch hearing screening data";
			});
	},
});

export const { resetHearingScreeningState } = getHearingScreeningSlice.actions;
export default getHearingScreeningSlice.reducer;
