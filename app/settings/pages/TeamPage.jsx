"use client";

import React, { useCallback, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { getRoleFromAccount, useAuthRole } from "@/lib/user-role";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Users,
  ShieldCheck,
  SlidersHorizontal,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  Pencil,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  X,
  UserRoundPlus,
  CirclePlus,
  CircleCheck,
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

/**
 * Read a human-readable value out of a privilege entry's class/section field.
 * The API may hand back a plain string ("3"), a nested relation object
 * ({ name: "III" } / { class_name: "III" }), or a raw id (3 / "3") — so
 * resolve whichever form arrived and never stringify an object by accident.
 */
const readPart = (...candidates) => {
  for (const candidate of candidates) {
    if (candidate === null || candidate === undefined) continue;

    if (typeof candidate === "object") {
      const nested = readPart(
        candidate.name,
        candidate.class_name,
        candidate.className,
        candidate.section_name,
        candidate.sectionName,
        candidate.title,
        candidate.label,
        candidate.value,
        candidate.code,
        candidate.id,
        candidate.class_id,
        candidate.section_id,
      );

      if (nested) return nested;
      continue;
    }

    const text = String(candidate).trim();

    if (text && text !== "[object Object]") return text;
  }

  return "";
};

/**
 * Human-readable labels for ONE account's class/section privileges.
 * `previleges` may arrive as:
 *   • an array of objects:      [{ class: "3", section: "A" }, …]
 *   • a JSON string of that:    '[{"class":"3","section":"A"}]'
 *   • a class → sections map:   { "3": ["A", "B"] }
 *   • legacy strings:           "3-A" / "3" / comma lists
 */
function getPrivilegeLabels(account) {
  const raw = account?.previleges;

  if (raw === null || raw === undefined || raw === "") return [];

  const toLabel = (entry) => {
    if (entry && typeof entry === "object") {
      const cls = readPart(
        entry.class,
        entry.Class,
        entry.grade,
        entry.grade_id,
        entry.class_id,
      );
      const sec = readPart(
        entry.section,
        entry.Section,
        entry.section_id,
      );

      if (cls && sec) return `Class ${cls} - Section ${sec}`;
      if (cls) return `Class ${cls}`;
      if (sec) return `Section ${sec}`;
      return "";
    }

    return String(entry).trim();
  };

  // Already an array — objects → "Class X - Section Y", plain strings as-is.
  if (Array.isArray(raw)) {
    return raw.map(toLabel).filter(Boolean);
  }

  if (typeof raw === "object") {
    // Class → sections map: { "3": ["A", "B"], "4": "C" }
    return Object.entries(raw)
      .flatMap(([cls, sections]) => {
        const classLabel = readPart(cls);
        const list = Array.isArray(sections) ? sections : [sections];

        return list
          .map((section) => readPart(section))
          .filter(Boolean)
          .map(
            (section) =>
              classLabel
                ? `Class ${classLabel} - Section ${section}`
                : `Section ${section}`,
          );
      })
      .filter(Boolean);
  }

  // JSON-encoded string — try to parse it back into the array/map form.
  const text = String(raw).trim();

  if (text.startsWith("[") || text.startsWith("{")) {
    try {
      return getPrivilegeLabels({ previleges: JSON.parse(text) });
    } catch {
      // fall through to plain-string handling
    }
  }

  // Plain / comma-separated string ("3-A", "3", "3-A,4-B").
  return text
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      // Never surface a raw stringified object in the UI.
      if (part === "[object Object]") return "";

      const [cls, sec] = part.split("-");

      if (cls && sec) return `Class ${cls.trim()} - Section ${sec.trim()}`;

      return part;
    })
    .filter(Boolean);
}

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
  isLoadingPrivileges = false,
  getSchoolBranch,
  subAccountBranch,
  getBranchDataForSubAccount = [],
}) => {
  const handleSubAccountChange = useCallback(
    (field, value) => {
      setSubAccount((prev) => ({ ...prev, [field]: value }));
    },
    [setSubAccount],
  );
  const handleClassSectionsChange = useCallback(
    (classSections) => handleSubAccountChange("previleges", classSections),
    [handleSubAccountChange],
  );

  /* Live password-match feedback for the confirm field. */
  const passwordConfirmation = subAccount?.password_confirmation ?? "";
  const passwordsMatch =
    passwordConfirmation !== "" &&
    passwordConfirmation === (subAccount?.password ?? "");

  /* The confirm field has its OWN toggle, so revealing it does not also
     reveal the password field. */
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /* Never leave the confirm password revealed when the dialog closes/reopens. */
  React.useEffect(() => {
    if (!isAddOpen) setShowConfirmPassword(false);
  }, [isAddOpen]);
  console.log(getBranchDataForSubAccount, "getBranchDataForSubAccount");
  console.log(subAccount, "eeeeeee");
  const getRole = useAuthRole(authAccName);

  

  const subAccountBranchOptions = useMemo(() => {
    const fromSubAccount = (getBranchDataForSubAccount ?? [])
      .map((option) => ({
        value: String(option?.id ?? option?.value ?? "").trim(),
        label: String(option?.value ?? option?.label ?? "").trim(),
        class: String(option?.class ?? "").trim(),
        section: String(option?.section ?? "").trim(),
      }))
      .filter((option) => option.value && option.label);
    return fromSubAccount.length > 0 ? fromSubAccount : branches;
  }, [getBranchDataForSubAccount, branches]);

  const accountList = Array.isArray(accounts) ? accounts : [];

  // ---- FILTER STATE ----
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [privilegeFilter, setPrivilegeFilter] = useState("all");
  const [userRole, setUserRole] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Options for class/section filters â€” derived from the shared mock data
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
      // Use the human-readable labels ("Class 3 - Section A") derived from the
      // previleges array — String(array) would produce "[object Object]".
      getPrivilegeLabels(account).forEach((label) => privileges.add(label));
    });
    console.log(accountList, "accountList---");

    return [
      { value: "all", label: "All Privileges" },
      ...Array.from(privileges)
        .sort()
        .map((privilege) => ({
          value: privilege,
          label: privilege,
        })),
    ];
  }, [accountList]);

  // Unique user types (user_type_id) present in the accounts list, mapped to
  // their labels from USER_TYPE_OPTIONS — used by the "User Role" filter.
  // (Note: getBranchDataForSubAccount only carries branch id/name, so the
  // user types come from the accounts list itself.)
  const userRoleOptions = React.useMemo(() => {
    const userRoles = new Set();
    accountList.forEach((account) => {
      const value = String(account?.user_type_id ?? "").trim();
      if (value) userRoles.add(value);
    });
    return [
      { value: "all", label: "All Roles" },
      ...Array.from(userRoles)
        .sort((a, b) => Number(a) - Number(b))
        .map((type) => ({
          value: type,
          label:
            USER_TYPE_OPTIONS.find((opt) => opt.value === type)?.label ?? type,
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

  // Display label for ONE account's role: user_type_id → USER_TYPE_OPTIONS.
  // (privilegeOptions above is the filter's ARRAY of options — not a function.)
  const getAccountRoleLabel = (account) => {
    const typeId = String(account?.user_type_id ?? "").trim();
    if (!typeId) return "";
    return (
      USER_TYPE_OPTIONS.find((opt) => String(opt.value) === typeId)?.label ??
      typeId
    );
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

      // Class filter â€” accounts may hold a single value or a comma list.
      if (classFilter !== "all") {
        const tokens = toFilterTokens(account?.class);
        if (!tokens.includes(String(classFilter).toLowerCase())) return false;
      }

      // Section filter.
      if (sectionFilter !== "all") {
        const tokens = toFilterTokens(account?.section);
        if (!tokens.includes(String(sectionFilter).toLowerCase())) return false;
      }

      // Privilege filter — compare against the same labels shown as chips
      // ("Class 3 - Section A"), case-insensitive.
      if (privilegeFilter !== "all") {
        const tokens = getPrivilegeLabels(account).map((label) =>
          label.toLowerCase(),
        );
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

  console.log(accountList,"filteredAccounts");
  

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

  // Page numbers to render as clickable buttons (same set the pager steps
  // through — purely presentational, driven by totalPages/currentPage).
  const pageNumbers = React.useMemo(() => {
    const pages = [];
    for (let page = 1; page <= totalPages; page += 1) {
      pages.push(page);
    }
    return pages;
  }, [totalPages]);

  const clearFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setClassFilter("all");
    setSectionFilter("all");
    setPrivilegeFilter("all");
    setUserRole("all");
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

  const activeCount = accountList.filter(
    (account) => account?.status === "active",
  ).length;
  const inactiveCount = accountList.length - activeCount;

  return (
    <>
      {/* ================================
          ACCOUNTS
      ================================= */}

      <article className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {/* Accent rail */}
        <div className="h-1 w-full bg-gradient-to-r from-primary via-primary/50 to-transparent" />

        <div className="p-4 sm:p-6">
          {/* HEADER */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Users className="size-5" />
              </span>

              <div>
                <div className="flex items-center gap-2">
                  <span className="profile-settings-eyebrow__dot" />
                  <p className="profile-settings-eyebrow">Team workspace</p>
                </div>
                <h3 className="text-2xl font-semibold tracking-tight text-foreground">
                  Team Accounts
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Manage team members, their designations, and access status.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {/* STAT PILLS */}
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground">
                  {accountList.length}{" "}
                  <span className="text-muted-foreground">Total</span>
                </span>
                <span className="rounded-full border border-success/25 bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
                  {activeCount}{" "}
                  <span className="opacity-75">Active</span>
                </span>
                <span className="rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                  {inactiveCount} Inactive
                </span>
              </div>

              {selectedIds.length > 0 ? (
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
              ) : (
                getRole !== "teacher" && (
                  <Button type="button" onClick={onAdd} className="gap-1.5">
                    <UserRoundPlus size={14} />
                    Add New Account
                  </Button>
                )
              )}
            </div>
          </div>

        {/* FILTER BAR */}
        {getRole !== "teacher" && (
          <>
            <div className="mt-5 space-y-3 rounded-xl border border-border bg-muted/25 p-3 sm:p-4">
              {/* SEARCH + STATUS */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="min-w-0 sm:col-span-2 lg:col-span-2">
                  <TextField
                    label="Search"
                    labelClassName="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                    id="team-search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by name or username..."
                    autoComplete="off"
                  />
                </div>

                <div className="space-y-1.5">
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

                <div className="space-y-1.5">
                  <ReusableSelect
                    label="User Role"
                    value={userRole}
                    onChange={setUserRole}
                    options={userRoleOptions}
                    placeholder="Select Role"
                  />
                </div>
              </div>

              {/* CLASS / SECTION / PRIVILEGES */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-1.5">
                  <ReusableSelect
                    label="Class"
                    value={classFilter}
                    onChange={setClassFilter}
                    options={classOptions}
                    placeholder="Class"
                  />
                </div>

                <div className="space-y-1.5">
                  <ReusableSelect
                    label="Section"
                    value={sectionFilter}
                    onChange={setSectionFilter}
                    options={sectionOptions}
                    placeholder="Section"
                  />
                </div>

                <div className="space-y-1.5">
                  <ReusableSelect
                    label="Privileges"
                    value={privilegeFilter}
                    onChange={setPrivilegeFilter}
                    options={privilegeOptions}
                    placeholder="Privileges"
                  />
                </div>

                {/* CLEAR */}
                <div className="flex items-end">
                  <Button
                    type="button"
                    variant={hasActiveFilters ? "default" : "outline"}
                    onClick={clearFilters}
                    disabled={!hasActiveFilters}
                    className="w-full gap-1.5"
                  >
                    <X className="size-4" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </div>
            {/* SELECT-ALL STRIP + RESULT COUNT */}
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-muted/25 px-3 py-2.5 sm:px-4">
              <label className="flex cursor-pointer select-none items-center gap-2.5 text-xs font-medium text-muted-foreground">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onCheckedChange={onToggleAll}
                  aria-label="Select all accounts"
                />
                Select all
              </label>

              <p className="text-xs text-muted-foreground">
                {hasActiveFilters ? (
                  <>
                    Showing{" "}
                    <span className="font-semibold text-foreground">
                      {filteredAccounts.length}
                    </span>{" "}
                    of {accountList.length} accounts
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-foreground">
                      {accountList.length}
                    </span>{" "}
                    team members
                  </>
                )}
              </p>
            </div>

            {/* MEMBER CARDS */}
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {paginatedAccounts.map((account) => {
                const isSelected = selectedIds.includes(account.id);
                console.log(account, "account333333333");

                const isActive = account.status === "active";
                const roleLabel = getAccountRoleLabel(account);
                const privilegeLabels = getPrivilegeLabels(account);

                return (
                  <div
                    key={account.id}
                    onClick={() => onEdit(account)}
                    className={`group relative flex cursor-pointer flex-col gap-3 rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                      isSelected
                        ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    {/* TOP ROW */}
                    <div className="flex items-start gap-3">
                      <div
                        onClick={(event) => event.stopPropagation()}
                        className="pt-0.5"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => onToggleRow(account.id)}
                          aria-label={`Select ${account.name}`}
                        />
                      </div>

                      <span
                        aria-hidden="true"
                        className={`relative flex size-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                          AVATAR_STYLES[account.id % AVATAR_STYLES.length]
                        }`}
                      >
                        {getInitials(account.name)}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-card ${
                            isActive ? "bg-success" : "bg-muted-foreground"
                          }`}
                        />
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-foreground">
                          {account.name}
                        </p>
                        {roleLabel ? (
                          <span className="mt-1 inline-flex items-center gap-1 rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">
                            <ShieldCheck className="size-3" />
                            {roleLabel}
                          </span>
                        ) : null}
                        {account.designation ? (
                          <p className="mt-1 truncate text-xs text-muted-foreground">
                            {account.designation}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* CLASS & SECTION PRIVILEGES */}
                    {privilegeLabels.length > 0 ? (
                      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-2.5">
                        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          Class &amp; Section Access
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {privilegeLabels.map((label) => (
                            <span
                              key={label}
                              className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {/* FOOTER */}
                    <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
                      <div
                        onClick={(event) => event.stopPropagation()}
                        className="flex items-center gap-2"
                      >
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

                      <div
                        onClick={(event) => event.stopPropagation()}
                        className="flex items-center gap-1"
                      >
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            aria-label={`Actions for ${account.name}`}
                            className="inline-flex size-8 items-center justify-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground"
                          >
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end" className="w-40">
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

                        <ChevronRight className="size-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* EMPTY STATE */}
            {filteredAccounts.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed border-border bg-muted/20">
                <EmptyState
                  title="No Team Members Found"
                  description={
                    hasActiveFilters
                      ? "No accounts match the filters you have applied. Try adjusting or clearing the filters to see more results."
                      : "No accounts yet. Click “Add New Account” to create your first team member."
                  }
                  action={
                    hasActiveFilters ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={clearFilters}
                        className="gap-1.5"
                      >
                        <SlidersHorizontal className="size-4" />
                        Clear Filters
                      </Button>
                    ) : getRole !== "teacher" ? (
                      <Button
                        type="button"
                        onClick={onAdd}
                        className="gap-1.5"
                      >
                        <UserRoundPlus className="size-4" />
                        Add New Account
                      </Button>
                    ) : null
                  }
                />
              </div>
            ) : null}

            {/* PAGINATION FOOTER */}

            {filteredAccounts.length > 0 ? (
              <div className="mt-5 flex flex-col gap-3 rounded-xl border border-border bg-muted/25 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                {/* PAGE SIZE */}
                <div className="flex flex-wrap items-center gap-2">
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
                    <span className="font-medium text-foreground">
                      {Math.min(
                        (currentPage - 1) * pageSize + 1,
                        filteredAccounts.length,
                      )}
                    </span>
                    {" – "}
                    <span className="font-medium text-foreground">
                      {Math.min(
                        currentPage * pageSize,
                        filteredAccounts.length,
                      )}
                    </span>{" "}
                    of {filteredAccounts.length}
                  </span>
                </div>

                {/* PAGE NAVIGATION */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                  >
                    Previous
                  </Button>

                  <div className="flex items-center gap-1">
                    {pageNumbers.map((page) => (
                      <Button
                        key={page}
                        type="button"
                        size="sm"
                        variant={page === currentPage ? "default" : "outline"}
                        aria-label={`Go to page ${page}`}
                        aria-current={page === currentPage ? "page" : undefined}
                        onClick={() => setCurrentPage(page)}
                        className="h-8 min-w-8 px-2"
                      >
                        {page}
                      </Button>
                    ))}
                  </div>

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
          </>
        )}
        </div>
      </article>

      {/* ================================
          ADD / EDIT ACCOUNT DIALOG
      ================================= */}

      <Dialog open={isAddOpen} onOpenChange={onAddOpenChange}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden p-0">
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
                      required
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
                      required
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
                  {!editingAccount && (
                    <div className="space-y-1.5">
                      <div className="relative">
                        <TextField
                          label="Password"
                          labelClassName="text-sm font-medium text-foreground"
                          id="account-password"
                          name="password"
                          required
                          type={showPassword ? "text" : "password"}
                          value={subAccount?.password ?? ""}
                          onChange={(event) =>
                            handleSubAccountChange(
                              "password",
                              event.target.value,
                            )
                          }
                          placeholder="Minimum 8 characters"
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
                  )}
                  {!editingAccount && (
                    <div className="space-y-1.5">
                      <div className="relative">
                        <TextField
                          label="Confirm Password"
                          labelClassName="text-sm font-medium text-foreground"
                          id="account-confirm-password"
                          name="password_confirmation"
                          required
                          type={showConfirmPassword ? "text" : "password"}
                          value={subAccount?.password_confirmation ?? ""}
                          onChange={(event) =>
                            handleSubAccountChange(
                              "password_confirmation",
                              event.target.value,
                            )
                          }
                          placeholder="Re-enter password"
                          autoComplete="new-password"
                          className="pr-10"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((value) => !value)
                          }
                          className="absolute right-2 top-8 inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="size-4" />
                          ) : (
                            <Eye className="size-4" />
                          )}
                        </button>
                      </div>

                      {/* Live match feedback — only once the user has typed
                          something, so it never nags on an empty field. */}
                      {passwordConfirmation ? (
                        passwordsMatch ? (
                          <p className="flex items-center gap-1 text-xs text-success">
                            <CircleCheck className="size-3.5" aria-hidden="true" />
                            Passwords match
                          </p>
                        ) : (
                          <p className="text-xs text-destructive">
                            Passwords do not match
                          </p>
                        )
                      ) : formErrors?.password_confirmation ? (
                        <p className="text-xs text-destructive">
                          {formErrors.password_confirmation}
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
              </section>

              {/* ACCESS DETAILS */}
              <section className="mt-7 space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Access & Assignment
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Select the user&rsquo;s role and assign them to a branch.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
                  {/* USER TYPE */}
                  <div className="space-y-1.5">
                    <div>
                      <ReusableSelect
                        required
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
                      required
                      withPortal
                      value={subAccount?.branchId ?? ""}
                      onChange={(value) =>
                        handleSubAccountChange("branchId", value)
                      }
                      options={subAccountBranchOptions}
                      placeholder="Select branch"
                    />

                    {formErrors?.branchId && (
                      <p className="text-xs text-destructive">
                        {formErrors.branchId}
                      </p>
                    )}
                  </div>

                  {/* PRIVILEGES â€” required for all user types except type 1 */}
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
                      Assign the team member to the required classes and
                      sections.
                    </p>
                  </div>

                  {isLoadingPrivileges ? (
                    <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
                      <Loader2 className="size-3.5 animate-spin" />
                      Loading saved classes and sections…
                    </div>
                  ) : null}

                  <div className={isLoadingPrivileges ? "pointer-events-none opacity-60" : undefined}>
                    <ClassSectionManager
                      getSchoolBranch={getSchoolBranch}
                      subAccountBranch={subAccountBranch}
                      classSections={subAccount?.previleges ?? []}
                      onClassSectionsChange={handleClassSectionsChange}
                    />
                  </div>
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
