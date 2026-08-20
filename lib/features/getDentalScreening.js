import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
	dentalScreeningData: [],
	loading: false,
	success: false,
	error: null,
};

export const getDentalScreening = createAsyncThunk(
	"dentalScreening/getDentalScreening",
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
			const response = await fetch(`http://localhost:5000/dental-screening${query ? `?${query}` : ""}`);

			if (!response.ok) {
				const detail = await response.text();
				throw new Error(detail || "Failed to fetch dental screening data");
			}

			const data = await response.json();
			return Array.isArray(data) ? data : [];
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

