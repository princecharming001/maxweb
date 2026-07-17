"use client";

import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/max/api";
import { queryKeys } from "@/lib/max/queryClient";
import SubPageHeader from "@/components/max/SubPageHeader";
import { Button, Spinner } from "@/components/max/ui";
import { Icon } from "@/components/max/icons";

interface Photo {
  id: string;
  url?: string;
  image_url?: string;
  created_at?: string;
}

export default function PhotosPage() {
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const q = useQuery({
    queryKey: queryKeys.progressPhotos,
    queryFn: () => api.getProgressPhotos(),
  });
  const raw = q.data as { photos?: Photo[] } | Photo[] | undefined;
  const photos: Photo[] = Array.isArray(raw) ? raw : (raw?.photos ?? []);

  const del = useMutation({
    mutationFn: (id: string) => api.deleteProgressPhoto(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.progressPhotos }),
  });

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      await api.uploadProgressPhotoBlob(file);
      qc.invalidateQueries({ queryKey: queryKeys.progressPhotos });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="mx-auto max-w-[720px]">
      <SubPageHeader title="Progress photos" />

      <div className="mb-5">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onFile}
        />
        <Button
          variant="accent"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
        >
          <Icon name="plus" className="size-4" /> {busy ? "Uploading…" : "Add photo"}
        </Button>
      </div>

      {q.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : photos.length === 0 ? (
        <p className="text-mx-muted text-[14px]">
          Track your progress over time — add your first photo.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((p) => {
            const src = api.resolveAttachmentUrl(p.url || p.image_url);
            return (
              <div
                key={p.id}
                className="rounded-mx-md border border-mx-border group relative overflow-hidden"
              >
                <div className="bg-mx-surface aspect-[3/4]">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt="" className="size-full object-cover" />
                  ) : null}
                </div>
                <button
                  onClick={() => {
                    if (confirm("Delete this photo?")) del.mutate(p.id);
                  }}
                  className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 transition group-hover:opacity-100"
                  aria-label="Delete"
                >
                  <Icon name="close" className="size-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
