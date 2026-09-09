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
import React, { useRef, useState } from "react";
import Aside from "./pages/aside";
import { initialAccounts, settingsNav } from "./datas/settingsData";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { selectAuthUser } from "@/lib/features/auth-slice";
import {
  resetAppearanceSettings,
  setAppearanceField,
} from "@/lib/features/appearanceSettingSlice";
import dynamic from "next/dynamic";

import { toast } from "sonner";
import { Settings } from "lucide-react";
// import SchoolDetails from "./pages/SchoolDetails";
import {
  createSchoolBranches,
  getAllSchoolBranches,
} from "@/lib/features/registerSchoolBranchSlice";
import {
  createSubAccount,
  deleteSubAccount,
  getAllSubAccount,
} from "@/lib/features/registerStaffAccount";
import { useQuery } from "@tanstack/react-query";
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

const page = () => {
  const [activeTab, setActiveTab] = useState("my-details");
  const [navQuery, setNavQuery] = useState("");
  const dispatch = useAppDispatch();

  const authUser = useAppSelector(selectAuthUser);
  const getRole = authUser?.account_type ?? authUser?.role ?? null;
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
    name: "",
    username: "",
    password: "",
  });

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
  });

  console.log(getAllSchoolBranch, "getAllSchoolBranch");

  // Branch options for the team-account form, derived from the fetched
  // school branches. Tolerates both a raw array and a wrapped { data: [...] }.
  const branchOptions = (
    Array.isArray(getAllSchoolBranch)
      ? getAllSchoolBranch
      : (getAllSchoolBranch?.data ?? [])
  )
    .map((branch) => ({
      value: String(branch?.id ?? branch?.branch_id ?? ""),
      label: branch?.branch_name ?? branch?.name ?? "",
    }))
    .filter((option) => option.value && option.label);

  const [accounts, setAccounts] = useState(initialAccounts);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSavingAccount, setIsSavingAccount] = useState(false);

  // ---- Sub-account (team) API wiring ----
  // Maps a backend sub-account record into the shape the TeamPage table
  // expects. Tolerates snake_case/camelCase and differing id/name keys.
  const mapSubAccountRecord = (record = {}, index = 0) => ({
    id: record?.id ?? record?.sub_acc_id ?? `local-${index}`,
    apiId: record?.id ?? record?.sub_acc_id ?? null,
    name: record?.name ?? record?.full_name ?? "",
    phoneNumber:
      record?.phone_number ?? record?.phoneNumber ?? record?.phone ?? "",
    userName: record?.user_name ?? record?.username ?? record?.userName ?? "",
    usertypeId: String(record?.usertype_id ?? record?.usertypeId ?? ""),
    branchId: String(record?.branch_id ?? record?.branchId ?? ""),
    previleges: record?.privileges ?? record?.previleges ?? "",
    designation: record?.designation ?? record?.user_type ?? "",
    class: record?.class ?? record?.class_id ?? "",
    section: record?.section ?? record?.section_id ?? "",
    status: record?.status ?? "active",
  });

  const fetchSubAccounts = React.useCallback(async () => {
    try {
      const result = await dispatch(getAllSubAccount()).unwrap();
      console.log(result,"result");
      
      const list = Array.isArray(result) ? result : (result?.data ?? []);
      setAccounts(Array.isArray(list) ? list.map(mapSubAccountRecord) : []);
    } catch (error) {
      toast.error("Failed to load team accounts", {
        description:
          typeof error === "string" ? error : (error?.message ?? undefined),
      });
    }
  }, [dispatch]);

  React.useEffect(() => {
    fetchSubAccounts();
  }, [fetchSubAccounts]);

  const [subAccount, setSubAccount] = useState({
    name: "",
    phoneNumber: "",
    userName: "",
    password: "",
    usertypeId: "",
    branchId: "",
    previleges: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);

  // Reset form
  const resetAddForm = () => {
    setSubAccount({
      name: "",
      phoneNumber: "",
      userName: "",
      password: "",
      usertypeId: "",
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
      usertypeId: account.usertypeId || "",
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

  // Select all
  const toggleAll = () => {
    const isAllSelected =
      accounts.length > 0 && selectedIds.length === accounts.length;

    setSelectedIds(isAllSelected ? [] : accounts.map((account) => account.id));
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
    const target = accounts.find((account) => account.id === id);

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
            fetchSubAccounts();
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

    fetchSubAccounts();

    toast.success(
      count === 1 ? "Deleted 1 account" : `Deleted ${count} accounts`,
    );
  };
  // Create / update
  const handleCreateAccount = async (event) => {
    event.preventDefault();

    const errors = {};
    const name = (subAccount.name || "").trim();
    const userName = (subAccount.userName || "").trim();
    const phoneNumber = (subAccount.phoneNumber || "").trim();
    const password = subAccount.password || "";

    if (!name) {
      errors.name = "Name is required.";
    }

    if (!phoneNumber) {
      errors.phoneNumber = "Phone number is required.";
    }

    if (!userName) {
      errors.username = "Username is required.";
    } else {
      const usernameTaken = accounts.some(
        (account) =>
          account.id !== editingAccount?.id &&
          (account.userName || account.username || "").toLowerCase() ===
            userName.toLowerCase(),
      );

      if (usernameTaken) {
        errors.username = "This username is already taken.";
      }
    }

    if (!editingAccount && !password) {
      errors.password = "Password is required.";
    } else if (password && password.length < 6) {
      errors.password = "Use at least 6 characters.";
    }

    if (!subAccount.usertypeId) {
      errors.usertypeId = "User type is required.";
    }

    if (!subAccount.branchId) {
      errors.branchId = "Branch is required.";
    }

    if (!subAccount.previleges) {
      errors.previleges = "Privileges are required.";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    // Update
    if (editingAccount) {
      try {
        setIsSavingAccount(true);
        await dispatch(
          createSubAccount({
            ...(editingAccount.apiId ? { id: editingAccount.apiId } : {}),
            name,
            phone_number: phoneNumber,
            user_name: userName,
            ...(password ? { password } : {}),
            usertype_id: subAccount.usertypeId,
            branch_id: subAccount.branchId,
            privileges: subAccount.previleges,
          }),
        ).unwrap();

        toast.success("Account updated");
        await fetchSubAccounts();
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

    // Create
    try {
      setIsSavingAccount(true);
      await dispatch(
        createSubAccount({
          name,
          phone_number: phoneNumber,
          user_name: userName,
          password,
          usertype_id: subAccount.usertypeId,
          branch_id: subAccount.branchId,
          privileges: subAccount.previleges,
        }),
      ).unwrap();

      toast.success("Account created");
      await fetchSubAccounts();
      setIsAddOpen(false);
      resetAddForm();
    } catch (error) {
      toast.error("Failed to create account", {
        description:
          typeof error === "string" ? error : (error?.message ?? undefined),
      });
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
        return <SchoolDetails getAllSchoolBranch={getAllSchoolBranch} />;
        case "screening":
        return <ScreeningPage  />;
      case "team":
        return (
          <TeamPage
            accounts={accounts}
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
            isSaving={isSavingAccount}
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
