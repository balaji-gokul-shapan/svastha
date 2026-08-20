import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
	hearingScreeningData: [],
	loading: false,
	success: false,
	error: null,
};

export const getHearingScreening = createAsyncThunk(
	"hearingScreening/getHearingScreening",
	async (params = {}, { rejectWithValue }) => {
		try {
			const searchParams = new URLSearchParams();

			Object.entries(params).forEach(([key, value]) => {
				if (value === undefined || value === null || value === "") {
					return;
				}

				searchParams.set(key, String(value));
			});

			const query = searchParams.toString();
			const response = await fetch(`http://localhost:5000/hearing-screening${query ? `?${query}` : ""}`);

			if (!response.ok) {
				const detail = await response.text();
				throw new Error(detail || "Failed to fetch hearing screening data");
			}

			const data = await response.json();
			return Array.isArray(data) ? data : [];
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
