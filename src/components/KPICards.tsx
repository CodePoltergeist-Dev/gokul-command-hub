import { FileText, CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { LogisticsRecord } from "@/hooks/useLogisticsData";

interface Props {
  data: LogisticsRecord[];
}

export function KPICards({ data }: Props) {
  const total = data.length;
  const completed = data.filter((r) => String(r.Status || "").toUpperCase() === "COMPLETED").length;
  const podCompliant = data.filter((r) => r.POD && String(r.POD).trim() !== "").length;
  const pending = data.filter((r) => String(r.Status || "").toUpperCase() === "PENDING").length;

  const deliveryPct = total ? ((completed / total) * 100).toFixed(1) : "0";
  const podPct = total ? ((podCompliant / total) * 100).toFixed(1) : "0";

  const cards = [
    { label: "Total Invoices", value: total, icon: FileText, color: "text-primary" },
    { label: "Delivery Success", value: `${deliveryPct}%`, icon: CheckCircle2, color: "text-success" },
    { label: "POD Compliance", value: `${podPct}%`, icon: ShieldCheck, color: "text-warning" },
    { label: "Active Shipments", value: pending, icon: Truck, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => (
        <Card key={c.label} className="border-border/50">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`p-3 rounded-lg bg-secondary ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{c.label}</p>
              <p className="text-2xl font-bold tracking-tight">{c.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
