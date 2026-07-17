"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/max/api";
import { useMaxAuth } from "@/context/MaxAuthContext";
import SubPageHeader from "@/components/max/SubPageHeader";
import { Button, Card, Input } from "@/components/max/ui";
import { Icon } from "@/components/max/icons";

/** Settings — sectioned menu mirroring iOS SettingsScreen. Coaching tone +
 *  response length intentionally live in the chat drawer, not here. */
export default function SettingsPage() {
  const { user, isPaid, logout, deleteAccount } = useMaxAuth();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [password, setPassword] = useState("");

  const isOAuth = user?.auth_provider && user.auth_provider !== "password";

  const googleQ = useQuery({
    queryKey: ["googleStatus"],
    queryFn: () => api.getGoogleStatus(),
  });
  const showCalendar = !!(googleQ.data as { calendar_link_enabled?: boolean })?.calendar_link_enabled;

  async function doDelete() {
    try {
      await deleteAccount(isOAuth ? undefined : password);
      router.replace("/");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      alert(detail || "Couldn't delete the account.");
    }
  }

  return (
    <div className="mx-auto max-w-[560px]">
      <SubPageHeader title="Settings" />

      {isPaid ? (
        <Group title="Membership">
          <Row href="/app/you/subscription" label="Manage subscription" />
        </Group>
      ) : null}

      <Group title="Coaching">
        <Row href="/app/you/lifestyle" label="Edit lifestyle" sub="Your goals & habits" />
        <Row href="/app/you/products" label="My products" />
        {showCalendar ? <Row href="/app/you/settings" label="Google Calendar" /> : null}
      </Group>

      <Group title="Profile">
        <Row href="/app/you/personal" label="Edit personal info" />
      </Group>

      <Group title="Support">
        <RowExternal href="mailto:hello@usemaxapp.com" label="Contact support" />
        <Row href="/legal/privacy" label="Privacy policy" />
        <Row href="/legal/terms" label="Terms of service" />
      </Group>

      {/* Account & Data */}
      <div className="mt-8">
        <div className="mx-label mb-2">Account &amp; Data</div>
        <div className="overflow-hidden rounded-mx-lg border border-mx-border">
          <button
            onClick={() => {
              logout();
              router.replace("/login");
            }}
            className="hover:bg-mx-surface flex w-full items-center justify-between px-4 py-3.5 text-left"
          >
            <span className="text-mx-ink text-[15px]">Sign out</span>
            <Icon name="logout" className="text-mx-muted size-4" />
          </button>
          <button
            onClick={() => setConfirming(true)}
            className="border-mx-border hover:bg-mx-surface flex w-full items-center justify-between border-t px-4 py-3.5 text-left"
          >
            <span className="text-mx-error text-[15px]">Delete account</span>
          </button>
        </div>
      </div>

      <p className="text-mx-muted mt-6 text-center text-[12px]">Max · web</p>

      {confirming ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setConfirming(false)} />
          <Card className="relative w-full max-w-[360px] p-5">
            <p className="text-mx-ink text-[15px] font-semibold">Delete your account?</p>
            <p className="text-mx-muted mt-1 text-[13px]">
              This permanently removes your plan, scans, and progress.
            </p>
            {!isOAuth ? (
              <div className="mt-3">
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            ) : null}
            <div className="mt-4 flex gap-2">
              <Button variant="danger" size="sm" onClick={doDelete}>
                Delete permanently
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setConfirming(false)}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <div className="mx-label mb-2">{title}</div>
      <div className="overflow-hidden rounded-mx-lg border border-mx-border [&>*+*]:border-mx-border [&>*+*]:border-t">
        {children}
      </div>
    </div>
  );
}
function Row({ href, label, sub }: { href: string; label: string; sub?: string }) {
  return (
    <Link href={href} className="hover:bg-mx-surface flex items-center justify-between px-4 py-3.5 transition">
      <div>
        <div className="text-mx-ink text-[15px]">{label}</div>
        {sub ? <div className="text-mx-muted text-[13px]">{sub}</div> : null}
      </div>
      <Icon name="chevron" className="text-mx-muted size-4" />
    </Link>
  );
}
function RowExternal({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="hover:bg-mx-surface flex items-center justify-between px-4 py-3.5 transition">
      <span className="text-mx-ink text-[15px]">{label}</span>
      <Icon name="chevron" className="text-mx-muted size-4" />
    </a>
  );
}
