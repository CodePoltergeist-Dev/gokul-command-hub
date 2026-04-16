import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import type { LogisticsRecord } from "@/hooks/useLogisticsData";

interface Props {
  data: LogisticsRecord[];
}

export function PnLTable({ data }: Props) {
  const [search, setSearch] = useState("");

  const filtered = data.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(r["Invoice No"] ?? "").toLowerCase().includes(q) ||
      String(r["Vehicle number"] ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search invoice or vehicle…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead>Invoice Date</TableHead>
              <TableHead>Invoice No</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>Boxes</TableHead>
              <TableHead>Rev (Bilty/Boxes)</TableHead>
              <TableHead>Vehicle Type</TableHead>
              <TableHead>Cost (Veh/Driver)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((r, i) => {
                const inv = String(r["Invoice No"] ?? `row-${i}`);
                const revBoxes = Number(r["Revenue from boxes (in Rs)"]) || 0;
                const revBilty = Number(r["Revenue from Bilty (in Rs)"]) || 0;
                const costVeh = Number(r["Vehicle cost"]) || 0;
                const costDriver = Number(r["Driver Cost"]) || 0;
                const boxes = Number(r["No. of Boxes Invoiced"]) || 0;

                return (
                  <TableRow key={inv} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="whitespace-nowrap">{r["Invoice Date"] ?? "—"}</TableCell>
                    <TableCell className="font-medium">{inv}</TableCell>
                    <TableCell className="whitespace-nowrap">{r.Route ?? "—"}</TableCell>
                    <TableCell>{boxes > 0 ? boxes : "—"}</TableCell>
                    <TableCell>₹{revBilty} / ₹{revBoxes}</TableCell>
                    <TableCell>{r["Vehicle type"] ?? "—"} ({r["Vehicle number"] ?? "—"})</TableCell>
                    <TableCell className="text-destructive">₹{costVeh} / ₹{costDriver}</TableCell>
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