import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { fetchWithAuth } from "../auth-utils";

const initialState = {
  dentalCodingData: [],
  loading: false,
  loadingMore: false,
  codingPage: 0,
  codingTotal: 0,
  codingLastPage: 1,
  codingSearch: "",
  success: false,
  error: null,
};

const GET_DENTAL_CODING_DATA = "/api/masters/dental-codings/all";

export const getDentalCodingScreening = createAsyncThunk(
  "dentalScreening/getDentalCodingScreening",
  async (params = {}, { rejectWithValue, dispatch }) => {
    try {
      const page = Number(params.page) > 0 ? Number(params.page) : 1;
      const perPage = Number(params.perPage) > 0 ? Number(params.perPage) : 50;
      const query = new URLSearchParams({
        per_page: String(perPage),
        page: String(page),
      });
      if (String(params.search ?? "").trim()) {
        query.set("search", String(params.search).trim());
      }
      const { response } = await fetchWithAuth(
        `${GET_DENTAL_CODING_DATA}?${query.toString()}`,
        {},
        dispatch,
      );
      if (!response.ok) {
        const detail = await response.text();
        let detailMessage;
        try {
          detailMessage = detail ? JSON.parse(detail)?.message : null;
        } catch {
          detailMessage = detail;
        }
        throw new Error(detailMessage || "Failed to fetch dental coding data");
      }

      const result = await response.json();
      const responsePayload =
        Array.isArray(result) ? result[0] ?? {} : result ?? {};
      const payload =
        responsePayload?.data && !Array.isArray(responsePayload.data)
          ? responsePayload.data
          : responsePayload;
      const items = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload.items)
          ? payload.items
          : Array.isArray(payload.results)
            ? payload.results
            : Array.isArray(payload.records)
              ? payload.records
              : [];

      return {
        items,
        currentPage: Number(payload.current_page ?? page),
        lastPage: Number(payload.last_page ?? page),
        total: Number(payload.total ?? items.length),
      };
    } catch (error) {
      return rejectWithValue(
        error?.message || "Failed to fetch dental coding data",
      );
    }
  },
);

const getDentalCodingSlice = createSlice({
  name: "getDentalCoding",
  initialState,
  reducers: {
    resetDentalCodingState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getDentalCodingScreening.pending, (state, action) => {
        const page = Number(action.meta.arg?.page ?? 1);
        state.loading = page === 1;
        state.loadingMore = page > 1;
        state.success = false;
        state.error = null;
      })
      .addCase(getDentalCodingScreening.fulfilled, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.success = true;
        const requestedPage = Number(action.meta.arg?.page ?? 1);
        const requestedSearch = String(action.meta.arg?.search ?? "").trim();
        const { items, lastPage, total } = action.payload;
        if (
          requestedPage < state.codingPage &&
          requestedSearch === state.codingSearch
        ) {
          return;
        }
        const codingByKey = new Map(
          (requestedPage === 1 ? [] : state.dentalCodingData).map((item) => [
            item.id ?? item.code,
            item,
          ]),
        );
        items.forEach((item) => {
          codingByKey.set(item.id ?? item.code, item);
        });
        state.dentalCodingData = Array.from(codingByKey.values());
        state.codingPage = requestedPage;
        state.codingLastPage = lastPage;
        state.codingTotal = total;
        state.codingSearch = requestedSearch;
      })
      .addCase(getDentalCodingScreening.rejected, (state, action) => {
        state.loading = false;
        state.loadingMore = false;
        state.success = false;
        state.error = action.payload || "Failed to fetch dental coding data";
      });
  },
});

export const { resetDentalCodingState } = getDentalCodingSlice.actions;
export default getDentalCodingSlice.reducer;
