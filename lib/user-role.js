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


export const getRoleFromAccount = (account) => {
  const typeId =
    account?.user_type_id ?? account?.userTypeId ?? account?.usertype_id ?? account?.user_type ?? "";
  const fromId = getRoleFromTypeId(typeId);
  if (fromId) return fromId;

  const roleName =
    account?.user_type ?? account?.account_type ?? account?.role ?? "";
  return typeof roleName === "string" ? roleName.trim().toLowerCase() : "";
};


// Human-readable labels for the role strings `useAuthRole` returns. Falls back
// to a title-cased version of the raw value so an unmapped role still reads
// sensibly instead of showing "school_sub_account".
const ROLE_LABELS = {
  admin: "Admin",
  school: "School Admin",
  school_admin: "School Admin",
  school_sub_account: "School Staff",
  doctor: "Doctor",
  teacher: "Teacher",
  staff: "Staff",
  accountant: "Accountant",
};

export const getRoleLabel = (role) => {
  if (typeof role !== "string") return "";
  const key = role.trim().toLowerCase();
  if (!key) return "";
  if (ROLE_LABELS[key]) return ROLE_LABELS[key];

  return key
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
};

export const useAuthRole = (account) => {
  const selectUser = useAppSelector(selectUserAccount);
  const { authUser, isLoading: authUserLoading } = useAuthUser();

  const hasData = (value) =>
    value != null &&
    (typeof value !== "object" || Object.keys(value).length > 0);

  return getRoleFromAccount(
    hasData(account) ? account : hasData(selectUser) ? selectUser : authUser,
  );
};

