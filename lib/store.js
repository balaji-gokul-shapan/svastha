import { configureStore } from "@reduxjs/toolkit";

import { AUTH_SESSION_KEY } from "./auth-utils";
import appReducer from "./features/app-slice";
import authReducer from "./features/auth-slice";
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
import registerUserReducer from "./features/registerUserSlice";
import updateStudentReducer from "./features/updateStudentSlice";
import registerStudentReducer from "./features/registerStudentSlice";
import registerGeneralScreeningReducer from "./features/registerGeneralScreening";
import registerDentalScreeningReducer from "./features/registerDentalScreening";
import registerVisionScreeningReducer from "./features/registerVisionScreening";
import importStudentsReducer from "./features/importStudentsSlice";
import getEntScreeningReducer from "./features/getEntScreening";
import getImmunizationReducer from "./features/getimmunizationSlice";
import getDentalCodingsReducer from "./features/getDentalCodingsSlice";
import getDentalConditionsReducer from "./features/getDentalConditions";
import registerEntScreeningReducer from "./features/registerEntScreening";
import getAllMasterScreening from "./features/masterScreeningSlice";
import screeningTypesReducer from "./features/getAllScreeningTypes";
import reportSettingsReducer from "./features/reportSettingsSlice";
import appearanceSettingsReducer from "./features/appearanceSettingSlice";
import deleteStudentReducer from './features/DeleteStudentSlice';
import registerSchoolReducer from "./features/registerSchoolSlice";
import registerSchoolBranchReducer from "./features/registerSchoolBranchSlice";
import registerStaffAccountReducer from "./features/registerStaffAccount";
import getEventAssignReducer from "./features/getEventAssignSlice";
import registerScreeningReducer from "./features/registerScreeningSlice"
// import registerSchoolBranchReducer from "./features/getSchoolBranchSlice"

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
    registerUser: registerUserReducer,
    updateStudent: updateStudentReducer,
    registerStudent: registerStudentReducer,
    registerGeneralScreening: registerGeneralScreeningReducer,
    registerDentalScreening: registerDentalScreeningReducer,
    registerVisionScreening: registerVisionScreeningReducer,
    importStudents: importStudentsReducer,
    getEntScreening: getEntScreeningReducer,
    registerEntScreening: registerEntScreeningReducer,
    getImmunization: getImmunizationReducer,
    getDentalCoding: getDentalCodingsReducer,
    getDentalConditions: getDentalConditionsReducer,
    masterScreeningRecord: getAllMasterScreening,
    screeningTypes: screeningTypesReducer,
    reportSettings: reportSettingsReducer,
    appearanceSettings: appearanceSettingsReducer,
    deleteStudentRecord: deleteStudentReducer,
    registerSchool: registerSchoolReducer,
    registerSchoolBranch: registerSchoolBranchReducer,
    eventAssign: getEventAssignReducer,
    registerStaffAccount: registerStaffAccountReducer,
    registerScreeening: registerScreeningReducer,
  },
});

if (typeof window !== "undefined") {
  
  const AUTH_COOKIE_NAME = "svastha-auth";

  const syncAuthCookie = (authState) => {
    if (!authState?.isAuthenticated) {
      document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`;
      return;
    }

    // Store the effective role (not just a flag) so middleware.js can enforce
    // role-based route access server-side.
    const role = authState?.account_type ?? authState?.role ?? "";
    const cookieValue = role ? encodeURIComponent(String(role)) : "1";

    document.cookie = `${AUTH_COOKIE_NAME}=${cookieValue}; path=/; samesite=lax`;
  };


  syncAuthCookie(store.getState().auth);

  store.subscribe(() => {
    const authState = store.getState().auth;

    if (!authState?.isAuthenticated) {
      window.sessionStorage.removeItem(AUTH_SESSION_KEY);
      syncAuthCookie(null);
      return;
    }

    syncAuthCookie(authState);

    window.sessionStorage.setItem(
      AUTH_SESSION_KEY,
      JSON.stringify({
        role: authState.role,
        account_type: authState.account_type,
        username: authState.username,
        user: authState.user,
        token: authState.token,
        token_type: authState.token_type,
        refresh_token: authState.refresh_token,
        expires_in: authState.expires_in,
        loginAt: authState.loginAt,
        account: authState.account,
      })
    );
  });
}
