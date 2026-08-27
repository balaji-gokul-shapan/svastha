"use client";

import React from "react";

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

  newName,
  setNewName,

  newUsername,
  setNewUsername,

  newPassword,
  setNewPassword,

  showPassword,
  setShowPassword,

  formErrors,

  onSubmit,

  editingAccount,

  deleteTarget,
  setDeleteTarget,

  onConfirmDelete,
}) => {
  const isAllSelected =
    accounts.length > 0 &&
    selectedIds.length === accounts.length;

  const isIndeterminate =
    selectedIds.length > 0 &&
    selectedIds.length < accounts.length;

  return (
    <>
      {/* ================================
          ACCOUNTS
      ================================= */}

      <article className="rounded-lg border border-border bg-card p-4 sm:p-5">

        <div className="flex flex-row items-center justify-between gap-2">

          <div className="flex flex-col items-start">

            <h3 className="text-lg font-semibold text-foreground">
              Accounts
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage team members, their designations,
              and access status.
            </p>

          </div>

          {selectedIds.length > 0 ? (
            <div className="ml-auto flex shrink-0 items-center gap-3">

              <span className="text-xs font-medium text-muted-foreground">
                {selectedIds.length} of{" "}
                {accounts.length} selected
              </span>

              <Button
                type="button"
                variant="outline"
                onClick={onBulkDelete}
                className="gap-1.5 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" />

                Delete

                {selectedIds.length > 1
                  ? ` (${selectedIds.length})`
                  : ""}
              </Button>

            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="ml-auto shrink-0"
              onClick={onAdd}
            >
              Add New Account
            </Button>
          )}

        </div>

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

                <th className="px-4 py-3 font-medium">
                  Name
                </th>

                <th className="px-4 py-3 font-medium">
                  Status
                </th>

                <th className="w-20 px-4 py-3 text-right font-medium">
                  Actions
                </th>

              </tr>

            </thead>

            <tbody className="divide-y divide-border bg-card">

              {accounts.map((account) => {

                const isSelected =
                  selectedIds.includes(account.id);

                const isActive =
                  account.status === "active";

                return (
                  <tr
                    key={account.id}
                    className={
                      isSelected
                        ? "bg-muted/40"
                        : undefined
                    }
                  >

                    {/* CHECKBOX */}

                    <td className="px-4 py-3">

                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() =>
                          onToggleRow(account.id)
                        }
                        aria-label={`Select ${account.name}`}
                      />

                    </td>

                    {/* NAME */}

                    <td className="px-4 py-3">

                      <div className="flex items-center gap-3">

                        <span
                          aria-hidden="true"
                          className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                            AVATAR_STYLES[
                              account.id %
                                AVATAR_STYLES.length
                            ]
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
                          onCheckedChange={() =>
                            onToggleStatus(
                              account.id
                            )
                          }
                          aria-label={`Toggle status for ${account.name}`}
                        />

                        <span
                          className={`text-xs font-medium ${
                            isActive
                              ? "text-success"
                              : "text-muted-foreground"
                          }`}
                        >
                          {isActive
                            ? "Active"
                            : "Inactive"}
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

                        <DropdownMenuContent
                          align="end"
                          className="w-36"
                        >

                          <DropdownMenuItem
                            onClick={() =>
                              onEdit(account)
                            }
                          >
                            <Pencil />
                            Edit
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            onClick={() =>
                              onDuplicate(
                                account.id
                              )
                            }
                          >
                            <Copy />
                            Copy
                          </DropdownMenuItem>

                          <DropdownMenuSeparator />

                          <DropdownMenuItem
                            onClick={() =>
                              setDeleteTarget(
                                account
                              )
                            }
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
                    No accounts yet. Click
                    {" "}
                    “Add New Account”
                    {" "}
                    to create one.
                  </td>

                </tr>
              ) : null}

            </tbody>

          </table>

        </div>

      </article>

      {/* ================================
          ADD / EDIT ACCOUNT DIALOG
      ================================= */}

      <Dialog
        open={isAddOpen}
        onOpenChange={onAddOpenChange}
      >

        <DialogContent className="shadow-2xs sm:max-w-max md:max-w-1/2 lg:max-w-1/4">

          <DialogHeader>

            <DialogTitle>
              {editingAccount
                ? "Edit Account"
                : "Create Account"}
            </DialogTitle>

            <DialogDescription>
              {editingAccount
                ? "Update this team member's account details"
                : "Add a team member and set their sign-in credentials."}
            </DialogDescription>

          </DialogHeader>

          <form
            onSubmit={onSubmit}
            noValidate
            className="mt-4 space-y-4"
          >

            {/* NAME */}

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
                onChange={(event) =>
                  setNewName(event.target.value)
                }
                placeholder="e.g. Priya Sharma"
                autoComplete="off"
              />

              {formErrors.name ? (
                <p className="text-xs text-destructive">
                  {formErrors.name}
                </p>
              ) : null}

            </div>

            {/* USERNAME */}

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
                onChange={(event) =>
                  setNewUsername(
                    event.target.value
                  )
                }
                placeholder="e.g. priya.sharma"
                autoComplete="off"
              />

              {formErrors.username ? (
                <p className="text-xs text-destructive">
                  {formErrors.username}
                </p>
              ) : null}

            </div>

            {/* PASSWORD */}

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
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(event) =>
                    setNewPassword(
                      event.target.value
                    )
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
                  onClick={() =>
                    setShowPassword(
                      (value) => !value
                    )
                  }
                  className="absolute right-2 top-1/2 inline-flex size-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
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

            {/* FOOTER */}

            <DialogFooter>

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  onAddOpenChange(false)
                }
              >
                Cancel
              </Button>

              <Button type="submit">
                {editingAccount
                  ? "Save Changes"
                  : "Create"}
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
              {deleteTarget === "bulk"
                ? "s"
                : ""}
              ?
            </AlertDialogTitle>

            <AlertDialogDescription>
              {deleteTarget === "bulk"
                ? "This will permanently delete the selected accounts. This action cannot be undone."
                : `This will permanently delete "${deleteTarget?.name}". This action cannot be undone.`}
            </AlertDialogDescription>

          </AlertDialogHeader>

          <AlertDialogFooter>

            <AlertDialogCancel>
              No, keep it
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={onConfirmDelete}
            >
              Yes, Delete
            </AlertDialogAction>

          </AlertDialogFooter>

        </AlertDialogContent>

      </AlertDialog>
    </>
  );
};

export default TeamPage;