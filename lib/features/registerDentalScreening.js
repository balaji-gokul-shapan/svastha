import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
createLoading: false,
success: false,
error: null,
createdRecord: null,
};

export const createDentalScreening = createAsyncThunk(
"registerDentalScreening/createDentalScreening",
async (payload, { rejectWithValue, dispatch }) => {
try {
const { response } = await fetchWithAuth("/api/dental-test/create", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload),
}, dispatch);

if (!response.ok) {
const errorText = await response.text();
let errorPayload;

try {
errorPayload = errorText ? JSON.parse(errorText) : null;
} catch {
errorPayload = errorText;
}

throw errorPayload || { message: "Failed to create dental screening" };
}

return await response.json();
} catch (error) {
return rejectWithValue(
error || { message: "Unable to create dental screening" },
);
}
},
);

const registerDentalScreeningSlice = createSlice({
name: "registerDentalScreening",
initialState,
reducers: {
resetRegisterDentalScreeningState: () => initialState,
},
extraReducers: (builder) => {
builder
.addCase(createDentalScreening.pending, (state) => {
state.createLoading = true;
state.success = false;
state.error = null;
})
.addCase(createDentalScreening.fulfilled, (state, action) => {
state.createLoading = false;
state.success = true;
state.createdRecord = action.payload;
})
.addCase(createDentalScreening.rejected, (state, action) => {
state.createLoading = false;
state.success = false;
state.error = action.payload || "Unable to create dental screening";
});
},
});

export const { resetRegisterDentalScreeningState } =
registerDentalScreeningSlice.actions;

export default registerDentalScreeningSlice.reducer;
