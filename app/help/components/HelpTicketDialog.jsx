"use client";

import { useState } from "react";
import { LifeBuoy, Send } from "lucide-react";

import { AnimatedModal } from "@/components/ui/AnimatedModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HELP_PRIORITY, HELP_TOPICS } from "../datas/help-data";

/* ==========================================================================
   NEW TICKET
   ==========================================================================
   A form that behaves like the real one without needing a backend: it
   validates, shows a busy state, hands the draft to the page (which owns the
   list) and then closes itself.

   Props
     open / onClose     the dialog pair, owned by the page
     onCreate           (draft) => void — the page appends the ticket
     defaultTopicId     preselects a topic when the user came from one
   ========================================================================== */

/* Native select, not the app's Select: this list is a fixed, ten-item set, and
   a native control gives correct keyboard and mobile behaviour for free. */
const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function HelpTicketDialog({ open, onClose, onCreate, defaultTopicId = null }) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [topicId, setTopicId] = useState(
    defaultTopicId ?? HELP_TOPICS[0]?.id ?? "getting-started",
  );
  const [priority, setPriority] = useState("normal");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  /* Closing resets the draft, so a cancelled ticket never leaks into the next
     one — and doing it here (rather than in an effect on `open`) keeps the
     state updates out of the render path. */
  function handleClose() {
    setSubject("");
    setDescription("");
    setPriority("normal");
    setError("");
    setSending(false);
    onClose();
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (subject.trim().length < 6) {
      setError("Give the ticket a subject of at least 6 characters.");
      return;
    }

    if (description.trim().length < 20) {
      setError(
        "Add a little more detail — 20 characters or more — so the desk can answer in one go.",
      );
      return;
    }

    setError("");
    setSending(true);

    /* Demo latency, so the busy state is actually visible. A real submit would
       await the API here and surface its error the same way. */
    await new Promise((resolve) => setTimeout(resolve, 600));

    onCreate({
      subject: subject.trim(),
      description: description.trim(),
      topicId,
      priority,
    });

    handleClose();
  }

  return (
    <AnimatedModal
      open={open}
      onClose={handleClose}
      maxWidth="max-w-2/3"
      ariaLabel="Raise a support ticket"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5 sm:p-6">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold text-foreground">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <LifeBuoy className="size-4" />
            </span>
            Raise a ticket
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Tell us what you were doing and what you expected instead. You get a
            reference number and a named engineer, usually within 12 minutes
            during school hours.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground">Topic</span>
            <select
              value={topicId}
              onChange={(event) => setTopicId(event.target.value)}
              className={SELECT_CLASS}
            >
              {HELP_TOPICS.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground">
              Priority
            </span>
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value)}
              className={SELECT_CLASS}
            >
              {Object.entries(HELP_PRIORITY).map(([id, meta]) => (
                <option key={id} value={id}>
                  {meta.label} · {meta.slaHours} h response
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-foreground">Subject</span>
          <Input
            value={subject}
            maxLength={120}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="e.g. Health card PDF is blank for class 8"
          />
          <span className="text-[11px] text-muted-foreground">
            {subject.length}/120
          </span>
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-semibold text-foreground">
            What happened?
          </span>
          <Textarea
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Steps you took, the class or camp, and what you see instead…"
          />
        </label>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-medium text-destructive"
          >
            {error}
          </p>
        ) : null}

        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={sending}>
            <Send className="size-4" />
            {sending ? "Creating…" : "Create ticket"}
          </Button>
        </div>
      </form>
    </AnimatedModal>
  );
}
