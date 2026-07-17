"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/max/api";
import SubPageHeader from "@/components/max/SubPageHeader";
import { Card, Spinner } from "@/components/max/ui";

export default function MyProductsPage() {
  const q = useQuery({ queryKey: ["myProducts"], queryFn: () => api.getMyProducts() });
  const raw = q.data as { products?: unknown[] } | unknown[] | undefined;
  const products = (Array.isArray(raw) ? raw : raw?.products) ?? [];

  return (
    <div className="mx-auto max-w-[560px]">
      <SubPageHeader title="My products" />
      {q.isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : products.length === 0 ? (
        <Card className="px-4 py-10 text-center">
          <p className="text-mx-muted text-[14px]">
            Products Max recommends for you will show up here after a scan or a coach chat.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {(products as { name?: string; brand?: string; url?: string; image?: string }[]).map(
            (p, i) => (
              <a
                key={i}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-mx-card border-mx-border hover:border-mx-accent flex items-center gap-3 rounded-mx-lg border p-3 transition"
              >
                {p.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={api.resolveAttachmentUrl(p.image)}
                    alt=""
                    className="size-12 rounded-md object-cover"
                  />
                ) : null}
                <div className="min-w-0">
                  <div className="text-mx-ink truncate text-[14px] font-medium">{p.name}</div>
                  {p.brand ? <div className="text-mx-muted text-[12px]">{p.brand}</div> : null}
                </div>
              </a>
            ),
          )}
        </div>
      )}
    </div>
  );
}
