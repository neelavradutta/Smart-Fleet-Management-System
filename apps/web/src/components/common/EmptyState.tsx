import { Card } from "@/components/common/Card";

export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <Card className="text-center py-10">
      <p className="font-medium text-slate-800">{title}</p>
      {hint ? <p className="text-sm text-slate-500 mt-1">{hint}</p> : null}
    </Card>
  );
}
