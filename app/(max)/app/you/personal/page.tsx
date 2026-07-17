"use client";

import { useState } from "react";
import api from "@/lib/max/api";
import { useMaxAuth } from "@/context/MaxAuthContext";
import SubPageHeader from "@/components/max/SubPageHeader";
import { Button, Card, Field, Input } from "@/components/max/ui";

function daysSince(iso?: string | null): number {
  if (!iso) return Infinity;
  return (Date.now() - new Date(iso).getTime()) / 86_400_000;
}

export default function PersonalInfoPage() {
  const { user, refreshUser } = useMaxAuth();
  const [firstName, setFirstName] = useState(user?.first_name ?? "");
  const [lastName, setLastName] = useState(user?.last_name ?? "");
  const [username, setUsername] = useState(user?.username ?? "");
  const [note, setNote] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const usernameLocked = daysSince(user?.last_username_change) < 14;

  async function save() {
    setSaving(true);
    setNote(null);
    try {
      const body: Record<string, unknown> = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      };
      if (!usernameLocked && username.trim() !== user?.username) body.username = username.trim();
      await api.updateProfile(body);
      await refreshUser();
      setNote("Saved.");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setNote(detail || "Couldn't save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-[560px]">
      <SubPageHeader title="Personal info" />
      <Card className="p-5">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="First name">
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </Field>
            <Field label="Last name">
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </Field>
          </div>
          <Field
            label="Username"
            hint={usernameLocked ? "You can change this again after 2 weeks." : undefined}
          >
            <Input value={username} onChange={(e) => setUsername(e.target.value)} disabled={usernameLocked} />
          </Field>
          <Field label="Email">
            <Input value={user?.email ?? ""} disabled />
          </Field>
        </div>
      </Card>
      <div className="mt-5 flex items-center gap-3">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save changes"}
        </Button>
        {note ? <span className="text-mx-muted text-[13px]">{note}</span> : null}
      </div>
    </div>
  );
}
