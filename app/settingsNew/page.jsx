"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import Aside from "./pages/aside";

import AppearancePage from "./pages/AppearancePage";
import MyDetailsPage from "./pages/MyDetailspage";
import ProfilePage from "./pages/ProfilePage";
import TeamPage from "./pages/TeamPage";
import PasswordPage from "./pages/PasswordPage";
import BillingPage from "./pages/Billingpage";
import ApplicationsPage from "./pages/ApplicationPage";
import ApiPage from "./pages/ApiPage";
import { useAppDispatch } from "@/lib/hooks";
import {
  getAllRegisterSchool,
  getRegisterSchool,
} from "@/lib/features/registerSchoolSlice";
import { useQuery } from "@tanstack/react-query";
import CampDetails from "./pages/CampDetails";

const Settings = () => {
  // =========================================================
  // PROFILE
  // =========================================================
  const dispatch = useAppDispatch();
  const profileInputRef = useRef(null);

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");

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

  const schoolId = 3;
  const { data: schoolProfile, isLoading: profileLoading } = useQuery({
    queryKey: ["register-school"],
    queryFn: () => dispatch(getRegisterSchool({ id: schoolId })).unwrap(),
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const { data: AllSchoolData, isLoading } = useQuery({
    queryKey: ["all-register-schools"],
    queryFn: () => dispatch(getAllRegisterSchool()).unwrap(),
  });

  // useEffect(() => {
  //   if (!AllSchoolData.length) dispatch(getAllRegisterSchool());
  // }, [dispatch, AllSchoolData.length]);

  useEffect(() => {
    if (!schoolProfile) return;
    const record = schoolProfile?.data ?? schoolProfile;
    setName((prev) => prev || record?.name || record?.school_name || "");
    setUsername((prev) => prev || record?.username || record?.email || "");
  }, [schoolProfile]);
  console.log(schoolProfile, "schoolProfile");

  // =========================================================
  // TEAM
  // =========================================================

  const initialAccounts = [
    {
      id: 1,
      name: "Arjun Kumar",
      designation: "School Administrator",
      status: "active",
    },
    {
      id: 2,
      name: "Priya Sharma",
      designation: "Medical Officer",
      status: "active",
    },
    {
      id: 3,
      name: "Rahul Verma",
      designation: "Teacher",
      status: "inactive",
    },
    {
      id: 4,
      name: "Kavin S",
      designation: "Lab Technician",
      status: "active",
    },
    {
      id: 5,
      name: "Meera Joshi",
      designation: "Counselor",
      status: "inactive",
    },
  ];

  const [accounts, setAccounts] = useState(initialAccounts);
  const [selectedIds, setSelectedIds] = useState([]);

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
      toast.success(`Deleted "${target.name}"`);
    }
  };

  // Bulk delete
  const deleteSelectedAccounts = () => {
    const count = selectedIds.length;

    if (count === 0) return;

    setAccounts((prev) =>
      prev.filter((account) => !selectedIds.includes(account.id)),
    );

    setSelectedIds([]);

    toast.success(
      count === 1 ? "Deleted 1 account" : `Deleted ${count} accounts`,
    );
  };

  // =========================================================
  // ACCOUNT FORM
  // =========================================================

  const [isAddOpen, setIsAddOpen] = useState(false);

  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [formErrors, setFormErrors] = useState({});

  const [deleteTarget, setDeleteTarget] = useState(null);

  const [editingAccount, setEditingAccount] = useState(null);

  // Reset form
  const resetAddForm = () => {
    setNewName("");
    setNewUsername("");
    setNewPassword("");
    setShowPassword(false);
    setFormErrors({});
    setEditingAccount(null);
  };

  // Edit
  const handleEditAccount = (account) => {
    setEditingAccount(account);

    setNewName(account.name || "");
    setNewUsername(account.username || "");
    setNewPassword("");

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

  // Create / update
  const handleCreateAccount = (event) => {
    event.preventDefault();

    const errors = {};

    if (!newName.trim()) {
      errors.name = "Name is required.";
    }

    if (!newUsername.trim()) {
      errors.username = "Username is required.";
    } else {
      const usernameTaken = accounts.some(
        (account) =>
          account.id !== editingAccount?.id &&
          (account.username || "").toLowerCase() ===
            newUsername.trim().toLowerCase(),
      );

      if (usernameTaken) {
        errors.username = "This username is already taken.";
      }
    }

    if (!editingAccount && !newPassword) {
      errors.password = "Password is required.";
    } else if (newPassword && newPassword.length < 6) {
      errors.password = "Use at least 6 characters.";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    // Update
    if (editingAccount) {
      setAccounts((prev) =>
        prev.map((account) =>
          account.id === editingAccount.id
            ? {
                ...account,
                name: newName.trim(),
                username: newUsername.trim(),
                ...(newPassword ? { password: newPassword } : {}),
              }
            : account,
        ),
      );

      toast.success("Account updated");
    }

    // Create
    else {
      const nextId =
        accounts.reduce((max, account) => Math.max(max, account.id), 0) + 1;

      setAccounts((prev) => [
        ...prev,
        {
          id: nextId,
          name: newName.trim(),
          username: newUsername.trim(),
          password: newPassword,
          designation: "",
          status: "active",
        },
      ]);

      toast.success("Account created");
    }

    setIsAddOpen(false);
    resetAddForm();
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

  // =========================================================
  // APPEARANCE
  // =========================================================

  const SIDEBAR_FEATURES = [
    "Recent changes",
    "Recent activity",
    "Notifications",
  ];

  const [theme, setTheme] = useState("system");

  const [transparentSidebar, setTransparentSidebar] = useState(true);

  const [sidebarFeature, setSidebarFeature] = useState(SIDEBAR_FEATURES[0]);

  const [tableView, setTableView] = useState("default");

  // Restore saved appearance settings once on mount (after hydration).
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem("Svastha-appearance");
      if (!raw) return;

      const saved = JSON.parse(raw);

      if (["system", "light", "dark"].includes(saved.theme)) {
        setTheme(saved.theme);
      }
      if (typeof saved.transparentSidebar === "boolean") {
        setTransparentSidebar(saved.transparentSidebar);
      }
      if (SIDEBAR_FEATURES.includes(saved.sidebarFeature)) {
        setSidebarFeature(saved.sidebarFeature);
      }
      if (["default", "compact"].includes(saved.tableView)) {
        setTableView(saved.tableView);
      }
    } catch {
      // Corrupt or unavailable storage — keep defaults.
    }
  }, []);

  const handleAppearanceCancel = () => {
    setTheme("system");
    setTransparentSidebar(true);
    setSidebarFeature(SIDEBAR_FEATURES[0]);
    setTableView("default");

    toast.success("Appearance changes discarded");
  };

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

  // =========================================================
  // NAVIGATION
  // =========================================================

  const [activeTab, setActiveTab] = useState("my-details");

  const [navQuery, setNavQuery] = useState("");

  const settingsNav = [
    {
      id: "my-details",
      label: "My details",
    },
    {
      id: "profile",
      label: "Profile",
    },
    {
      id: "SchoolDetails",
      label: "School Details",
    },

    { id: "campDetails", label: "Campus Details" },
    {
      id: "appearance",
      label: "Appearance",
    },
    {
      id: "team",
      label: "Team",
      // badge: String(accounts.length),
    },
    {
      id: "billing",
      label: "Billing",
    },
    {
      id: "applications",
      label: "Applications",
    },
    {
      id: "api",
      label: "API",
    },
  ];

  const visibleSettingsNav = settingsNav.filter((item) =>
    item.label.toLowerCase().includes(navQuery.trim().toLowerCase()),
  );

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // =========================================================
  // ACTIVE TAB
  // =========================================================

  const renderActiveTab = () => {
    switch (activeTab) {
      case "appearance":
        return (
          <AppearancePage
            theme={theme}
            onThemeChange={setTheme}
            transparentSidebar={transparentSidebar}
            onTransparentSidebarChange={setTransparentSidebar}
            sidebarFeature={sidebarFeature}
            onSidebarFeatureChange={setSidebarFeature}
            tableView={tableView}
            onTableViewChange={setTableView}
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
            name={name}
            setName={setName}
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
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
            name={name}
            setName={setName}
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
          />
        );
        case "campDetails":
        return (
          <>
            <CampDetails schoolProfile={schoolProfile} />
          </>
        );
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
            newName={newName}
            setNewName={setNewName}
            newUsername={newUsername}
            setNewUsername={setNewUsername}
            newPassword={newPassword}
            setNewPassword={setNewPassword}
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

      case "SchoolDetails":
        return <PasswordPage />;

      case "billing":
        return <BillingPage />;

      case "applications":
        return <ApplicationsPage />;

      case "api":
        return <ApiPage />;

      default:
        return <AppearancePage />;
    }
  };

  // =========================================================
  // RETURN
  // =========================================================

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

      {/* CONTENT */}

      <div className="min-w-0 flex-1 space-y-6">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-foreground" />

          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>

        {renderActiveTab()}
      </div>
    </div>
  );
};

export default Settings;
