"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api, { type PlannerTask, type PlannerToday } from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import { fmtTime, isDone, isSkipped, toMin } from "@/lib/max/format";
import { Button, Card, LinkButton, Spinner } from "@/components/max/ui";
import { Icon } from "@/components/max/icons";
import Toast, { type ToastState } from "@/components/max/Toast";
import TaskRow from "@/components/max/today/TaskRow";
import TaskSheet from "@/components/max/today/TaskSheet";

export default function TodayPage() {
  const qc = useQueryClient();
  const qk = queryKeys.plannerToday();
  const [toast, setToast] = useState<ToastState | null>(null);
  const [openTask, setOpenTask] = useState<PlannerTask | null>(null);

  const todayQ = useQuery({
    queryKey: qk,
    queryFn: () => api.getPlannerToday(),
  });
  const streakQ = useQuery({
    queryKey: queryKeys.schedulesActiveFull,
    queryFn: () => api.getActiveSchedulesFull(),
    staleTime: 60_000,
  });

  const data = todayQ.data;

  // Optimistic helper — the mobile snapshotAndPatch pattern.
  async function snapshotAndPatch(patch: (old: PlannerToday) => PlannerToday) {
    await qc.cancelQueries({ queryKey: qk });
    const prev = qc.getQueryData<PlannerToday>(qk);
    qc.setQueryData<PlannerToday>(qk, (old) => (old ? patch(old) : old));
    return { prev };
  }
  function patchStatus(taskId: string | undefined, status: string) {
    return (old: PlannerToday): PlannerToday => ({
      ...old,
      tasks: old.tasks.map((t) =>
        t.task_id === taskId ? { ...t, status } : t,
      ),
    });
  }

  const doneMut = useMutation({
    mutationFn: (t: PlannerTask) =>
      api.completeScheduleTask(t.schedule_id!, t.task_id!),
    onMutate: (t) => snapshotAndPatch(patchStatus(t.task_id, "completed")),
    onError: (_e, _t, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk, ctx.prev);
      setToast({ message: "Couldn't save. Try again." });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk });
      qc.invalidateQueries({ queryKey: queryKeys.schedulesActiveFull });
    },
  });

  const undoMut = useMutation({
    mutationFn: (t: PlannerTask) =>
      api.uncompleteScheduleTask(t.schedule_id!, t.task_id!),
    onMutate: (t) => snapshotAndPatch(patchStatus(t.task_id, "pending")),
    onError: (_e, _t, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk, ctx.prev);
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: qk });
      qc.invalidateQueries({ queryKey: queryKeys.schedulesActiveFull });
    },
  });

  const skipMut = useMutation({
    mutationFn: (t: PlannerTask) =>
      api.skipPlannerTask(t.schedule_id!, t.task_id!),
    onMutate: (t) => snapshotAndPatch(patchStatus(t.task_id, "skipped")),
    onError: (_e, _t, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk }),
  });

  const lockInMut = useMutation({
    mutationFn: () => api.plannerLockIn(),
    onMutate: () =>
      snapshotAndPatch((old) => ({ ...old, locked_in: true })),
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk }),
  });

  function toggle(t: PlannerTask) {
    if (isDone(t.status)) {
      undoMut.mutate(t);
    } else {
      doneMut.mutate(t);
      setToast({
        message: "Nice — marked done.",
        actionLabel: "Undo",
        onAction: () => undoMut.mutate(t),
      });
    }
  }
  function skip(t: PlannerTask) {
    skipMut.mutate(t);
    setToast({
      message: "Skipped for today.",
      actionLabel: "Undo",
      onAction: () => undoMut.mutate(t),
    });
  }

  const streak =
    streakQ.data?.schedule_streak?.current ??
    data?.tasks?.length ??
    0;
  const gam = streakQ.data?.gamification;

  const sortedTasks = useMemo(
    () =>
      [...(data?.tasks ?? [])].sort((a, b) => toMin(a.time) - toMin(b.time)),
    [data?.tasks],
  );
  const doneCount = sortedTasks.filter((t) => isDone(t.status)).length;
  const totalActionable = sortedTasks.filter((t) => !isSkipped(t.status)).length;

  const todayDate = data?.date
    ? new Date(data.date + "T00:00:00").toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      })
    : "";

  if (todayQ.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (todayQ.isError) {
    return (
      <EmptyState
        title="Couldn't load your day"
        body="We hit a snag reaching the server. Try again in a moment."
        action={
          <Button onClick={() => todayQ.refetch()}>Retry</Button>
        }
      />
    );
  }

  const hasPlan = sortedTasks.length > 0;

  return (
    <div>
      {/* ── Single phone-width column ───────────────────────────────── */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <div className="mx-label">{todayDate}</div>
            <h1 className="font-mx-serif text-mx-ink mt-1 text-[34px] leading-none">
              Today
            </h1>
          </div>
          {/* Streak ring, top-right like iOS */}
          <div className="flex flex-col items-center">
            <div className="relative flex size-12 items-center justify-center">
              <svg viewBox="0 0 48 48" className="absolute inset-0 -rotate-90">
                <circle cx="24" cy="24" r="21" fill="none" stroke="var(--color-mx-surface)" strokeWidth="4" />
                <circle
                  cx="24" cy="24" r="21" fill="none"
                  stroke="var(--color-mx-accent)" strokeWidth="4" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 21}
                  strokeDashoffset={2 * Math.PI * 21 * (1 - Math.min(streak, 30) / 30)}
                />
              </svg>
              <span className="text-mx-ink text-[15px] font-semibold tabular-nums">{streak}</span>
            </div>
            <span className="text-mx-muted mt-1 text-[10px]">day streak</span>
          </div>
        </div>

        {data?.today_read ? (
          <div className="mt-3 flex items-center gap-2">
            <span
              className="inline-block size-2.5 rounded-full"
              style={{ background: data.today_read.color }}
            />
            <p className="text-mx-ink-2 text-[14px]">{data.today_read.line}</p>
          </div>
        ) : null}

        {/* progress + lock-in */}
        {hasPlan ? (
          <div className="mt-5 flex items-center gap-4">
            <div className="bg-mx-surface h-1.5 flex-1 overflow-hidden rounded-full">
              <div
                className="bg-mx-ink h-full rounded-full transition-all"
                style={{
                  width: `${totalActionable ? (doneCount / totalActionable) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-mx-muted text-[13px]">
              {doneCount} of {totalActionable} done
            </span>
          </div>
        ) : null}

        {data && !data.locked_in && hasPlan ? (
          <div className="mt-4">
            <Button
              variant="accent"
              size="sm"
              onClick={() => lockInMut.mutate()}
              disabled={lockInMut.isPending}
            >
              Lock in today
            </Button>
          </div>
        ) : null}

        {/* Timeline */}
        {hasPlan ? (
          <div className="relative mt-7">
            <div className="bg-mx-border absolute bottom-2 left-[11px] top-2 w-px" />
            <div className="space-y-0">
              {sortedTasks.map((t) => (
                <TaskRow
                  key={t.task_id}
                  task={t}
                  onToggle={toggle}
                  onSkip={skip}
                  onOpen={setOpenTask}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            className="mt-8"
            title="No plan yet"
            body="Build your daily plan with the coach, or browse programs to add one."
            action={
              <div className="flex gap-3">
                <LinkButton href="/app/coach" variant="accent">
                  Talk to your coach
                </LinkButton>
                <LinkButton href="/app/explore" variant="ghost">
                  Browse programs
                </LinkButton>
              </div>
            }
          />
        )}

        {/* XP / level progress + insights + held-back, stacked below */}
        {gam ? (
          <Card className="mt-6 p-4">
            <div className="text-mx-muted flex justify-between text-[11px]">
              <span>Level {gam.level ?? 1}</span>
              <span>
                {gam.xp_in_level ?? 0}/{gam.xp_for_next ?? 100} XP
              </span>
            </div>
            <div className="bg-mx-surface mt-1.5 h-1.5 overflow-hidden rounded-full">
              <div
                className="bg-mx-accent h-full rounded-full"
                style={{
                  width: `${
                    gam.xp_for_next
                      ? Math.min(100, ((gam.xp_in_level ?? 0) / gam.xp_for_next) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </Card>
        ) : null}

        {data?.insights?.length ? (
          <Card className="mt-4 p-4">
            <div className="mx-label mb-2">Noticed</div>
            <ul className="space-y-2">
              {data.insights.slice(0, 3).map((ins) => (
                <li key={ins.id} className="text-mx-ink-2 text-[13px]">
                  {ins.text}
                </li>
              ))}
            </ul>
          </Card>
        ) : null}

        {data?.held_back_count ? (
          <Card className="mt-4 p-4">
            <div className="text-mx-ink text-[14px] font-medium">
              {data.held_back_count} held back
            </div>
            <p className="text-mx-muted mt-1 text-[12px]">
              Tasks paused to keep today realistic.
            </p>
          </Card>
        ) : null}
      </div>

      <Toast toast={toast} onDismiss={() => setToast(null)} />
      {openTask ? (
        <TaskSheet task={openTask} onClose={() => setOpenTask(null)} />
      ) : null}
    </div>
  );
}

function EmptyState({
  title,
  body,
  action,
  className = "",
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`bg-mx-surface-light rounded-mx-lg flex flex-col items-center px-6 py-14 text-center ${className}`}
    >
      <div className="font-mx-serif text-mx-ink text-[22px]">{title}</div>
      <p className="text-mx-muted mt-2 max-w-[360px] text-[14px]">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
