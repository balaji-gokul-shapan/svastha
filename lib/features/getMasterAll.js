import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
	screeningMasterData: [],
	loading: false,
	success: false,
	error: null,
};


function normalizeMasterData(data) {
	if (Array.isArray(data)) {
		return data;
	}

	if (Array.isArray(data?.data)) {
		return data.data;
	}

	if (data?.data && typeof data.data === "object") {
		return [data.data];
	}

	if (data && typeof data === "object") {
		return [data];
	}

	return [];
}

export const getAllMasterScreening = createAsyncThunk(
	"allMasterScreening/getAllMasterScreening",
	async (_, { rejectWithValue, dispatch }) => {
		try {
			const { response } = await fetchWithAuth("/api/masters/all", {}, dispatch);

			if (!response.ok) {
				const detail = await response.text();
				throw new Error(detail || "Failed to fetch Screening Master screening data");
			}

			const data = await response.json();
			return normalizeMasterData(data);
		} catch (error) {
			return rejectWithValue(error?.message || "Failed to fetch Master screening data");
		}
	},
);

const getAllMasterScreeningSlice = createSlice({
	name: "getAllMasterScreening",
	initialState,
	reducers: {
		resetAllMasterScreeningState: () => initialState,
	},
	extraReducers: (builder) => {
		builder
			.addCase(getAllMasterScreening.pending, (state) => {
				state.loading = true;
				state.success = false;
				state.error = null;
			})
			.addCase(getAllMasterScreening.fulfilled, (state, action) => {
				state.loading = false;
				state.success = true;
				state.screeningMasterData = action.payload;
			})
			.addCase(getAllMasterScreening.rejected, (state, action) => {
				state.loading = false;
				state.success = false;
				state.error = action.payload || "Failed to fetch Master screening data";
			});
	},
});

export const { resetAllMasterScreeningState } = getAllMasterScreeningSlice.actions;
export default getAllMasterScreeningSlice.reducer;