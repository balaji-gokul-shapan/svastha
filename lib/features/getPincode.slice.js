import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
const GET_PINCODE_DETAILS = `${process.env.NEXT_PUBLIC_API_URL}/api/pincode/`;

/** A valid Indian pincode is exactly 6 digits. */
export const PINCODE_PATTERN = /^\d{6}$/;

export const normalizePincode = (value) =>
  String(value ?? "")
    .replace(/\D/g, "")
    .slice(0, 6);

const initialState = {
  pincode: "",
  city: "",
  state: "",
  district: "",
  taluk: "",
  country: "",
  options: [],
  loading: false,
  success: false,
  error: null,
};

const clean = (value) => {
  const text = String(value ?? "").trim();
  return !text || text.toUpperCase() === "NA" ? "" : text;
};

const completeness = (entry) =>
  Number(Boolean(entry.city)) +
  Number(Boolean(entry.district)) +
  Number(Boolean(entry.state)) +
  Number(Boolean(entry.taluk));

export const getPincodeDetails = createAsyncThunk(
  "pincode/getPincodeDetails",
  async (pincode, { rejectWithValue }) => {
    const normalized = normalizePincode(pincode);

    if (!normalized) {
      return rejectWithValue("Enter a valid 6-digit pincode.");
    }

    try {
      const response = await fetch(GET_PINCODE_DETAILS + normalized, {
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        return rejectWithValue(
          response.status === 404
            ? "No records found for this pincode."
            : "Unable to look up this pincode. Please try again.",
        );
      }
      const payload = await response.json();
      const rawList = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.data?.data)
            ? payload.data.data
            : [];

      const options = rawList
        .map((entry) => ({
          pincode: clean(entry?.pincode) || normalized,
          city: clean(entry?.city),
          state: clean(entry?.state),
          district: clean(entry?.district),
          taluk: clean(entry?.taluk),
        }))
        .filter((entry) => entry.city || entry.district || entry.taluk);

      if (!options.length) {
        return rejectWithValue("No records found for this pincode.");
      }

      const best = options.reduce((a, b) =>
        completeness(b) > completeness(a) ? b : a,
      );

      return {
        ...best,

        country: "India",
        options,
      };
    } catch (error) {
      return rejectWithValue(
        error?.message || "Unable to look up this pincode. Please try again.",
      );
    }
  },
);

const pincodeSlice = createSlice({
  name: "pincode",
  initialState,
  reducers: {
    resetPincodeState: () => ({ ...initialState }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(getPincodeDetails.pending, (state) => {
        state.loading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getPincodeDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
        Object.assign(state, action.payload);
      })
      .addCase(getPincodeDetails.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload || "Unable to look up this pincode.";

        Object.assign(state, {
          pincode: "",
          city: "",
          state: "",
          district: "",
          taluk: "",
          country: "",
          options: [],
        });
      });
  },
});

/* ---- selectors ---- */
export const selectPincodeState = (state) => state?.pincode ?? initialState;
export const selectPincodeLoading = (state) => Boolean(state?.pincode?.loading);
export const selectPincodeError = (state) => state?.pincode?.error ?? null;
export const selectPincodeOptions = (state) => state?.pincode?.options ?? [];

export const { resetPincodeState } = pincodeSlice.actions;
export default pincodeSlice.reducer;
