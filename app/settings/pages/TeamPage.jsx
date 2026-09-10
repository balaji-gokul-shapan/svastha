"use client";

import React, { useMemo, useState } from "react";

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
} from "@/components/ui/dropdown-menu";

import {
  MoreHorizontal,
  Pencil,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  X,
  UserRoundPlus,
  CirclePlus,
} from "lucide-react";

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
import { TextField } from "@/components/ui/text-field";
import ReusableSelect from "@/components/ui/reusable-select";
import {
  USER_TYPE_OPTIONS,
  PRIVILEGE_OPTIONS,
  SECTION_OPTIONS,
} from "../datas/settingsData";
import { EmptyState } from "@/components/ui/empty-state";
import dynamic from "next/dynamic";
// import ClassSectionManager from "../components/ClassSectionManager";
const ClassSectionManager = dynamic(
  () => import("../components/ClassSectionManager"),
);

const AVATAR_STYLES = [
  "bg-blue-100 text-blue-700",
  "bg-green-100 text-green-700",
  "bg-purple-100 text-purple-700",
  "bg-orange-100 text-orange-700",
  "bg-pink-100 text-pink-700",
];

const getInitials = (name = "") => {
  return name
    .split(" ")
    .map((item) => item[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
};

const TeamPage = ({
  accounts,
  selectedIds,
  authAccName,
  onToggleRow,
  onToggleAll,
  onToggleStatus,

  onDuplicate,
  onDelete,
  onBulkDelete,
  onEdit,
  onAdd,

  isAddOpen,
  onAddOpenChange,

  showPassword,
  setShowPassword,

  formErrors,

  onSubmit,

  editingAccount,

  deleteTarget,
  setDeleteTarget,
  handleEditAccount,
  onConfirmDelete,
  subAccount,
  setSubAccount,
  branches = [],
  isSaving = false,
}) => {
  const handleSubAccountChange = (field, value) => {
    setSubAccount((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const accountList = Array.isArray(accounts) ? accounts : [];

  // ---- FILTER STATE ----
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [privilegeFilter, setPrivilegeFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Options for class/section filters — derived from the shared mock data
  // (swap for API-driven options when available).
  const classOptions = React.useMemo(() => {
    const grades = new Set();
    SECTION_OPTIONS.forEach((opt) => {
      const grade = opt.label.match(/(\d+)/)?.[1];
      if (grade) grades.add(grade);
    });
    return [
      { value: "all", label: "All Classes" },
      ...Array.from(grades)
        .sort((a, b) => Number(a) - Number(b))
        .map((grade) => ({ value: grade, label: `Grade ${grade}` })),
    ];
  }, []);

  const sectionOptions = React.useMemo(() => {
    const sections = new Set();
    SECTION_OPTIONS.forEach((opt) => {
      const section = opt.label.split(" - ")[1];
      if (section) sections.add(section);
    });
    return [
      { value: "all", label: "All Sections" },
      ...Array.from(sections)
        .sort()
        .map((section) => ({ value: section, label: section })),
    ];
  }, []);

  const privilegeOptions = React.useMemo(() => {
    const privileges = new Set();
    accountList.forEach((account) => {
      const value = String(account?.previleges ?? "").trim();
      if (value) privileges.add(value);
    });
    return [
      { value: "all", label: "All Privileges" },
      ...Array.from(privileges)
        .sort()
        .map((privilege) => ({
          value: privilege,
          label:
            PRIVILEGE_OPTIONS.find((opt) => opt.value === privilege)?.label ??
            privilege,
        })),
    ];
  }, [accountList]);

  // Normalizes a possibly-comma-separated / array-valued field into an array
  // of lowercase strings for matching.
  const toFilterTokens = (value) => {
    if (value === null || value === undefined) return [];
    if (Array.isArray(value)) {
      return value
        .map((item) => String(item).trim().toLowerCase())
        .filter(Boolean);
    }
    return String(value)
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean);
  };

  // ---- FILTERING ----
  const filteredAccounts = React.useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return accountList.filter((account) => {
      // Search by name (also matches username as a convenience).
      if (keyword) {
        const haystack = [account?.name, account?.userName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }

      // Status filter: active / inactive / all.
      if (statusFilter !== "all") {
        const status = String(account?.status ?? "").toLowerCase();
        if (status !== statusFilter) return false;
      }

      // Class filter — accounts may hold a single value or a comma list.
      if (classFilter !== "all") {
        const tokens = toFilterTokens(account?.class);
        if (!tokens.includes(String(classFilter).toLowerCase())) return false;
      }

      // Section filter.
      if (sectionFilter !== "all") {
        const tokens = toFilterTokens(account?.section);
        if (!tokens.includes(String(sectionFilter).toLowerCase())) return false;
      }

      // Privilege filter.
      if (privilegeFilter !== "all") {
        const tokens = toFilterTokens(account?.previleges);
        if (!tokens.includes(String(privilegeFilter).toLowerCase()))
          return false;
      }

      return true;
    });
  }, [
    accountList,
    searchQuery,
    statusFilter,
    classFilter,
    sectionFilter,
    privilegeFilter,
  ]);

  // ---- PAGINATION ----
  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / pageSize));

  // Clamp the page when filters shrink the result set.
  React.useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    statusFilter,
    classFilter,
    sectionFilter,
    privilegeFilter,
    pageSize,
  ]);

  React.useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedAccounts = React.useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAccounts.slice(start, start + pageSize);
  }, [filteredAccounts, currentPage, pageSize]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setClassFilter("all");
    setSectionFilter("all");
    setPrivilegeFilter("all");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    classFilter !== "all" ||
    sectionFilter !== "all" ||
    privilegeFilter !== "all";

  const isAllSelected =
    accountList.length > 0 && selectedIds.length === accountList.length;

  const isIndeterminate =
    selectedIds.length > 0 && selectedIds.length < accountList.length;

  return (
    <>
      {/* ================================
          ACCOUNTS
      ================================= */}

      <article className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-row items-center justify-between gap-2">
          <div className="flex flex-col items-start">
            <h3 className="text-lg font-semibold text-foreground">Accounts</h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage team members, their designations, and access status.
            </p>
          </div>

          {selectedIds.length > 0 ? (
            <div className="ml-auto flex shrink-0 items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground">
                {selectedIds.length} of {accountList.length} selected
              </span>

              <Button
                type="button"
                variant="outline"
                onClick={onBulkDelete}
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
              onClick={onAdd}
            >
              <UserRoundPlus size={14} />
              Add New Account
            </Button>
          )}
        </div>

        {/* FILTER BAR */}

        <div className="mt-4 flex flex-col gap-3 rounded-md border border-border bg-muted/30 p-3 lg:flex-row lg:items-end lg:flex-wrap">
          {/* SEARCH */}
          <div className="min-w-0 flex-1 space-y-1.5">
            <TextField
              label="Search"
              labelClassName="text-sm font-medium text-foreground"
              id="team-search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name or username..."
              autoComplete="off"
            />
          </div>

          {/* STATUS */}
          <div className="w-full space-y-1.5 lg:w-40">
            <ReusableSelect
              label="Status"
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: "all", label: "All" },
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
              placeholder="Status"
            />
          </div>

          {/* CLASS */}
          <div className="w-full space-y-1.5 lg:w-40">
            <ReusableSelect
              label="Class"
              value={classFilter}
              onChange={setClassFilter}
              options={classOptions}
              placeholder="Class"
            />
          </div>

          {/* SECTION */}
          <div className="w-full space-y-1.5 lg:w-40">
            <ReusableSelect
              label="Section"
              value={sectionFilter}
              onChange={setSectionFilter}
              options={sectionOptions}
              placeholder="Section"
            />
          </div>

          {/* PRIVILEGES */}
          <div className="w-full space-y-1.5 lg:w-44">
            <ReusableSelect
              label="Privileges"
              value={privilegeFilter}
              onChange={setPrivilegeFilter}
              options={privilegeOptions}
              placeholder="Privileges"
            />
          </div>

          {/* CLEAR */}
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              className="gap-1.5"
            >
              <X className="size-4" />
              Clear
            </Button>
          ) : null}
        </div>

        {hasActiveFilters ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Showing {filteredAccounts.length} of {accountList.length} accounts
          </p>
        ) : null}

        {/* TABLE */}

        <div className="mt-4 overflow-x-auto rounded-md border border-border">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground">
              <tr>
                <th className="w-12 px-4 py-3 font-medium">
                  <Checkbox
                    checked={isAllSelected}
                    indeterminate={isIndeterminate}
                    onCheckedChange={onToggleAll}
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
              {paginatedAccounts.map((account) => {
                const isSelected = selectedIds.includes(account.id);

                const isActive = account.status === "active";

                return (
                  <tr
                    key={account.id}
                    className={isSelected ? "bg-muted/40" : undefined}
                  >
                    {/* CHECKBOX */}

                    <td className="px-4 py-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => onToggleRow(account.id)}
                        aria-label={`Select ${account.name}`}
                      />
                    </td>

                    {/* NAME */}

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span
                          aria-hidden="true"
                          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            AVATAR_STYLES[account.id % AVATAR_STYLES.length]
                          }`}
                        >
                          {getInitials(account.name)}
                        </span>

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

                    {/* STATUS */}

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={isActive}
                          onCheckedChange={() => onToggleStatus(account.id)}
                          aria-label={`Toggle status for ${account.name}`}
                        />

                        <span
                          className={`text-xs font-medium ${
                            isActive ? "text-success" : "text-muted-foreground"
                          }`}
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                    </td>

                    {/* ACTIONS */}

                    <td className="px-4 py-3 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          aria-label={`Actions for ${account.name}`}
                          className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground"
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-36">
                          <DropdownMenuItem onClick={() => onEdit(account)}>
                            <Pencil />
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() => onDuplicate(account.id)}
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

              {filteredAccounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-10 text-center text-sm text-muted-foreground"
                  >
                    <EmptyState
                      title="No Screening Configurations Yet"
                      description="Set up your first screening configuration to define and manage the screening options used for school health assessments."
                      action={
                        <Button
                          type="button"
                          variant="outline"
                          //   onClick={() => setOpen(true)}
                        >
                          {/* <Building2 className="size-4" /> */}
                          Create Screening Request
                        </Button>
                      }
                    />
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}

        {filteredAccounts.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* PAGE SIZE */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Rows</span>

              <ReusableSelect
                value={String(pageSize)}
                onChange={(value) => setPageSize(Number(value))}
                options={[
                  { value: "5", label: "5" },
                  { value: "10", label: "10" },
                  { value: "25", label: "25" },
                  { value: "50", label: "50" },
                ]}
                className="w-24"
              />

              <span className="text-xs text-muted-foreground">
                Showing{" "}
                {Math.min(
                  (currentPage - 1) * pageSize + 1,
                  filteredAccounts.length,
                )}
                –{Math.min(currentPage * pageSize, filteredAccounts.length)} of{" "}
                {filteredAccounts.length}
              </span>
            </div>

            {/* PAGE NAVIGATION */}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Previous
              </Button>

              <span className="text-xs font-medium text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
              >
                Next
              </Button>
            </div>
          </div>
        ) : null}
      </article>

      {/* ================================
          ADD / EDIT ACCOUNT DIALOG
      ================================= */}

      <Dialog open={isAddOpen} onOpenChange={onAddOpenChange}>
        <DialogContent
          className="
      w-[95vw]
      max-w-4xl
      max-h-[90vh]
      overflow-hidden
      p-0
    "
        >
          {/* HEADER */}
          <DialogHeader className="border-b border-border px-6 py-5">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              {editingAccount ? "Edit Account" : "Create Account"}
            </DialogTitle>

            <DialogDescription className="text-sm text-muted-foreground">
              {editingAccount
                ? "Update this team member's account details."
                : "Add a team member and configure their account access."}
            </DialogDescription>
          </DialogHeader>

          {/* SCROLLABLE CONTENT */}
          <form
            onSubmit={onSubmit}
            noValidate
            className="flex max-h-[calc(90vh-145px)] flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* ACCOUNT DETAILS */}
              <section className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Account Details
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Enter the basic information for this team member.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                  {/* NAME */}
                  <div className="space-y-1.5">
                    <TextField
                      label="Name"
                      labelClassName="text-sm font-medium text-foreground"
                      id="name"
                      name="name"
                      value={subAccount?.name ?? ""}
                      onChange={(event) =>
                        handleSubAccountChange("name", event.target.value)
                      }
                      placeholder="e.g. Priya Sharma"
                      autoComplete="off"
                    />

                    {formErrors?.name && (
                      <p className="text-xs text-destructive">
                        {formErrors.name}
                      </p>
                    )}
                  </div>

                  {/* PHONE */}
                  <div className="space-y-1.5">
                    <TextField
                      label="Phone Number"
                      labelClassName="text-sm font-medium text-foreground"
                      id="phone-number"
                      name="phoneNumber"
                      value={subAccount?.phoneNumber ?? ""}
                      onChange={(event) =>
                        handleSubAccountChange(
                          "phoneNumber",
                          event.target.value,
                        )
                      }
                      placeholder="e.g. 9876543210"
                      autoComplete="off"
                    />

                    {formErrors?.phoneNumber && (
                      <p className="text-xs text-destructive">
                        {formErrors.phoneNumber}
                      </p>
                    )}
                  </div>

                  {/* USERNAME */}
                  <div className="space-y-1.5">
                    <TextField
                      label="Username"
                      labelClassName="text-sm font-medium text-foreground"
                      id="account-username"
                      name="userName"
                      value={subAccount?.userName ?? ""}
                      onChange={(event) =>
                        handleSubAccountChange("userName", event.target.value)
                      }
                      placeholder="e.g. priya.sharma"
                      autoComplete="off"
                    />

                    {formErrors?.username && (
                      <p className="text-xs text-destructive">
                        {formErrors.username}
                      </p>
                    )}
                  </div>

                  {/* PASSWORD */}
                  <div className="space-y-1.5">
                    <div className="relative">
                      <TextField
                        label="Password"
                        labelClassName="text-sm font-medium text-foreground"
                        id="account-password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={subAccount?.password ?? ""}
                        onChange={(event) =>
                          handleSubAccountChange("password", event.target.value)
                        }
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
                        onClick={() => setShowPassword((value) => !value)}
                        className="absolute right-2 top-8 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground
                  "
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword ? (
                          <EyeOff className="size-4" />
                        ) : (
                          <Eye className="size-4" />
                        )}
                      </button>
                    </div>

                    {formErrors?.password && (
                      <p className="text-xs text-destructive">
                        {formErrors.password}
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* ACCESS DETAILS */}
              <section className="mt-7 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Access & Assignment
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Select the user's role and assign them to a branch.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                  {/* USER TYPE */}
                  <div className="space-y-1.5"> 
                  <div>
                    <ReusableSelect
                      label="User Type"
                      withPortal
                      value={subAccount?.user_type_id ?? ""}
                      onChange={(value) =>
                        handleSubAccountChange("user_type_id", value)
                      }
                      options={USER_TYPE_OPTIONS}
                      placeholder="Select user type"
                    />
                  </div>
                    {formErrors?.user_type_id && (
                      <p className="text-xs text-destructive">
                        {formErrors.user_type_id}
                      </p>
                    )}
                  </div>

                  {/* BRANCH */}
                  <div className="space-y-1.5">
                    <ReusableSelect
                      label="Branch"
                      withPortal
                      value={subAccount?.branchId ?? ""}
                      onChange={(value) =>
                        handleSubAccountChange("branchId", value)
                      }
                      options={branches}
                      placeholder="Select branch"
                    />

                    {formErrors?.branchId && (
                      <p className="text-xs text-destructive">
                        {formErrors.branchId}
                      </p>
                    )}
                  </div>

                  {/* PRIVILEGES — required for all user types except type 1 */}
                  {/* {String(subAccount?.usertypeId ?? "").trim() !== "1" && (
                    <div className="space-y-1.5">
                      <ReusableSelect
                        label="Privileges"
                        withPortal
                        value={subAccount?.previleges ?? ""}
                        onChange={(value) =>
                          handleSubAccountChange("previleges", value)
                        }
                        options={PRIVILEGE_OPTIONS}
                        placeholder="Select privileges"
                      />

                      {formErrors?.previleges && (
                        <p className="text-xs text-destructive">
                          {formErrors.previleges}
                        </p>
                      )}
                    </div>
                  )} */}
                </div>
              </section>

              {/* CLASS & SECTION */}
              {authAccName?.user_type_id !== 1 && (
              <section className="mt-7">
                <div className="mb-4">
                  <h3 className="text-sm font-semibold text-foreground">
                    Class & Section
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Assign the team member to the required classes and sections.
                  </p>
                </div>

                <ClassSectionManager />
                {/* <div className="rounded-lg border border-border bg-muted/20 p-4">
          </div> */}
              </section>

              )}
            </div>

            {/* FOOTER */}
            <DialogFooter className="shrink-0 border-t border-border bg-background px-6 py-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onAddOpenChange(false)}
                disabled={isSaving}
              >
                <X className="size-4" />
                Cancel
              </Button>

              <Button type="submit" disabled={isSaving}>
                <CirclePlus className="size-4" />

                {isSaving
                  ? "Saving..."
                  : editingAccount
                    ? "Save Changes"
                    : "Create Account"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ================================
          DELETE CONFIRMATION
      ================================= */}

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-[90%] sm:max-w-[50%] md:max-w-[35%]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete account
              {deleteTarget === "bulk" ? "s" : ""}?
            </AlertDialogTitle>

            <AlertDialogDescription>
              {deleteTarget === "bulk"
                ? "This will permanently delete the selected accounts. This action cannot be undone."
                : `This will permanently delete "${deleteTarget?.name}". This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>No, keep it</AlertDialogCancel>

            <AlertDialogAction onClick={onConfirmDelete}>
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TeamPage;
