"use client";

import React from "react";

const AppearancePage = ({
  theme,
  onThemeChange,
  transparentSidebar,
  onTransparentSidebarChange,
  sidebarFeature,
  onSidebarFeatureChange,
  tableView,
  onTableViewChange,
  onCancel,
  onSave,
}) => {
  return (
    <div className="space-y-6">
      {/* Put your existing Appearance UI here */}

      <div>
        <h2 className="text-lg font-semibold">
          Appearance
        </h2>

        <p className="text-sm text-muted-foreground">
          Customize your application appearance.
        </p>
      </div>

      {/* Your existing controls */}

      <button onClick={onCancel}>
        Cancel
      </button>

      <button onClick={onSave}>
        Save Changes
      </button>
    </div>
  );
};

export default AppearancePage;