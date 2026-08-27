"use client";
import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Camera,
  UserRound,
  X,
  MoreHorizontal,
  Pencil,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Search,
  Contact,
  KeyRound,
  Palette,
  Users,
  CreditCard,
  LayoutGrid,
  Braces,
  Check,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import Aside from "./pages/aside";
import { AppearanceSettings } from "./pages/AppearancePage";
import ProfilePreview from "./pages/ProfilePreview";
import OverAllPreview from "./pages/OverAllPreview";
import FormField from "./components/FormField";
import Avatar from "./components/Avatar";

const Settings = () => {
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

  // Optional — the student can be registered without a photo.

  // ---------------------------------------------------------------------
  // Accounts table (demo data — replace with real API data as needed)
  // ---------------------------------------------------------------------
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
    { id: 3, name: "Rahul Verma", designation: "Teacher", status: "inactive" },
    { id: 4, name: "Kavin S", designation: "Lab Technician", status: "active" },
    {
      id: 5,
      name: "Meera Joshi",
      designation: "Counselor",
      status: "inactive",
    },
  ];

  const [accounts, setAccounts] = useState(initialAccounts);
  const [selectedIds, setSelectedIds] = useState([]);

  const isAllSelected =
    accounts.length > 0 && selectedIds.length === accounts.length;
  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < accounts.length;

  const toggleRow = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id],
    );
  };

  const toggleAll = () => {
    setSelectedIds((prev) =>
      isAllSelected ? [] : accounts.map((account) => account.id),
    );
  };

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

  const deleteAccount = (id) => {
    const target = accounts.find((account) => account.id === id);
    setAccounts((prev) => prev.filter((account) => account.id !== id));
    setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
    if (target) {
      toast.success(`Deleted "${target.name}"`);
    }
  };

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

  const handleConfirmDelete = () => {
    if (deleteTarget === "bulk") {
      deleteSelectedAccounts();
    } else if (deleteTarget) {
      deleteAccount(deleteTarget.id);
    }
    setDeleteTarget(null);
  };
  const deleteSelectedAccount = (id) => {
    console.log(id, "deleteSelectedAccount");

    // setAccounts((prev) => prev.filter((account) => account.id !== id));
    // setSelectedIds((prev) => prev.filter((selectedId) => selectedId !== id));
  };

  // ---------------------------------------------------------------------
  // Create Account modal state + handlers
  // ---------------------------------------------------------------------
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Account(s) pending deletion — object = single row, "bulk" = all selected.
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingAccount, setEditingAccount] = useState(null);

  const resetAddForm = () => {
    setNewName("");
    setNewUsername("");
    setNewPassword("");
    setShowPassword(false);
    setFormErrors({});
    setEditingAccount(null);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setNewName(account.name || "");
    setNewUsername(account.username || "");
    setNewPassword("");
    setShowPassword(false);
    setFormErrors({});
    setIsAddOpen(true);
  };

  const handleAddOpenChange = (open) => {
    setIsAddOpen(open);
    if (!open) resetAddForm();
  };

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

    // Password is required only when creating a new account
    if (!editingAccount && !newPassword) {
      errors.password = "Password is required.";
    } else if (newPassword && newPassword.length < 6) {
      errors.password = "Use at least 6 characters.";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    if (editingAccount) {
      // Update existing account
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
    } else {
      // Create new account
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
    }

    setIsAddOpen(false);
    resetAddForm();
  };

  // ---------------------------------------------------------------------
  // Settings layout: sidebar navigation + active section
  // ---------------------------------------------------------------------
  const [activeTab, setActiveTab] = useState("appearance");
  const [navQuery, setNavQuery] = useState("");
  const SIDEBAR_FEATURES = [
    "Recent changes",
    "Recent activity",
    "Notifications",
  ];

  const [theme, setTheme] = useState("system");
  const [transparentSidebar, setTransparentSidebar] = useState(true);
  const [sidebarFeature, setSidebarFeature] = useState(SIDEBAR_FEATURES[0]);
  const [tableView, setTableView] = useState("default");

  const settingsNav = [
    { id: "my-details", label: "My details", icon: Contact },
    { id: "profile", label: "Profile", icon: UserRound },
    { id: "password", label: "Password", icon: KeyRound },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "team", label: "Team", icon: Users, badge: String(accounts.length) },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "applications", label: "Applications", icon: LayoutGrid },
    { id: "api", label: "API", icon: Braces },
  ];

  const visibleSettingsNav = settingsNav.filter((item) =>
    item.label.toLowerCase().includes(navQuery.trim().toLowerCase()),
  );

  const handleAppearanceCancel = () => {
    setTheme("system");
    setTransparentSidebar(true);
    onSidebarFeatureChange(SIDEBAR_FEATURES[0]);
    setTableView("default");
    toast.success("Appearance changes discarded");
  };

  const handleAppearanceSave = () => {
    toast.success("Appearance settings saved");
  };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:gap-8">
      {/* ------------------------- Sidebar ------------------------- */}

      <Aside
        settings={visibleSettingsNav}
        navQuery={setNavQuery}
        query={navQuery}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />
      {/* ------------------------- Content ------------------------- */}
      <div className="min-w-0 flex-1 space-y-6">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        </div>

        {activeTab === "appearance" ? (
          <AppearanceSettings
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
        ) : null}
        {activeTab === "my-details" ? (
          <OverAllPreview
            profileImageFile={profileImageFile}
            setProfileImageFile={setProfileImageFile}
          />
        ) : null}

        {activeTab === "profile" ? (
          <ProfilePreview
            profileImageFile={profileImageFile}
            setProfileImageFile={setProfileImageFile}
            profileInputRef={profileInputRef}
            imagePreviewUrl={imagePreviewUrl}
            setImagePreviewUrl={setImagePreviewUrl}
          />
        ) : null}

        {["password", "billing", "applications", "api"].includes(activeTab) ? (
          <section className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
            <p className="text-sm font-medium text-foreground">
              {settingsNav.find((item) => item.id === activeTab)?.label}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              This section is coming soon.
            </p>
          </section>
        ) : null}

        {activeTab === "team" ? (
          <>
            <article className="rounded-lg border border-border bg-card p-4 sm:p-5">
              <div className="flex flex-row items-center justify-between gap-2">
                <div className="flex flex-col items-start">
                  <h3 className="text-lg font-semibold text-foreground">
                    Accounts
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Manage team members, their designations, and access status.
                  </p>
                </div>
                {selectedIds.length > 0 ? (
                  <div className="ml-auto flex shrink-0 items-center gap-3">
                    <span className="text-xs font-medium text-muted-foreground">
                      {selectedIds.length} of {accounts.length} selected
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDeleteTarget("bulk")}
                      className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="size-4" />
                      Delete
                      {selectedIds.length > 1 ? ` (${selectedIds.length})` : ""}
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="ml-auto shrink-0"
                    onClick={() => setIsAddOpen(true)}
                  >
                    Add New Account
                  </Button>
                )}
              </div>

              <div className="mt-4 overflow-x-auto rounded-md border border-border">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="w-12 px-4 py-3 font-medium">
                        <Checkbox
                          checked={isAllSelected}
                          indeterminate={isIndeterminate}
                          onCheckedChange={toggleAll}
                          aria-label="Select all accounts"
                        />
                      </th>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="w-20 px-4 py-3 text-right font-medium">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border bg-card">
                    {accounts.map((account) => {
                      const isSelected = selectedIds.includes(account.id);
                      const isActive = account.status === "active";
                      return (
                        <tr
                          key={account.id}
                          className={isSelected ? "bg-muted/40" : undefined}
                        >
                          <td className="px-4 py-3">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() => toggleRow(account.id)}
                              aria-label={`Select ${account.name}`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <Avatar name={account.name} id={account.id} />
                              <div className="min-w-0">
                                <p className="truncate font-medium text-foreground">
                                  {account.name}
                                </p>
                                {account.designation ? (
                                  <p className="truncate text-xs text-muted-foreground">
                                    {account.designation}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={isActive}
                                onCheckedChange={() => toggleStatus(account.id)}
                                aria-label={`Toggle status for ${account.name}`}
                              />
                              <span
                                className={`text-xs font-medium ${
                                  isActive
                                    ? "text-success"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {isActive ? "Active" : "Inactive"}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                aria-label={`Actions for ${account.name}`}
                                className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/60"
                              >
                                <MoreHorizontal className="size-4" />
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-36">
                                <DropdownMenuItem
                                  onClick={() => {
                                    (setIsAddOpen(true),
                                      handleEditAccount(account),
                                      console.log("Edit account:", account.id));
                                  }}
                                >
                                  <Pencil />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => duplicateAccount(account.id)}
                                >
                                  <Copy />
                                  Copy
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => setDeleteTarget(account)}
                                  className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                                >
                                  <Trash2 />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                    {accounts.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-4 py-10 text-center text-sm text-muted-foreground"
                        >
                          No accounts yet. Click “Add New Account” to create
                          one.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </article>

            <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </>
        ) : null}

        <Dialog open={isAddOpen} onOpenChange={handleAddOpenChange}>
          <DialogContent className="shadow-2xs sm:max-w-max md:max-w-1/2 lg:max-w-1/4">
            <DialogHeader>
              <DialogTitle>
                {editingAccount ? "Edit Account" : "Create Account"}
              </DialogTitle>
              <DialogDescription>
                {editingAccount
                  ? "Update this team member's account details"
                  : "Add a team member and set their sign-in credentials."}
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleCreateAccount}
              noValidate
              className="mt-4 space-y-4"
            >
              <div className="space-y-1.5">
                <label
                  htmlFor="account-name"
                  className="text-sm font-medium text-foreground"
                >
                  Name
                </label>
                <Input
                  id="account-name"
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  placeholder="e.g. Priya Sharma"
                  autoComplete="off"
                />
                {formErrors.name ? (
                  <p className="text-xs text-destructive">{formErrors.name}</p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="account-username"
                  className="text-sm font-medium text-foreground"
                >
                  Username
                </label>
                <Input
                  id="account-username"
                  value={newUsername}
                  onChange={(event) => setNewUsername(event.target.value)}
                  placeholder="e.g. priya.sharma"
                  autoComplete="off"
                />
                {formErrors.username ? (
                  <p className="text-xs text-destructive">
                    {formErrors.username}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="account-password"
                  className="text-sm font-medium text-foreground"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="account-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(event) => setNewPassword(event.target.value)}
                    placeholder={
                      editingAccount
                        ? "Leave blank to keep current password"
                        : "Minimum 6 characters"
                    }
                    autoComplete="new-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {formErrors.password ? (
                  <p className="text-xs text-destructive">
                    {formErrors.password}
                  </p>
                ) : null}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingAccount ? "Save Changes" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog
          open={deleteTarget !== null}
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(null);
          }}
        >
          <AlertDialogContent className="max-w-[90%] sm:max-w-[50%] md:max-w-[35%]">
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete account{deleteTarget === "bulk" ? "s" : ""}?
              </AlertDialogTitle>
              <AlertDialogDescription>
                {deleteTarget === "bulk"
                  ? `This will permanently delete ${selectedIds.length} selected account${selectedIds.length === 1 ? "" : "s"}. This action cannot be undone.`
                  : `This will permanently delete "${deleteTarget?.name}". This action cannot be undone.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>No, keep it</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmDelete}>
                Yes, Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Settings;
