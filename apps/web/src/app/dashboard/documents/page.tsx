"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/common/Card";
import { Badge } from "@/components/common/Badge";
import { PageHero } from "@/components/common/PageHero";

type Doc = {
  id: string;
  title: string;
  docType: string;
  expiresAt: string | null;
  fileUrl: string;
};

export default function DocumentsPage() {
  const [rows, setRows] = useState<Doc[]>([]);
  const [expiring, setExpiring] = useState<Doc[]>([]);

  useEffect(() => {
    Promise.all([
      api<{ data: Doc[] }>("/api/v1/documents"),
      api<{ data: Doc[] }>("/api/v1/documents/expiring"),
    ])
      .then(([a, b]) => {
        setRows(a.data);
        setExpiring(b.data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="space-y-6">
      <PageHero
        theme="lilac"
        title="Document vault"
        subtitle="License / insurance / RC — expiry reminders."
      />
      {expiring.length ? (
        <Card className="border-amber-200 bg-amber-50">
          <p className="font-medium text-amber-800">
            {expiring.length} document(s) expiring within 30 days
          </p>
        </Card>
      ) : null}
      <div className="grid md:grid-cols-2 gap-4">
        {rows.length === 0 ? (
          <Card>
            <p className="text-slate-500 text-sm">
              No documents yet — upload via API `POST /api/v1/documents`.
            </p>
          </Card>
        ) : (
          rows.map((d) => (
            <Card key={d.id} hover>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-slate-900">{d.title}</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Expires {d.expiresAt ?? "—"}
                  </p>
                </div>
                <Badge>{d.docType}</Badge>
              </div>
              <a
                href={d.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-3 text-sm font-medium text-brand-600"
              >
                Open file →
              </a>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
