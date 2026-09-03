import { FramerCard } from "@/util/FramerCard";
import React from "react";

const Notes = ({notes, formErrors, handleNotesChange}) => {
  return (
    <FramerCard>
      <article className="rounded-xl border border-border bg-card p-4">
        <h3 className="text-sm font-semibold text-foreground">Add Notes and Referral</h3>
        <textarea
          value={notes}
          onChange={(e) => handleNotesChange(e.target.value)}
          rows={4}
          className={`mt-3 w-full resize-none rounded-md border border-input bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-ring/30 ${formErrors?.notes ? "border-destructive focus:ring-destructive/30" : ""}`}
        />
        {formErrors?.notes && (
          <p className="mt-1.5 text-xs text-destructive">{formErrors.notes}</p>
        )}
      </article>

      
    </FramerCard>
  );
};

export default Notes;
