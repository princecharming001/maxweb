"use client";

import { useQuery } from "@tanstack/react-query";
import api, { type PlannerTask } from "@/lib/max/api";
import { displayTitle, fmtTime } from "@/lib/max/format";
import { Icon } from "@/components/max/icons";
import { Spinner } from "@/components/max/ui";

export default function TaskSheet({
  task,
  onClose,
}: {
  task: PlannerTask;
  onClose: () => void;
}) {
  const canGuide = !!(task.schedule_id && task.task_id);
  const guideQ = useQuery({
    queryKey: ["taskGuide", task.schedule_id, task.task_id],
    queryFn: () => api.getTaskGuide(task.schedule_id!, task.task_id!),
    enabled: canGuide,
    retry: false,
  });
  const guide = guideQ.data;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
      onClick={onClose}
    >
      <div
        className="bg-mx-card rounded-t-mx-2xl sm:rounded-mx-2xl max-h-[85vh] w-full max-w-[560px] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-mx-border sticky top-0 flex items-center justify-between border-b bg-mx-card/95 px-5 py-4 backdrop-blur">
          <div className="min-w-0">
            <div className="text-mx-ink truncate text-[17px] font-semibold">
              {displayTitle(task.title) || "Task"}
            </div>
            {task.time ? (
              <div className="text-mx-muted text-[13px]">
                {fmtTime(task.time)}
                {task.duration_minutes ? ` · ${task.duration_minutes} min` : ""}
              </div>
            ) : null}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-mx-muted hover:text-mx-ink"
          >
            <Icon name="close" className="size-5" />
          </button>
        </div>

        <div className="px-5 py-5">
          {task.description ? (
            <p className="text-mx-ink-2 text-[14px] leading-relaxed">
              {task.description}
            </p>
          ) : null}

          {guideQ.isLoading ? (
            <div className="flex justify-center py-8">
              <Spinner />
            </div>
          ) : null}

          {guide ? (
            <div className="mt-4 space-y-5">
              {guide.overview ? (
                <p className="text-mx-ink-2 text-[14px] leading-relaxed">
                  {guide.overview}
                </p>
              ) : null}

              {guide.steps?.length ? (
                <div>
                  <div className="mx-label mb-3">How to</div>
                  <ol className="space-y-4">
                    {guide.steps.map((s) => (
                      <li key={s.n} className="flex gap-3">
                        <span className="bg-mx-accent-muted text-mx-accent flex size-6 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold">
                          {s.n}
                        </span>
                        <div>
                          <div className="text-mx-ink text-[14px] font-medium">
                            {s.title}
                          </div>
                          <div className="text-mx-ink-2 mt-0.5 text-[13px] leading-relaxed">
                            {s.body}
                          </div>
                          {s.tip ? (
                            <div className="text-mx-muted mt-1 text-[12px] italic">
                              {s.tip}
                            </div>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}

              {guide.why_it_matters ? (
                <div className="bg-mx-surface-light rounded-mx-md p-4">
                  <div className="mx-label mb-1.5">Why it matters</div>
                  <p className="text-mx-ink-2 text-[13px] leading-relaxed">
                    {guide.why_it_matters}
                  </p>
                </div>
              ) : null}
            </div>
          ) : !guideQ.isLoading && !task.description ? (
            <p className="text-mx-muted text-[14px]">
              No extra details for this one — just get it done.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
