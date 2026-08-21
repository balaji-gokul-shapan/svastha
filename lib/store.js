import { configureStore } from "@reduxjs/toolkit";

import appReducer from "./features/app-slice";
import authReducer, { AUTH_SESSION_KEY } from "./features/auth-slice";
import getAllStudentReducer from "./features/getAllStudentSlice";
import getCampReducer from "./features/getCampSlice";
import getStudentbyCampReducer from "./features/getStudentbyCampSlice";
import getStudentReducer from "./features/getStudentSlice";
import getInitialScreeningSlice from "./features/getInitialScreening";
import getDentalScreeningReducer from "./features/getDentalScreening";
import getHearingScreeningReducer from "./features/getHearingScreening";
import getVisionScreeningReducer from "./features/getVisionScreening";
import getFilterStudentReducer from "./features/getFilterStudent";
import loginReducer from "./features/loginSlice";
import updateStudentReducer from "./features/updateStudentSlice";
import registerGeneralScreeningReducer from "./features/registerGeneralScreening";
import registerDentalScreeningReducer from "./features/registerDentalScreening";
import registerVisionScreeningReducer from "./features/registerVisionScreening";

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    getStudent: getStudentReducer,
    getAllStudent: getAllStudentReducer,
    getCamp: getCampReducer,
    getStudentbyCamp: getStudentbyCampReducer,
    getInitialScreening: getInitialScreeningSlice,
    getDentalScreening: getDentalScreeningReducer,
    getHearingScreening: getHearingScreeningReducer,
    getVisionScreening: getVisionScreeningReducer,
    getFilterStudent: getFilterStudentReducer,
    login: loginReducer,
    updateStudent: updateStudentReducer,
    registerGeneralScreening: registerGeneralScreeningReducer,
    registerDentalScreening: registerDentalScreeningReducer,
    registerVisionScreening: registerVisionScreeningReducer,
  },
});

if (typeof window !== "undefined") {
  store.subscribe(() => {
    const authState = store.getState().auth;

    if (!authState?.isAuthenticated) {
      window.sessionStorage.removeItem(AUTH_SESSION_KEY);
      return;
    }

    window.sessionStorage.setItem(
      AUTH_SESSION_KEY,
      JSON.stringify({
        role: authState.role,
        account_type: authState.account_type,
        username: authState.username,
        user: authState.user,
        token: authState.token,
        token_type: authState.token_type,
        loginAt: authState.loginAt,
      })
    );
  });
}
