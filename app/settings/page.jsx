import React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function FormField({
  id,
  label,
  placeholder,
  type = "text",
  defaultValue = "",
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <Input
        id={id}
        name={id}
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </div>
  );
}

const Settings = () => {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">
          Settings
        </h2>
        <p className="text-sm text-muted-foreground">
          Manage application settings, user preferences, and system
          configuration.
        </p>
      </div>

      <article className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <h3 className="text-lg font-semibold text-foreground">Profile</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Update your personal details and contact information.
        </p>

        <form className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField id="name" label="Name" placeholder="Enter your name" />
          <FormField
            id="username"
            label="Username"
            placeholder="Enter your username"
          />
          <FormField
            id="password"
            label="Password"
            placeholder="Enter your password"
            type="password"
          />
        </form>
      </article>

      <article className="rounded-lg border border-border bg-card p-4 sm:p-5">
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col items-start">
            <h3 className="text-lg font-semibold text-foreground">Account</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your account settings and security preferences.
            </p>
          </div>
          <Button type="button" variant="outline" className="ml-auto">
            Add New Account
          </Button>
        </div>

        <form className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField id="name" label="Name" placeholder="Enter your name" />
          <FormField
            id="username"
            label="Username"
            placeholder="Enter your username"
          />
          <FormField
            id="password"
            label="Password"
            placeholder="Enter your password"
            type="password"
          />
        </form>
      </article>

      <div className="sm:col-span-2 lg:col-span-3 flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline">
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </section>
  );
};

export default Settings;
