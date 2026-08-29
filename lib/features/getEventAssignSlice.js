// import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

// const GET_ALL_EVENT_ASSIGN_USER = "/api/v1/medical-event/assigned";
// const CREATE_EVENT_ENDPOINT = "/api/v1/medical-event";
// // const GET_STUDENT_BY_EVENT = "api/v1/medical-event"
// const initialState = {
//   getLoading: false,
//   createLoading: false,
//   success: false,
//   error: null,
//   createdRecord: null,
//   updatedRecord: null,
//   fetchedRecord: null,
//   allEvents: [],
// };


// function getAuthToken(getState) {
//   const state = typeof getState === "function" ? getState() : null;
//   let token = state?.auth?.token;
//   let tokenType = state?.auth?.token_type || "Bearer";

//   if (!token && typeof window !== "undefined") {
//     try {
//       const rawSession = window.sessionStorage.getItem("svastha-auth");
//       if (rawSession) {
//         const parsed = JSON.parse(rawSession);
//         token = parsed?.token;
//         tokenType = parsed?.token_type || tokenType;
//       }
//     } catch {}
//   }

//   return token ? `${tokenType} ${token}`.trim() : null;
// }

// /**
//  * Backend responses in this family are Laravel paginators wrapped in an
//  * envelope, e.g.:
//  *   { success: true, data: { current_page: 1, data: [ ...records ], total, ... } }
//  * Unwrap to the plain list of records; pass through plain arrays / single
//  * objects untouched.
//  */
// function unwrapListPayload(json) {
//   if (Array.isArray(json)) return json;
//   if (Array.isArray(json?.data?.data)) return json.data.data;
//   if (Array.isArray(json?.data)) return json.data;
//   return json;
// }

// export const getAssignEvent = createAsyncThunk(
//   "event/getAllEventAssignUser",
//   async ({ id } = {}, { rejectWithValue, getState }) => {
//     try {
//       const normalizedId = String(id ?? "").trim();

//       const authToken = getAuthToken(getState);

//       const headers = { Accept: "application/json" };
//       if (authToken) {
//         headers["Authorization"] = authToken;
//       }
//       const endpoint = normalizedId
//         ? `${GET_ALL_EVENT_ASSIGN_USER}/${encodeURIComponent(normalizedId)}`
//         : GET_ALL_EVENT_ASSIGN_USER;

//       const response = await fetch(endpoint, { method: "GET", headers });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(errorText || "Failed to load the assigned events");
//       }

//       const data = await response.json();
//       return unwrapListPayload(data);
//     } catch (error) {
//       return rejectWithValue(
//         error.message || "Unable to load the assigned events",
//       );
//     }
//   },
// );

// export const getStudentByEvent = createAsyncThunk(
//     "event/getStudentByEvent",
//   async ({eventId} = {}, { rejectWithValue, getState }) => {
//     try {
//          const normalizedId = String(eventId ?? "").trim();

//       const authToken = getAuthToken(getState);

//       const headers = { Accept: "application/json" };
//       if (authToken) {
//         headers["Authorization"] = authToken;
//       }
//       const endpoint = normalizedId
//         ? `${CREATE_EVENT_ENDPOINT}/${encodeURIComponent(normalizedId)}/students`
//         : CREATE_EVENT_ENDPOINT;

//       const response = await fetch(endpoint, { method: "GET", headers });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(errorText || "Failed to load the assigned events");
//       }

//       const data = await response.json();
//       return unwrapListPayload(data);
//     } catch (error) {
//       return rejectWithValue(
//         error?.message || "Unable to load students for this event",
//       );
//     }
//   }
// )
// export const createEvent = createAsyncThunk(
//   "event/createEvent",
//   async (payload, { rejectWithValue, getState }) => {
//     try {
//       const authToken = getAuthToken(getState);
//       const isFormData =
//         typeof FormData !== "undefined" && payload instanceof FormData;

//       const headers = {};
//       // Never set Content-Type manually for FormData — the browser must
//       // generate the multipart boundary itself.
//       if (!isFormData) {
//         headers["Content-Type"] = "application/json";
//       }
//       if (authToken) {
//         headers["Authorization"] = authToken;
//       }

//       // CREATE = POST the event payload to the medical-event collection
//       // endpoint.
//       const response = await fetch(CREATE_EVENT_ENDPOINT, {
//         method: "POST",
//         headers,
//         body: isFormData ? payload : JSON.stringify(payload ?? {}),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(errorText || "Failed to create the event");
//       }

//       return await response.json();
//     } catch (error) {
//       return rejectWithValue(error.message || "Unable to create the event");
//     }
//   },
// );

// const getEventAssignSlice = createSlice({
//   name: "eventAssign",
//   initialState,
//   reducers: {
//     resetEventAssignState: () => initialState,
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(getAssignEvent.pending, (state) => {
//         state.getLoading = true;
//         state.success = false;
//         state.error = null;
//       })
//       .addCase(getAssignEvent.fulfilled, (state, action) => {
//         state.getLoading = false;
//         state.success = true;
//         state.fetchedRecord = action.payload;
//         // Payload is already the unwrapped list (see unwrapListPayload);
//         // tolerate a single-record object for by-id fetches.
//         state.allEvents = Array.isArray(action.payload)
//           ? action.payload
//           : action.payload != null
//             ? [action.payload]
//             : [];
//       })
//       .addCase(getAssignEvent.rejected, (state, action) => {
//         state.getLoading = false;
//         state.success = false;
//         state.error = action.payload || "Unable to load the assigned events";
//       })
//       .addCase(getStudentByEvent.pending, (state) => {
//         state.getLoading = true;
//         state.success = false;
//         state.error = null;
//       })
//       .addCase(getStudentByEvent.fulfilled, (state, action) => {
//         state.getLoading = false;
//         state.success = true;
//         state.fetchedRecord = action.payload;
//       })
//       .addCase(getStudentByEvent.rejected, (state, action) => {
//         state.getLoading = false;
//         state.success = false;
//         state.error =
//           action.payload || "Unable to load students for this event";
//       })
//       .addCase(createEvent.pending, (state) => {
//         state.createLoading = true;
//         state.success = false;
//         state.error = null;
//       })
//       .addCase(createEvent.fulfilled, (state, action) => {
//         state.createLoading = false;
//         state.success = true;
//         state.createdRecord = action.payload;
//         // Keep the created event at the front of the loaded list so the UI
//         // reflects it immediately without a refetch.
//         if (action.payload != null) {
//           state.allEvents = [action.payload, ...(state.allEvents ?? [])];
//         }
//       })
//       .addCase(createEvent.rejected, (state, action) => {
//         state.createLoading = false;
//         state.success = false;
//         state.error = action.payload || "Unable to create the event";
//       });
//   },
// });

// export const { resetEventAssignState } = getEventAssignSlice.actions;
// export default getEventAssignSlice.reducer;
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const GET_ALL_EVENT_ASSIGN_USER = "/api/v1/medical-event/assigned";
const CREATE_EVENT_ENDPOINT = "/api/v1/medical-event";
// const GET_STUDENT_BY_EVENT = "api/v1/medical-event"
const initialState = {
  getLoading: false,
  createLoading: false,
  success: false,
  error: null,
  createdRecord: null,
  updatedRecord: null,
  fetchedRecord: null,
  allEvents: [],
};


function getAuthToken(getState) {
  const state = typeof getState === "function" ? getState() : null;
  let token = state?.auth?.token;
  let tokenType = state?.auth?.token_type || "Bearer";

  if (!token && typeof window !== "undefined") {
    try {
      const rawSession = window.sessionStorage.getItem("svastha-auth");
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        token = parsed?.token;
        tokenType = parsed?.token_type || tokenType;
      }
    } catch {}
  }

  return token ? `${tokenType} ${token}`.trim() : null;
}

/**
 * Backend responses in this family are Laravel paginators wrapped in an
 * envelope, e.g.:
 *   { success: true, data: { current_page: 1, data: [ ...records ], total, ... } }
 * Unwrap to the plain list of records; pass through plain arrays / single
 * objects untouched.
 */
function unwrapListPayload(json) {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data?.data)) return json.data.data;
  if (Array.isArray(json?.data)) return json.data;
  return json;
}

export const getAssignEvent = createAsyncThunk(
  "event/getAllEventAssignUser",
  async ({ id } = {}, { rejectWithValue, getState }) => {
    try {
      const normalizedId = String(id ?? "").trim();

      const authToken = getAuthToken(getState);

      const headers = { Accept: "application/json" };
      if (authToken) {
        headers["Authorization"] = authToken;
      }
      const endpoint = normalizedId
        ? `${GET_ALL_EVENT_ASSIGN_USER}/${encodeURIComponent(normalizedId)}`
        : GET_ALL_EVENT_ASSIGN_USER;

      const response = await fetch(endpoint, { method: "GET", headers });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to load the assigned events");
      }

      const data = await response.json();
      return unwrapListPayload(data);
    } catch (error) {
      return rejectWithValue(
        error.message || "Unable to load the assigned events",
      );
    }
  },
);

/**
 * The students-by-event endpoint nests a Laravel paginator inside the
 * event envelope, e.g.:
 *   { success: true,
 *     data: { event: {...},
 *             students: { current_page, data: [...], last_page, total, ... } } }
 * Returns { rows, lastPage } so the thunk can follow pagination.
 */
function extractStudentPage(json) {
  if (Array.isArray(json)) {
    return { rows: json, lastPage: 1 };
  }

  const studentsNode = json?.data?.students;
  if (studentsNode && typeof studentsNode === "object") {
    return {
      rows: Array.isArray(studentsNode.data) ? studentsNode.data : [],
      lastPage: Number(studentsNode.last_page ?? 1) || 1,
    };
  }

  // Fallbacks: a bare paginator at `data`, a bare array at `data`,
  // or nothing usable.
  const dataNode = json?.data;
  if (Array.isArray(dataNode)) {
    return { rows: dataNode, lastPage: 1 };
  }
  if (dataNode && typeof dataNode === "object" && Array.isArray(dataNode.data)) {
    return {
      rows: dataNode.data,
      lastPage: Number(dataNode.last_page ?? 1) || 1,
    };
  }

  return { rows: [], lastPage: 1 };
}

// A camp roster can span many pages (20 students/page). Fetch the
// remaining pages in small parallel batches instead of one-by-one
// sequentially or all at once.
const STUDENT_PAGE_BATCH = 8;
const MAX_STUDENT_PAGES = 200; // safety cap against runaway loops

export const getStudentByEvent = createAsyncThunk(
    "event/getStudentByEvent",
  async ({eventId} = {}, { rejectWithValue, getState }) => {
    try {
         const normalizedId = String(eventId ?? "").trim();

      const authToken = getAuthToken(getState);

      const headers = { Accept: "application/json" };
      if (authToken) {
        headers["Authorization"] = authToken;
      }
      const endpoint = normalizedId
        ? `${CREATE_EVENT_ENDPOINT}/${encodeURIComponent(normalizedId)}/students`
        : CREATE_EVENT_ENDPOINT;

      const fetchPage = async (page) => {
        const response = await fetch(`${endpoint}?page=${page}`, {
          method: "GET",
          headers,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to load students for this event");
        }

        return response.json();
      };

      // Page 1 decides whether there are more pages to pull.
      const first = extractStudentPage(await fetchPage(1));
      let rows = first.rows;

      const lastPage = Math.min(first.lastPage, MAX_STUDENT_PAGES);
      for (
        let batchStart = 2;
        batchStart <= lastPage;
        batchStart += STUDENT_PAGE_BATCH
      ) {
        const batchEnd = Math.min(
          batchStart + STUDENT_PAGE_BATCH - 1,
          lastPage,
        );

        const pages = [];
        for (let page = batchStart; page <= batchEnd; page += 1) {
          pages.push(page);
        }

        const results = await Promise.all(pages.map(fetchPage));
        for (const pageJson of results) {
          rows = rows.concat(extractStudentPage(pageJson).rows);
        }
      }

      return rows;
    } catch (error) {
      return rejectWithValue(
        error?.message || "Unable to load students for this event",
      );
    }
  },
)
export const createEvent = createAsyncThunk(
  "event/createEvent",
  async (payload, { rejectWithValue, getState }) => {
    try {
      const authToken = getAuthToken(getState);
      const isFormData =
        typeof FormData !== "undefined" && payload instanceof FormData;

      const headers = {};
      // Never set Content-Type manually for FormData — the browser must
      // generate the multipart boundary itself.
      if (!isFormData) {
        headers["Content-Type"] = "application/json";
      }
      if (authToken) {
        headers["Authorization"] = authToken;
      }

      // CREATE = POST the event payload to the medical-event collection
      // endpoint.
      const response = await fetch(CREATE_EVENT_ENDPOINT, {
        method: "POST",
        headers,
        body: isFormData ? payload : JSON.stringify(payload ?? {}),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to create the event");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(error.message || "Unable to create the event");
    }
  },
);

const getEventAssignSlice = createSlice({
  name: "eventAssign",
  initialState,
  reducers: {
    resetEventAssignState: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getAssignEvent.pending, (state) => {
        state.getLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getAssignEvent.fulfilled, (state, action) => {
        state.getLoading = false;
        state.success = true;
        state.fetchedRecord = action.payload;
        // Payload is already the unwrapped list (see unwrapListPayload);
        // tolerate a single-record object for by-id fetches.
        state.allEvents = Array.isArray(action.payload)
          ? action.payload
          : action.payload != null
            ? [action.payload]
            : [];
      })
      .addCase(getAssignEvent.rejected, (state, action) => {
        state.getLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to load the assigned events";
      })
      .addCase(getStudentByEvent.pending, (state) => {
        state.getLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(getStudentByEvent.fulfilled, (state, action) => {
        state.getLoading = false;
        state.success = true;
        state.fetchedRecord = action.payload;
      })
      .addCase(getStudentByEvent.rejected, (state, action) => {
        state.getLoading = false;
        state.success = false;
        state.error =
          action.payload || "Unable to load students for this event";
      })
      .addCase(createEvent.pending, (state) => {
        state.createLoading = true;
        state.success = false;
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.createLoading = false;
        state.success = true;
        state.createdRecord = action.payload;
        // Keep the created event at the front of the loaded list so the UI
        // reflects it immediately without a refetch.
        if (action.payload != null) {
          state.allEvents = [action.payload, ...(state.allEvents ?? [])];
        }
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.createLoading = false;
        state.success = false;
        state.error = action.payload || "Unable to create the event";
      });
  },
});

export const { resetEventAssignState } = getEventAssignSlice.actions;
export default getEventAssignSlice.reducer;