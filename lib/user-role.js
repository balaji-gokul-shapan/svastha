// Reusable user-role helpers: maps a user's `user_type_id` to a role string.

import { selectAuthAccount, selectUserAccount } from "./features/auth-slice";
import { useAppSelector } from "./hooks";
import useAuthUser from "./useAuthUser";

export const USER_ROLES = {
  1: "admin",
  2: "school",
  3: "teacher",
  5: "doctor",
};

export const getRoleFromTypeId = (userTypeId) => {
  const id = Number(userTypeId);
  if (!id || Number.isNaN(id)) return "";
  return USER_ROLES[id] ?? "";
};

// Accepts an account/user object and returns its role string, handling
// numeric `user_type_id` variants AND string role names ("doctor", "Doctor",
// "school_sub_account", …) that come from `user_type` / `account_type`.
export const getRoleFromAccount = (account) => {
  // 1) Numeric id path — user_type_id etc.
  console.log(account,"account");
  
  const typeId =
    account?.user_type_id ?? account?.userTypeId ?? account?.usertype_id ?? account?.user_type ?? "";
  const fromId = getRoleFromTypeId(typeId);
  if (fromId) return fromId;

  // 2) String role-name path — user_type / account_type / role hold names
  //    like "doctor" or "Doctor", NOT numeric ids. Normalised to lowercase
  //    so "Doctor" matches checks for "doctor".
  const roleName =
    account?.user_type ?? account?.account_type ?? account?.role ?? "";
  return typeof roleName === "string" ? roleName.trim().toLowerCase() : "";
};


export const useAuthRole = (account) => {
  const selectUser = useAppSelector(selectUserAccount);
  const { authUser, isLoading: authUserLoading } = useAuthUser();
  console.log(authUser, "authUser in useStudentData");
  
  console.log(authUser,"selectUserdddd");
  
  
  // True when the value carries actual data — null/undefined and empty
  // objects ({} from Redux selectors' defaults) count as "empty".
  // (Plain `a || b` never falls through when a is the truthy {} default.)
  const hasData = (value) =>
    value != null &&
    (typeof value !== "object" || Object.keys(value).length > 0);

  return getRoleFromAccount(
    hasData(account) ? account : hasData(selectUser) ? selectUser : authUser,
  );
};

