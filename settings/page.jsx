"use client";

// import React, { useMemo, useRef, useState } from "react";
// import { toast } from "sonner";
// import dynamic from "next/dynamic";

// import Aside from "./pages/aside";

// import { useAppDispatch, useAppSelector } from "@/lib/hooks";
// import { selectAuthUser } from "@/lib/features/auth-slice";
// import { settingsNav } from "./datas/settingsData";
// import { setReportField } from "@/lib/features/reportSettingsSlice";
// import {
//   setAppearanceField,
//   resetAppearanceSettings,
// } from "@/lib/features/appearanceSettingSlice";

// // Lazy-loaded per tab so opening Settings only loads the active tab's code.
// // (Report drags in the PDF/cropper libs; Profile drags in the image cropper.)
// const AppearancePage = dynamic(() => import("./pages/AppearancePage"));
// const MyDetailsPage = dynamic(() => import("./pages/MyDetailspage"));
// const ProfilePage = dynamic(() => import("./pages/ProfilePage"));
// const CampDetails = dynamic(() => import("./pages/CampDetails"));
// const TeamPage = dynamic(() => import("./pages/TeamPage"));
// const PasswordPage = dynamic(() => import("./pages/PasswordPage"));
// const ReportPage = dynamic(() => import("./pages/Report"));
// const ApplicationsPage = dynamic(() => import("./pages/ApplicationPage"));
// const ApiPage = dynamic(() => import("./pages/ApiPage"));

// const Settings = () => {
//   // =========================================================
//   // PROFILE
//   // =========================================================
//   const dispatch = useAppDispatch();
//   const profileInputRef = useRef(null);

//   const [profileImageFile, setProfileImageFile] = useState(null);
//   const [imagePreviewUrl, setImagePreviewUrl] = useState("");

//   const clearProfileImage = () => {
//     if (imagePreviewUrl) {
//       URL.revokeObjectURL(imagePreviewUrl);
//     }

//     setProfileImageFile(null);
//     setImagePreviewUrl("");

//     if (profileInputRef.current) {
//       profileInputRef.current.value = "";
//     }
//   };

//   const [reportPreviewStudent] = useState({
//     id: 1,
//     name: "Sample Student",
//     class: "5",
//     sec: "A",
//     section: "A",
//     admission_number: "ADM-0001",
//     dob: "2015-06-15",
//     gender: "Male",
//     academic_year: "2026-2027",
//     school_name: "Svastha School",
//   });

//   const authUser = useAppSelector(selectAuthUser);
//   const getRole = authUser?.account_type ?? authUser?.role ?? null;

//   // =========================================================
//   // TEAM
//   // =========================================================

//   const initialAccounts = [
//     {
//       id: 1,
//       name: "Arjun Kumar",
//       designation: "School Administrator",
//       status: "active",
//     },
//     {
//       id: 2,
//       name: "Priya Sharma",
//       designation: "Medical Officer",
//       status: "active",
//     },
//     {
//       id: 3,
//       name: "Rahul Verma",
//       designation: "Teacher",
//       status: "inactive",
//     },
//     {
//       id: 4,
//       name: "Kavin S",
//       designation: "Lab Technician",
//       status: "active",
//     },
//     {
//       id: 5,
//       name: "Meera Joshi",
//       designation: "Counselor",
//       status: "inactive",
//     },
//   ];

//   const [accounts, setAccounts] = useState(initialAccounts);
//   const [selectedIds, setSelectedIds] = useState([]);

//   // // Select row
//   const toggleRow = (id) => {
//     setSelectedIds((prev) =>
//       prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
//     );
//   };

//   // Select all
//   const toggleAll = () => {
//     const isAllSelected =
//       accounts.length > 0 && selectedIds.length === accounts.length;

//     setSelectedIds(isAllSelected ? [] : accounts.map((account) => account.id));
//   };

//   // Toggle active/inactive
//   const toggleStatus = (id) => {
//     setAccounts((prev) =>
//       prev.map((account) =>
//         account.id === id
//           ? {
//               ...account,
//               status: account.status === "active" ? "inactive" : "active",
//             }
//           : account,
//       ),
//     );
//   };

//   // Duplicate
//   const duplicateAccount = (id) => {
//     setAccounts((prev) => {
//       const source = prev.find((account) => account.id === id);

//       if (!source) return prev;

//       const nextId = Math.max(...prev.map((account) => account.id)) + 1;

//       return [
//         ...prev,
//         {
//           ...source,
//           id: nextId,
//           name: `${source.name} (copy)`,
//         },
//       ];
//     });
//   };

//   // Delete
//   const deleteAccount = (id) => {
//     const target = accounts.find((account) => account.id === id);

//     setAccounts((prev) => prev.filter((account) => account.id !== id));

//     setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));

//     if (target) {
//       toast.success(`Deleted "${target.name}"`);
//     }
//   };

//   // Bulk delete
//   const deleteSelectedAccounts = () => {
//     const count = selectedIds.length;

//     if (count === 0) return;

//     setAccounts((prev) =>
//       prev.filter((account) => !selectedIds.includes(account.id)),
//     );

//     setSelectedIds([]);

//     toast.success(
//       count === 1 ? "Deleted 1 account" : `Deleted ${count} accounts`,
//     );
//   };

//   // =========================================================
//   // ACCOUNT FORM
//   // =========================================================

//   const [isAddOpen, setIsAddOpen] = useState(false);

//   const [showPassword, setShowPassword] = useState(false);

//   const [formErrors, setFormErrors] = useState({});

//   const [deleteTarget, setDeleteTarget] = useState(null);

//   const [editingAccount, setEditingAccount] = useState(null);

//   // Reset form
//   const resetAddForm = () => {
//     setNewName("");
//     setNewUsername("");
//     setNewPassword("");
//     setShowPassword(false);
//     setFormErrors({});
//     setEditingAccount(null);
//   };

//   // Edit
//   const handleEditAccount = (account) => {
//     setEditingAccount(account);

//     setNewName(account.name || "");
//     setNewUsername(account.username || "");
//     setNewPassword("");

//     setShowPassword(false);
//     setFormErrors({});

//     setIsAddOpen(true);
//   };

//   // Dialog open/close
//   const handleAddOpenChange = (open) => {
//     setIsAddOpen(open);

//     if (!open) {
//       resetAddForm();
//     }
//   };

//   // Create / update
//   const handleCreateAccount = (event) => {
//     event.preventDefault();

//     const errors = {};

//     if (!newName.trim()) {
//       errors.name = "Name is required.";
//     }

//     if (!newUsername.trim()) {
//       errors.username = "Username is required.";
//     } else {
//       const usernameTaken = accounts.some(
//         (account) =>
//           account.id !== editingAccount?.id &&
//           (account.username || "").toLowerCase() ===
//             newUsername.trim().toLowerCase(),
//       );

//       if (usernameTaken) {
//         errors.username = "This username is already taken.";
//       }
//     }

//     if (!editingAccount && !newPassword) {
//       errors.password = "Password is required.";
//     } else if (newPassword && newPassword.length < 6) {
//       errors.password = "Use at least 6 characters.";
//     }

//     setFormErrors(errors);

//     if (Object.keys(errors).length > 0) {
//       return;
//     }

//     // Update
//     if (editingAccount) {
//       setAccounts((prev) =>
//         prev.map((account) =>
//           account.id === editingAccount.id
//             ? {
//                 ...account,
//                 name: newName.trim(),
//                 username: newUsername.trim(),
//                 ...(newPassword ? { password: newPassword } : {}),
//               }
//             : account,
//         ),
//       );

//       toast.success("Account updated");
//     }

//     // Create
//     else {
//       const nextId =
//         accounts.reduce((max, account) => Math.max(max, account.id), 0) + 1;

//       setAccounts((prev) => [
//         ...prev,
//         {
//           id: nextId,
//           name: newName.trim(),
//           username: newUsername.trim(),
//           password: newPassword,
//           designation: "",
//           status: "active",
//         },
//       ]);

//       toast.success("Account created");
//     }

//     setIsAddOpen(false);
//     resetAddForm();
//   };

//   // =========================================================
//   // DELETE
//   // =========================================================

//   const handleConfirmDelete = () => {
//     if (deleteTarget === "bulk") {
//       deleteSelectedAccounts();
//     } else if (deleteTarget) {
//       deleteAccount(deleteTarget.id);
//     }

//     setDeleteTarget(null);
//   };

//   // =========================================================
//   // APPEARANCE
//   // =========================================================

//   // Appearance customisation lives in Redux (appearanceSettings slice) and is
//   // applied app-wide by <AppearanceWatcher />; localStorage
//   // ("Svastha-appearance") is written on save and rehydrated by the watcher.
//   const appearanceSettings = useAppSelector(
//     (state) => state.appearanceSettings,
//   );
//   const { theme, transparentSidebar, sidebarFeature, tableView } =
//     appearanceSettings ?? {};

//   const handleAppearanceChange = (field, value) => {
//     dispatch(setAppearanceField({ field, value }));
//   };

//   const handleAppearanceCancel = () => {
//     dispatch(resetAppearanceSettings());

//     toast.success("Appearance changes discarded");
//   };

//   const handleAppearanceSave = () => {
//     try {
//       localStorage.setItem(
//         "Svastha-appearance",
//         JSON.stringify({
//           theme,
//           transparentSidebar,
//           sidebarFeature,
//           tableView,
//         }),
//       );
//     } catch {
//       // Ignore storage failures — the toast still confirms the action.
//     }

//     toast.success("Appearance settings saved");
//   };

//   // =========================================================
//   // NAVIGATION
//   // =========================================================
//   const getVisibleItems = React.useCallback((items, role) => {
//     if (!Array.isArray(items)) {
//       return [];
//     }

//     return items
//       .map((item) => {
//         // Check parent/item role
//         const itemAllowed = !item?.roles?.length || item.roles.includes(role);

//         if (!itemAllowed) {
//           return null;
//         }

//         // Handle children if available
//         if (Array.isArray(item?.children) && item.children.length > 0) {
//           const children = item.children.filter(
//             (child) => !child?.roles?.length || child.roles.includes(role),
//           );

//           if (children.length === 0) {
//             return null;
//           }

//           return {
//             ...item,
//             children,
//           };
//         }

//         return item;
//       })
//       .filter(Boolean);
//   }, []);

//   const [activeTab, setActiveTab] = useState("my-details");
//   const [navQuery, setNavQuery] = useState("");

//   const visibleNav = React.useMemo(
//     () => getVisibleItems(settingsNav, getRole),
//     [settingsNav, getRole, getVisibleItems],
//   );
//   const visibleSettingsNav = visibleNav.filter((item) =>
//     item.label.toLowerCase().includes(navQuery.trim().toLowerCase()),
//   );

//   const [settingsFormData, setSettingsFormData] = useState({
//     name: "",
//     username: "",
//     password: "",
//   });

//   // Report customisation lives in Redux (reportSettings slice) so the
//   // HealthCheckModal on any page applies the same configuration.
//   const reportFormData = useAppSelector((state) => state.reportSettings);

//   const handleReportChange = (field, value) => {
//     dispatch(setReportField({ field, value }));
//   };
//   const handleSettingsChange = (field, value) => {
//     setSettingsFormData((prev) => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   // =========================================================
//   // ACTIVE TAB
//   // =========================================================

//   const renderActiveTab = () => {
//     switch (activeTab) {
//       case "appearance":
//         return (
//           <AppearancePage
//             theme={theme}
//             onThemeChange={(value) => handleAppearanceChange("theme", value)}
//             transparentSidebar={transparentSidebar}
//             onTransparentSidebarChange={(value) =>
//               handleAppearanceChange("transparentSidebar", value)
//             }
//             sidebarFeature={sidebarFeature}
//             onSidebarFeatureChange={(value) =>
//               handleAppearanceChange("sidebarFeature", value)
//             }
//             tableView={tableView}
//             onTableViewChange={(value) =>
//               handleAppearanceChange("tableView", value)
//             }
//             onCancel={handleAppearanceCancel}
//             onSave={handleAppearanceSave}
//           />
//         );

//       case "my-details":
//         return (
//           <MyDetailsPage
//             profileImageFile={profileImageFile}
//             setProfileImageFile={setProfileImageFile}
//             clearProfileImage={clearProfileImage}
//             name={settingsFormData.name}
//             username={settingsFormData.username}
//             password={settingsFormData.password}
//             onChange={handleSettingsChange}
//           />
//         );

//       case "profile":
//         return (
//           <ProfilePage
//             profileImageFile={profileImageFile}
//             setProfileImageFile={setProfileImageFile}
//             profileInputRef={profileInputRef}
//             imagePreviewUrl={imagePreviewUrl}
//             setImagePreviewUrl={setImagePreviewUrl}
//             clearProfileImage={clearProfileImage}
//             name={settingsFormData.name}
//             username={settingsFormData.username}
//             password={settingsFormData.password}
//             onChange={handleSettingsChange}
//           />
//         );
//       case "campDetails":
//         return (
//           <>
//             <CampDetails />
//           </>
//         );
//       case "team":
//         return (
//           <TeamPage
//             accounts={accounts}
//             selectedIds={selectedIds}
//             onToggleRow={toggleRow}
//             onToggleAll={toggleAll}
//             onToggleStatus={toggleStatus}
//             onDuplicate={duplicateAccount}
//             onDelete={deleteAccount}
//             onBulkDelete={() => setDeleteTarget("bulk")}
//             onEdit={handleEditAccount}
//             onAdd={() => setIsAddOpen(true)}
//             isAddOpen={isAddOpen}
//             onAddOpenChange={handleAddOpenChange}
//             newName={newName}
//             setNewName={setNewName}
//             newUsername={newUsername}
//             setNewUsername={setNewUsername}
//             newPassword={newPassword}
//             setNewPassword={setNewPassword}
//             showPassword={showPassword}
//             setShowPassword={setShowPassword}
//             formErrors={formErrors}
//             onSubmit={handleCreateAccount}
//             editingAccount={editingAccount}
//             deleteTarget={deleteTarget}
//             setDeleteTarget={setDeleteTarget}
//             onConfirmDelete={handleConfirmDelete}
//           />
//         );

//       case "SchoolDetails":
//         return <PasswordPage />;

//       case "report":
//         return (
//           <ReportPage
//             report={reportFormData.reportType}
//             reportTemplate={reportFormData.reportTemplate}
//             reportSection={reportFormData.reportSection}
//             schoolHead={reportFormData.schoolHead}
//             includeLetterhead={reportFormData.includeLetterhead}
//             tableDensity={reportFormData.tableDensity}
//             autoGenerate={reportFormData.autoGenerate}
//             onChange={handleReportChange}
//             student={reportPreviewStudent}
//           />
//         );

//       case "applications":
//         return <ApplicationsPage />;

//       case "api":
//         return <ApiPage />;

//       default:
//         return <AppearancePage />;
//     }
//   };

//   // =========================================================
//   // RETURN
//   // =========================================================

//   return (
//     <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
//       {/* SIDEBAR */}

//       <Aside
//         settings={visibleSettingsNav}
//         navQuery={setNavQuery}
//         query={navQuery}
//         activeTab={activeTab}
//         setActiveTab={setActiveTab}
//       />

//       {/* CONTENT */}

//       <div className="min-w-0 flex-1 space-y-6">
//         <div className="flex items-center gap-2">
//           <Settings size={5} />
//           {/* <span className="size-2 rounded-full bg-foreground" /> */}

//           <h1 className="text-2xl font-bold text-foreground">Settings</h1>
//         </div>

//         {/* {renderActiveTab()} */}
//       </div>
//     </div>
//   );
// };

// export default Settings;
import React, { useMemo, useRef, useState } from "react";
import Aside from "./pages/aside";
import { initialAccounts, settingsNav } from "./datas/settingsData";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { selectAuthUser, selectUserAccount } from "@/lib/features/auth-slice";
import { useAuthRole } from "@/lib/user-role";
import {
  resetAppearanceSettings,
  setAppearanceField,
} from "@/lib/features/appearanceSettingSlice";
import { setReportField } from "@/lib/features/reportSettingsSlice";
import dynamic from "next/dynamic";

import { toast } from "sonner";
import { Settings } from "lucide-react";
import {
  getAllSchoolBranches,
  getSchoolBranch,
} from "@/lib/features/registerSchoolBranchSlice";
import {
  createSubAccount,
  deleteSubAccount,
  getAllSubAccount,
  updateSubAccount,
} from "@/lib/features/registerStaffAccount";
import { useQuery } from "@tanstack/react-query";
import { buildSubAccountSchema } from "./validation/sub-account-validation-schema";
const AppearancePage = dynamic(() => import("./pages/AppearancePage"));
const MyDetailsPage = dynamic(() => import("./pages/MyDetailspage"));
const ProfilePage = dynamic(() => import("./pages/ProfilePage"));
const SchoolDetails = dynamic(() => import("./pages/SchoolDetails"));
const ScreeningPage = dynamic(() => import("./pages/ScreeningPage"));
// const CampDetails = dynamic(() => import("./pages/CampDetails"));
const TeamPage = dynamic(() => import("./pages/TeamPage"));
// const PasswordPage = dynamic(() => import("./pages/PasswordPage"));
const ReportPage = dynamic(() => import("./pages/Report"));
// const ApplicationsPage = dynamic(() => import("./pages/ApplicationPage"));
// const ApiPage = dynamic(() => import("./pages/ApiPage"));

// import MyDetailsPage from "./pages/MyDetailspage";
// import ProfilePage from "./pages/ProfilePage";
// import AppearancePage from "./pages/AppearancePage";

/* =========================================================
   PRIVILEGES → API PAYLOAD
   The form holds privileges as the ClassSectionManager map
   ({ "11": ["A", "B"], "12": ["A"] }) while the API expects a flat
   "class-index" string ("11-1, 11-2, 12-3").

   The field can also hold a plain string — an account loaded from the
   API already carries flattened privileges — so every shape is
   normalised here instead of crashing on `<string>.join(...)` or
   `values.map(...)`.
   ========================================================= */
const buildPrivilegesPayload = (value) => {
  if (typeof value === "string") return value.trim();
  if (value == null) return "";

  const entries = Array.isArray(value)
    ? value.map((sections, index) => [String(index + 1), sections])
    : Object.entries(value);

  let counter = 1;

  return entries
    .flatMap(([key, sections]) => {
      const list = Array.isArray(sections)
        ? sections
        : String(sections ?? "")
            .split(",")
            .map((section) => section.trim())
            .filter(Boolean);

      return list.map(() => `${key}-${counter++}`);
    })
    .join(",");
};


const page = () => {
  const [activeTab, setActiveTab] = useState("my-details");
  const [navQuery, setNavQuery] = useState("");
  const dispatch = useAppDispatch();

  const authUser = useAppSelector(selectAuthUser);

  const getRole = useAuthRole();
  console.log(getRole, "getRole");

  const account = useAppSelector(selectUserAccount);
  console.log(account, "accountee");

  // user_type_id 2 = "school" — auto-open the School Details tab once per
  // session so the logo-empty popup can appear after login (SchoolDetails
  // only mounts when this tab is active).
  React.useEffect(() => {
    const userTypeId = Number(
      account?.user_type_id ?? account?.userTypeId ?? "",
    );
    if (userTypeId !== 2) return;
    const storageKey = "svastha-settings-auto-open";
    if (window.sessionStorage.getItem(storageKey) === "1") return;
    window.sessionStorage.setItem(storageKey, "1");
    setActiveTab("SchoolDetails");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  // Branch data for a school_sub_account. The backend 401s them on
  // /schools/branch/all, so their branch can only come from the login
  // payload — checked on both the account object and the staff/user object.
  const subAccountBranch = React.useMemo(() => {
    const id = String(
      account?.branch_id ??
        account?.branchId ??
        account?.branch?.id ??
        authUser?.branch_id ??
        authUser?.branchId ??
        authUser?.branch?.id ??
        "",
    ).trim();
    const name = String(
      account?.branch_name ??
        account?.name ??
        account?.school_name ??
        account?.schoolName ??
        authUser?.branch_name ??
        authUser?.name ??
        authUser?.school_name ??
        authUser?.schoolName ??
        "",
    ).trim();

    // Class/section from the login payload (plain string, id, or nested object).
    const toText = (value) => {
      if (Array.isArray(value)) {
        return value
          .map((item) =>
            item && typeof item === "object"
              ? String(item.name ?? item.id ?? "")
              : String(item),
          )
          .filter(Boolean)
          .join(", ");
      }
      if (value && typeof value === "object") {
        return String(value.name ?? value.id ?? "").trim();
      }
      return String(value ?? "").trim();
    };

    const rawClass =
      account?.class ??
      account?.class_id ??
      account?.classId ??
      account?.class_name ??
      account?.Class ??
      authUser?.class ??
      authUser?.class_id ??
      authUser?.classId ??
      authUser?.class_name ??
      authUser?.Class ??
      "";
    const rawSection =
      account?.section ??
      account?.section_id ??
      account?.sectionId ??
      account?.section_name ??
      account?.sec ??
      account?.Section ??
      authUser?.section ??
      authUser?.section_id ??
      authUser?.sectionId ??
      authUser?.section_name ??
      authUser?.sec ??
      authUser?.Section ??
      "";

    const schoolId = String(
      account?.school_id ??
        account?.schoolId ??
        account?.school?.id ??
        authUser?.school_id ??
        authUser?.schoolId ??
        authUser?.school?.id ??
        "",
    ).trim();

    return {
      id,
      name,
      school_id: schoolId,
      class: toText(rawClass),
      section: toText(rawSection),
    };
  }, [account, authUser]);

  console.log(subAccountBranch, "subAccountBranch");

  const [isAddOpen, setIsAddOpen] = useState(false);

  const getVisibleItems = React.useCallback((items, role) => {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .map((item) => {
        // Check parent/item role
        const itemAllowed = !item?.roles?.length || item.roles.includes(role);

        if (!itemAllowed) {
          return null;
        }

        // Handle children if available
        if (Array.isArray(item?.children) && item.children.length > 0) {
          const children = item.children.filter(
            (child) => !child?.roles?.length || child.roles.includes(role),
          );

          if (children.length === 0) {
            return null;
          }
          return {
            ...item,
            children,
          };
        }
        return item;
      })
      .filter(Boolean);
  }, []);
  const profileInputRef = useRef(null);

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

  const [settingsFormData, setSettingsFormData] = useState({
    name: account?.name,
    username: account?.user_name,
    password: "",
  });

  console.log(settingsFormData, "settingsFormData");

  const handleSettingsChange = (field, value) => {
    setSettingsFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const clearProfileImage = () => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }

    setProfileImageFile(null);
    setImagePreviewUrl("");

    if (profileInputRef.current) {
      profileInputRef.current.value = "";
    }
  };

  const reportFormData = useAppSelector((state) => state.reportSettings);

  const handleReportChange = (field, value) => {
    dispatch(setReportField({ field, value }));
  };

  const visibleNav = React.useMemo(
    () => getVisibleItems(settingsNav, getRole),
    [settingsNav, getRole, getVisibleItems],
  );
  const visibleSettingsNav = visibleNav.filter((item) =>
    item.label.toLowerCase().includes(navQuery.trim().toLowerCase()),
  );
  const appearanceSettings = useAppSelector(
    (state) => state.appearanceSettings,
  );
  const { theme, transparentSidebar, sidebarFeature, tableView } =
    appearanceSettings ?? {};

  const handleAppearanceChange = (field, value) => {
    dispatch(setAppearanceField({ field, value }));
  };

  const handleAppearanceCancel = () => {
    dispatch(resetAppearanceSettings());
    toast.success("Appearance changes discarded");
  };

  //   const { theme, transparentSidebar, sidebarFeature, tableView } =
  //     appearanceSettings ?? {};

  const handleAppearanceSave = () => {
    try {
      localStorage.setItem(
        "Svastha-appearance",
        JSON.stringify({
          theme,
          transparentSidebar,
          sidebarFeature,
          tableView,
        }),
      );
    } catch {
      // Ignore storage failures — the toast still confirms the action.
    }

    toast.success("Appearance settings saved");
  };

  const {
    data: getAllSchoolBranch = {},
    isLoading: getAllSchoolBranchLoading,
    error: getAllSchoolBranchError,
  } = useQuery({
    queryKey: ["getSchoolAllBranch"],
    queryFn: () => dispatch(getAllSchoolBranches()).unwrap(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,

    enabled: Boolean(getRole) && getRole !== "school_sub_account",
  });

  const {
    data: getSchoolBranchData = {},
    isLoading: getSchoolBranchLoading,
    error: getSchoolBranchError,
  } = useQuery({
    queryKey: ["getSchoolBranch"],
    queryFn: () => dispatch(getSchoolBranch()).unwrap(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
  console.log(getSchoolBranchData, "getSchoolBranchData");

  // Branch options for the sub-account form. Built from the FULL branch list
  // (/schools/branch/all) so multiple branches appear; falls back to the
  // single /schools/branch record when the list isn't available.
  const getBranchDataForSubAccount = useMemo(() => {
    // Each option carries: id (branch id), value (branch name) plus the
    // class/section assigned to that branch.
    const toOption = (branch) => ({
      id: String(branch?.id ?? branch?.branch_id ?? "").trim(),
      value: String(branch?.branch_name ?? branch?.name ?? "").trim(),
      class: String(
        branch?.class ?? branch?.class_name ?? branch?.Class ?? "",
      ).trim(),
      section: String(
        branch?.section ?? branch?.section_name ?? branch?.Section ?? "",
      ).trim(),
    });

    const list = Array.isArray(getAllSchoolBranch)
      ? getAllSchoolBranch
      : (getAllSchoolBranch?.data ?? []);

    const options = list
      .map(toOption)
      .filter((option) => option.id && option.value);

    if (options.length === 0 && getSchoolBranchData) {
      const single = getSchoolBranchData?.data ?? getSchoolBranchData;
      const option = toOption(single);
      if (option.id && option.value) options.push(option);
    }

    return options;
  }, [getAllSchoolBranch, getSchoolBranchData]);
  // const getBranchDataForSubAccount = getSchoolBranchData

  // getBranchDataWithClassSection

  console.log(getAllSchoolBranch, "getAllSchoolBranch");
  // Class/section of the branch this school_sub_account belongs to. The
  // /schools/branch/all response carries class + section per branch, so look
  // up the branch matching their branch_id and read it from there.
  const branchClassSection = React.useMemo(() => {
    const list = Array.isArray(getAllSchoolBranch)
      ? getAllSchoolBranch
      : (getAllSchoolBranch?.data ?? []);
    if (!subAccountBranch.id || list.length === 0) {
      return { class: "", section: "" };
    }

    const branch = list.find(
      (b) => String(b?.id ?? b?.branch_id ?? "").trim() === subAccountBranch.id,
    );
    if (!branch) return { class: "", section: "" };

    const rawClass =
      branch.class ??
      branch.class_id ??
      branch.classId ??
      branch.class_name ??
      branch.Class ??
      branch.classes ??
      branch.Classes ??
      "";
    const rawSection =
      branch.section ??
      branch.sec ??
      branch.section_id ??
      branch.sectionId ??
      branch.section_name ??
      branch.Section ??
      branch.sections ??
      branch.Sections ??
      "";

    const toText = (value) => {
      if (Array.isArray(value)) {
        return value
          .map((item) =>
            item && typeof item === "object"
              ? String(item.name ?? item.id ?? "")
              : String(item),
          )
          .filter(Boolean)
          .join(", ");
      }
      if (value && typeof value === "object") {
        return String(value.name ?? value.id ?? "").trim();
      }
      return String(value ?? "").trim();
    };

    return { class: toText(rawClass), section: toText(rawSection) };
  }, [getAllSchoolBranch, subAccountBranch.id]);

  // Branch options for the team-account form. Normally derived from the fetched
  // school branches. A school_sub_account can't call /schools/branch/all (the
  // backend returns 401 for that role), so build their list from their own
  // account's branch instead.
  const branchOptions = React.useMemo(() => {
    if (getRole === "school_sub_account") {
      const { id, name } = subAccountBranch;
      return id && name ? [{ value: id, label: name }] : [];
    }

    return (
      Array.isArray(getAllSchoolBranch)
        ? getAllSchoolBranch
        : (getAllSchoolBranch?.data ?? [])
    )
      .map((branch) => ({
        value: String(branch?.id ?? branch?.branch_id ?? ""),
        label: branch?.branch_name ?? branch?.name ?? "",
      }))
      .filter((option) => option.value && option.label);
  }, [getRole, subAccountBranch, getAllSchoolBranch]);

  console.log(getAllSchoolBranch, "getAllSchoolBranch");
  // console.log(subAccountBranch, "subAccountBranch");
  console.log(branchClassSection, "branchClassSection");
  const [accounts, setAccounts] = useState(initialAccounts);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // Branch-scoped team list. A school_sub_account only sees the accounts that
  // belong to THEIR branch (the ones their school created) — accounts created
  // by the admin for other branches are hidden.
  const visibleAccounts = React.useMemo(() => {
    if (getRole !== "school_sub_account") return accounts;
    const myBranchId = (subAccountBranch?.id ?? "").trim();
    if (!myBranchId) return accounts;

    const filtered = accounts.filter((acc) => {
      const accBranch = String(
        acc?.branchId ?? acc?.branch_id ?? acc?.branch?.id ?? "",
      ).trim();
      if (!accBranch) return true;
      return accBranch === myBranchId;
    });
    return filtered.length > 0 ? filtered : accounts;
  }, [getRole, accounts, subAccountBranch]);

  console.log(visibleAccounts, "44444");

  const mapSubAccountRecord = (record = {}, index = 0) => {
    const userType =
      record?.user_type_id ??
      record?.userTypeId ??
      record?.usertype_id ??
      record?.usertypeId ??
      record?.user_type?.id ??
      record?.usertype?.id ??
      "";
    const userTypeLabel =
      record?.user_type?.name ??
      record?.usertype?.name ??
      record?.user_type ??
      record?.usertype ??
      "";
    const branch =
      record?.branch_id ?? record?.branchId ?? record?.branch?.id ?? "";

    return {
      id: record?.id ?? record?.sub_acc_id ?? `local-${index}`,
      apiId: record?.id ?? record?.sub_acc_id ?? null,
      name: record?.name ?? record?.full_name ?? "",
      phoneNumber:
        record?.phone_number ?? record?.phoneNumber ?? record?.phone ?? "",
      userName: record?.user_name ?? record?.username ?? record?.userName ?? "",
      // Keep as a STRING so it matches USER_TYPE_OPTIONS' `value` ("2"/"3").
      user_type_id: userType === "" ? "" : String(userType),
      branchId: branch === "" ? "" : String(branch),
      previleges: record?.privileges ?? record?.previleges ?? "",
      // `user_type` may be an object (nested relation) — never render an object.
      designation:
        typeof userTypeLabel === "string"
          ? userTypeLabel
          : (userTypeLabel?.name ?? ""),
      class: record?.class ?? record?.class_id ?? "",
      section: record?.section ?? record?.section_id ?? "",
      status: record?.status ?? "active",
    };
  };

  const {
    data: subAccountsData = [],
    isLoading: subAccountsLoading,
    refetch: refetchSubAccounts,
  } = useQuery({
    queryKey: ["getAllSubAccount"],
    queryFn: () => dispatch(getAllSubAccount()).unwrap(),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
    // Sub-account list. A school_sub_account IS allowed to read this endpoint —
    // they just see only their own branch's accounts (see visibleAccounts).
    enabled: Boolean(getRole),
  });

  console.log(subAccountsData, "subAccountsData");

  const subAccountsRef = React.useRef(null);

  React.useEffect(() => {
    // Tolerate all common response shapes: a raw array, { data: [...] },
    // or a paginated { data: { data: [...] } }.
    const list = Array.isArray(subAccountsData)
      ? subAccountsData
      : Array.isArray(subAccountsData?.data)
        ? subAccountsData.data
        : Array.isArray(subAccountsData?.data?.data)
          ? subAccountsData.data.data
          : [];
    // Only update accounts when the actual data changes (not just reference)
    const serialized = JSON.stringify(list);
    if (subAccountsRef.current !== serialized) {
      subAccountsRef.current = serialized;
      setAccounts(Array.isArray(list) ? list.map(mapSubAccountRecord) : []);
    }
  }, [subAccountsData]);

  const [subAccount, setSubAccount] = useState({
    name: "",
    phoneNumber: "",
    userName: "",
    password: "",
    user_type_id: "",
    branchId: "",
    previleges: "",
  });
  console.log(subAccount, "subAccount");

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);

  // A school_sub_account belongs to exactly one branch, so when there's only
  // ONE branch option available, pre-select it in the team form instead of
  // making them pick it manually. Only fills an EMPTY branchId so editing an
  // existing team member's branch is never overwritten.
  React.useEffect(() => {
    if (getRole !== "school_sub_account") return;
    if (branchOptions.length !== 1) return;
    const onlyBranchId = branchOptions[0]?.value;
    if (!onlyBranchId) return;
    setSubAccount((prev) =>
      prev.branchId ? prev : { ...prev, branchId: onlyBranchId },
    );
  }, [getRole, branchOptions, subAccount.branchId]);

  // Reset form
  const resetAddForm = () => {
    setSubAccount({
      name: "",
      phoneNumber: "",
      userName: "",
      password: "",
      user_type_id: "",
      branchId: "",
      previleges: "",
    });
    setShowPassword(false);
    setFormErrors({});
    setEditingAccount(null);
  };

  // Edit
  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setSubAccount({
      name: account.name || "",
      phoneNumber: account.phoneNumber || "",
      userName: account.userName || account.username || "",
      password: "",
      user_type_id: account.user_type_id || "",
      branchId: account.branchId || "",
      previleges: account.previleges || "",
    });
    setShowPassword(false);
    setFormErrors({});
    setIsAddOpen(true);
  };

  // Dialog open/close
  const handleAddOpenChange = (open) => {
    setIsAddOpen(open);

    if (!open) {
      resetAddForm();
    }
  };

  // // Select row
  const toggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  // Select all — operates on the VISIBLE (branch-scoped) list so a
  // school_sub_account can never select accounts outside their branch.
  const toggleAll = () => {
    const isAllSelected =
      visibleAccounts.length > 0 &&
      selectedIds.length === visibleAccounts.length;

    setSelectedIds(
      isAllSelected ? [] : visibleAccounts.map((account) => account.id),
    );
  };

  // Toggle active/inactive
  const toggleStatus = (id) => {
    setAccounts((prev) =>
      prev.map((account) =>
        account.id === id
          ? {
              ...account,
              status: account.status === "active" ? "inactive" : "active",
            }
          : account,
      ),
    );
  };

  // Duplicate
  const duplicateAccount = (id) => {
    setAccounts((prev) => {
      const source = prev.find((account) => account.id === id);

      if (!source) return prev;

      const nextId = Math.max(...prev.map((account) => account.id)) + 1;

      return [
        ...prev,
        {
          ...source,
          id: nextId,
          name: `${source.name} (copy)`,
        },
      ];
    });
  };

  // Delete
  const deleteAccount = (id) => {
    console.log(id, "id");

    const target = accounts.find((account) => account.id === id);
    console.log(target, "target");

    setAccounts((prev) => prev.filter((account) => account.id !== id));

    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));

    if (target) {
      // Remove locally, then best-effort delete on the backend when the row
      // is API-backed (seed/demo rows have no apiId and stay local-only).
      if (target.apiId) {
        dispatch(deleteSubAccount(target.apiId))
          .unwrap()
          .then(() => toast.success(`Deleted "${target.name}"`))
          .catch((error) => {
            toast.error("Failed to delete account", {
              description:
                typeof error === "string"
                  ? error
                  : (error?.message ?? undefined),
            });
            refetchSubAccounts();
          });
      } else {
        toast.success(`Deleted "${target.name}"`);
      }
    }
  };

  // Bulk delete
  const deleteSelectedAccounts = () => {
    const count = selectedIds.length;

    if (count === 0) return;

    const selected = accounts.filter((account) =>
      selectedIds.includes(account.id),
    );

    setAccounts((prev) =>
      prev.filter((account) => !selectedIds.includes(account.id)),
    );

    setSelectedIds([]);

    // Best-effort backend delete for API-backed rows only.
    selected
      .filter((account) => account.apiId)
      .forEach((account) => {
        dispatch(deleteSubAccount(account.apiId))
          .unwrap()
          .catch((error) => {
            toast.error(`Failed to delete "${account.name}"`, {
              description:
                typeof error === "string"
                  ? error
                  : (error?.message ?? undefined),
            });
          });
      });

    refetchSubAccounts();

    toast.success(
      count === 1 ? "Deleted 1 account" : `Deleted ${count} accounts`,
    );
  };
  // Create / update
  const handleCreateAccount = async (event) => {
    event.preventDefault();

    // Flatten the class/section map into the "class-index" string the API
    // expects (no-op when privileges are already a flat string).
    const previlegesResult = buildPrivilegesPayload(subAccount?.previleges);

    console.log(previlegesResult, "subAccountresult");

    const name = (subAccount.name || "").trim();
    const userName = (subAccount.userName || "").trim();
    const phoneNumber = (subAccount.phoneNumber || "").trim();
    const password = subAccount.password || "";
    // Keep RAW for zod validation — Number("") becomes 0, which slips past
    // the "required" refine and reaches the backend as undefined.
    const usertypeId = subAccount.user_type_id ?? "";
    const branchId = subAccount.branchId ?? "";
    const previleges = previlegesResult ?? "";
    const classSections = subAccount.classSections ?? {};
    console.log(
      name,
      userName,
      phoneNumber,
      password,
      usertypeId,
      branchId,
      previleges,
      classSections,
      "dsssss",
    );

    const formValues = {
      name,
      userName,
      phoneNumber,
      password,
      branchId,
      // Schema key is `user_type_id` (matches the form-state key).
      user_type_id: usertypeId,
      previleges,
      classSections,
    };

    const schema = buildSubAccountSchema({
      isEditing: !!editingAccount,
      accounts,
      editingAccountId: editingAccount?.id,
    });

    const result = schema.safeParse(formValues);
    console.log({ result });

    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;

      const firstPerField = Object.fromEntries(
        Object.entries(errors)
          .map(([field, messages]) => [field, messages?.[0]])
          .filter(([, message]) => Boolean(message)),
      );

      setFormErrors(firstPerField);

      const firstError = Object.values(firstPerField).find(Boolean);
      toast.error(firstError || "Please fill all required fields.");

      return;
    }

    setFormErrors({});
    // if (Object.keys(errors).length > 0) {
    //   return;
    // }

    // Update
    if (editingAccount) {
      const previlegesResult = buildPrivilegesPayload(subAccount?.previleges);

      console.log(previlegesResult, "subAccountresult");

      const apiId = editingAccount?.apiId ?? editingAccount?.id ?? null;

      // Local-only (seed/demo) rows have no API id - update locally, skip API.
      if (apiId == null || apiId === "") {
        setAccounts((prev) =>
          prev.map((account) =>
            String(account.id) === String(editingAccount.id)
              ? {
                  ...account,
                  // name,
                  // phoneNumber,
                  // userName,
                  // usertypeId: subAccount.user_type_id,
                  // branchId,
                  previleges: previlegesResult,
                }
              : account,
          ),
        );
        toast.success("Account updated");
        setIsAddOpen(false);
        resetAddForm();
        return;
      }

      try {
        setIsSavingAccount(true);
        await dispatch(
          updateSubAccount({
            id: apiId,
            // name,
            // phone_number: phoneNumber,
            // user_name: userName,
            // ...(password ? { password } : {}),
            // usertype_id: subAccount.user_type_id,
            // branch_id: subAccount.branchId,
            previleges: previlegesResult,
          }),
        ).unwrap();

        toast.success("Account updated");
        await refetchSubAccounts();
        setIsAddOpen(false);
        resetAddForm();
      } catch (error) {
        toast.error("Failed to update account", {
          description:
            typeof error === "string" ? error : (error?.message ?? undefined),
        });
      } finally {
        setIsSavingAccount(false);
      }
      return;
    }
    console.log(subAccount, "subAccount333333");

    // Create
    try {
      setIsSavingAccount(true);
      // Privileges are optional — only include `privileges` in the payload
      // when the flattened value is actually non-empty. Use the FLATTENED
      // string, never the raw form value: the class/section map stringifies to
      // "[object Object]" (truthy!) even when it holds nothing, which sent
      // `privileges: ""` and made the API answer with
      // "The privileges field is required." even though the form looked filled.
      const hasPrivileges = String(previleges ?? "").trim() !== "";

      await dispatch(
        createSubAccount({
          name,
          phone_number: phoneNumber,
          user_name: userName,
          password,
          user_type_id: Number(usertypeId) || undefined,
          branch_id: Number(branchId) || undefined,
          ...(hasPrivileges ? { previleges: previleges } : {}),
        }),
      ).unwrap();

      toast.success("Account created");
      await refetchSubAccounts();
      setIsAddOpen(false);
      resetAddForm();
    } catch (error) {
      // Log the raw backend rejection so the exact 422 field errors are
      // visible in the console during debugging.
      console.error("createSubAccount rejected:", error);

      const description =
        typeof error === "string"
          ? error
          : error?.errors && typeof error.errors === "object"
            ? Object.entries(error.errors)
                .map(
                  ([field, messages]) =>
                    `${field}: ${
                      Array.isArray(messages) ? messages[0] : messages
                    }`,
                )
                .join(" · ")
            : (error?.message ?? undefined);

      toast.error("Failed to create account", { description });
    } finally {
      setIsSavingAccount(false);
    }
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleConfirmDelete = () => {
    if (deleteTarget === "bulk") {
      deleteSelectedAccounts();
    } else if (deleteTarget) {
      deleteAccount(deleteTarget.id);
    }

    setDeleteTarget(null);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "appearance":
        return (
          <AppearancePage
            theme={theme}
            onThemeChange={(value) => handleAppearanceChange("theme", value)}
            transparentSidebar={transparentSidebar}
            onTransparentSidebarChange={(value) =>
              handleAppearanceChange("transparentSidebar", value)
            }
            sidebarFeature={sidebarFeature}
            onSidebarFeatureChange={(value) =>
              handleAppearanceChange("sidebarFeature", value)
            }
            tableView={tableView}
            onTableViewChange={(value) =>
              handleAppearanceChange("tableView", value)
            }
            onCancel={handleAppearanceCancel}
            onSave={handleAppearanceSave}
          />
        );
      case "my-details":
        return (
          <MyDetailsPage
            profileImageFile={profileImageFile}
            setProfileImageFile={setProfileImageFile}
            clearProfileImage={clearProfileImage}
            name={settingsFormData.name}
            username={settingsFormData.username}
            password={settingsFormData.password}
            onChange={handleSettingsChange}
          />
        );

      case "profile":
        return (
          <ProfilePage
            profileImageFile={profileImageFile}
            setProfileImageFile={setProfileImageFile}
            profileInputRef={profileInputRef}
            imagePreviewUrl={imagePreviewUrl}
            setImagePreviewUrl={setImagePreviewUrl}
            clearProfileImage={clearProfileImage}
            name={settingsFormData.name}
            username={settingsFormData.username}
            password={settingsFormData.password}
            onChange={handleSettingsChange}
          />
        );

      case "report":
        return (
          <ReportPage
            report={reportFormData.reportType}
            reportTemplate={reportFormData.reportTemplate}
            reportSection={reportFormData.reportSection}
            schoolHead={reportFormData.schoolHead}
            includeLetterhead={reportFormData.includeLetterhead}
            tableDensity={reportFormData.tableDensity}
            autoGenerate={reportFormData.autoGenerate}
            onChange={handleReportChange}
            // student={reportPreviewStudent}
          />
        );
      case "SchoolDetails":
        return (
          <SchoolDetails
            getAllSchoolBranch={getAllSchoolBranch}
            getRole={getRole}
            getUserAccount={account}
            getBranchDataForSubAccount={getBranchDataForSubAccount}
            subAccountBranch={subAccountBranch}
            getSchoolBranchData={getSchoolBranchData}
          />
        );
      case "screening":
        return <ScreeningPage />;
      case "team":
        return (
          <TeamPage
            getSchoolBranch={getSchoolBranchData}
            accounts={visibleAccounts}
            selectedIds={selectedIds}
            onToggleRow={toggleRow}
            onToggleAll={toggleAll}
            onToggleStatus={toggleStatus}
            onDuplicate={duplicateAccount}
            onDelete={deleteAccount}
            onBulkDelete={() => setDeleteTarget("bulk")}
            onEdit={handleEditAccount}
            onAdd={() => setIsAddOpen(true)}
            isAddOpen={isAddOpen}
            onAddOpenChange={handleAddOpenChange}
            subAccount={subAccount}
            setSubAccount={setSubAccount}
            branches={branchOptions}
            subAccountBranch={subAccountBranch}
            getBranchDataForSubAccount={getBranchDataForSubAccount}
            isSaving={isSavingAccount}
            authAccName={account}
            // newName={newName}
            // setNewName={setNewName}
            // newUsername={newUsername}
            // setNewUsername={setNewUsername}
            // newPassword={newPassword}
            // setNewPassword={setNewPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            formErrors={formErrors}
            onSubmit={handleCreateAccount}
            editingAccount={editingAccount}
            deleteTarget={deleteTarget}
            setDeleteTarget={setDeleteTarget}
            onConfirmDelete={handleConfirmDelete}
          />
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* SIDEBAR */}
      <Aside
        settings={visibleSettingsNav}
        navQuery={setNavQuery}
        query={navQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      <div className="min-w-0 flex-1 space-y-6">
        <div className="flex items-center gap-2">
          <Settings size={24} />
          {/* <span className="size-2 rounded-full bg-foreground" /> */}

          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>

        {renderActiveTab()}
      </div>
      {/* {renderActiveTab()} */}
    </div>
  );
};

export default page;
