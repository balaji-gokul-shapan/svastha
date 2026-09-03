import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
createLoading: false,
success: false,
error: null,
createdRecord: null,
};

export const createEntScreening = createAsyncThunk(
"registerEntScreening/createEntScreening",
async (payload, { rejectWithValue, dispatch }) => {
try {
const { response } = await fetchWithAuth("/api/ent-assessment", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify(payload ?? {}),
}, dispatch);

if (!response.ok) {
const errorText = await response.text();
let errorPayload;

try {
errorPayload = errorText ? JSON.parse(errorText) : null;
} catch {
errorPayload = errorText;
}

throw errorPayload || { message: "Failed to create ENT screening" };
}

return await response.json();
} catch (error) {
return rejectWithValue(
error || { message: "Unable to create ENT screening" },
);
}
},
);

const registerEntScreeningSlice = createSlice({
name: "registerEntScreening",
initialState,
reducers: {
resetRegisterEntScreeningState: () => initialState,
},
extraReducers: (builder) => {
builder
.addCase(createEntScreening.pending, (state) => {
state.createLoading = true;
state.success = false;
state.error = null;
})
.addCase(createEntScreening.fulfilled, (state, action) => {
state.createLoading = false;
state.success = true;
state.createdRecord = action.payload;
})
.addCase(createEntScreening.rejected, (state, action) => {
state.createLoading = false;
state.success = false;
state.error = action.payload || "Unable to create ENT screening";
});
},
});

export const { resetRegisterEntScreeningState } =
registerEntScreeningSlice.actions;

export default registerEntScreeningSlice.reducer;
