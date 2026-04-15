import { useState } from "react";
import { Search, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import type { LogisticsRecord } from "@/hooks/useLogisticsData";

interface Props {
  data: LogisticsRecord[];
  onMarkDelivered: (invoiceNo: string) => void;
}

function StatusBadge({ status }: { status: string | undefined }) {
  const s = (status ?? "").toUpperCase();
  if (s === "COMPLETED")
    return <Badge className="bg-success text-success-foreground hover:bg-success/80">Completed</Badge>;
  if (s === "PENDING")
    return <Badge className="bg-warning text-warning-foreground hover:bg-warning/80">Pending</Badge>;
  if (s === "RETURN")
    return <Badge variant="destructive">Return</Badge>;
  return <Badge variant="outline">{status ?? "—"}</Badge>;
}

export function TrackingTable({ data, onMarkDelivered }: Props) {
  const [search, setSearch] = useState("");

  const filtered = data.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (r["Invoice No"] ?? "").toLowerCase().includes(q) ||
      (r["Customer Name"] ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search invoice or customer…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Date</TableHead>
              <TableHead>Invoice No</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r, i) => {
                const inv = r["Invoice No"] ?? `row-${i}`;
                const isCompleted = (r.Status ?? "").toUpperCase() === "COMPLETED";
                return (
                  <TableRow key={inv}>
                    <TableCell className="whitespace-nowrap">{r.Date ?? "—"}</TableCell>
                    <TableCell className="font-medium">{inv}</TableCell>
                    <TableCell>{r["Customer Name"] ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {r.From ?? "—"} → {r.To ?? "—"}
                    </TableCell>
                    <TableCell><StatusBadge status={r.Status} /></TableCell>
                    <TableCell className="text-right">
                      {!isCompleted && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onMarkDelivered(inv)}
                          className="gap-1.5"
                        >
                          <CheckCircle className="h-3.5 w-3.5" />
                          Mark Delivered
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
