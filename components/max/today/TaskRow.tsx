"use client";

import type { PlannerTask } from "@/lib/max/api";
import { displayTitle, fmtTime, isDone, isSkipped } from "@/lib/max/format";
import { Icon } from "@/components/max/icons";

export default function TaskRow({
  task,
  onToggle,
  onSkip,
  onOpen,
}: {
  task: PlannerTask;
  onToggle: (t: PlannerTask) => void;
  onSkip: (t: PlannerTask) => void;
  onOpen: (t: PlannerTask) => void;
}) {
  const done = isDone(task.status);
  const skipped = isSkipped(task.status);
  const muted = done || skipped;

  return (
    <div className="relative flex items-start gap-3">
      {/* Rail node / checkbox */}
      <button
        onClick={() => onToggle(task)}
        aria-label={done ? "Mark not done" : "Mark done"}
        className={`relative z-10 mt-1 flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
          done
            ? "border-mx-accent bg-mx-accent text-white"
            : "border-mx-border bg-mx-card hover:border-mx-accent"
        }`}
      >
        {done ? <Icon name="check" className="size-3.5" /> : null}
      </button>

      {/* Card */}
      <div
        className={`bg-mx-card rounded-mx-md border border-mx-border shadow-mx-sm mb-3 flex-1 px-4 py-3 ${
          muted ? "opacity-60" : ""
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <button
            onClick={() => onOpen(task)}
            className="min-w-0 flex-1 text-left"
          >
            <div
              className={`text-mx-ink text-[15px] font-medium ${
                muted ? "line-through" : ""
              }`}
            >
              {displayTitle(task.title) || "Task"}
            </div>
            {task.description ? (
              <div className="text-mx-muted mt-0.5 line-clamp-1 text-[13px]">
                {task.description}
              </div>
            ) : null}
          </button>

          <div className="flex shrink-0 flex-col items-end gap-1">
            {task.time ? (
              <span className="text-mx-ink-2 text-[13px] font-medium tabular-nums">
                {fmtTime(task.time)}
              </span>
            ) : null}
            {task.duration_minutes ? (
              <span className="text-mx-muted text-[11px]">
                {task.duration_minutes}m
              </span>
            ) : null}
          </div>
        </div>

        {!muted ? (
          <div className="mt-2 flex gap-4">
            <button
              onClick={() => onSkip(task)}
              className="text-mx-muted hover:text-mx-ink text-[12px]"
            >
              Skip
            </button>
            <button
              onClick={() => onOpen(task)}
              className="text-mx-accent text-[12px]"
            >
              Details
            </button>
          </div>
        ) : (
          <div className="text-mx-muted mt-1 text-[12px]">
            {done ? "Done" : "Skipped"}
          </div>
        )}
      </div>
    </div>
  );
}
