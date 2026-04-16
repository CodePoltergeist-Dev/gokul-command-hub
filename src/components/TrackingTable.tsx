import { useState } from "react";
import { Search, CheckCircle, Eye, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  const [selectedRecord, setSelectedRecord] = useState<LogisticsRecord | null>(null);

  const filtered = data.filter((r) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      String(r["Invoice No"] ?? "").toLowerCase().includes(q) ||
      String(r["Custommer Name"] ?? "").toLowerCase().includes(q)
    );
  });

  const exportPDF = () => {
    const doc = new jsPDF();
    const title = "Daily Delivery Report";
    const dateStr = new Date().toLocaleDateString();

    const total = filtered.length;
    const completed = filtered.filter((r) => String(r.Status || "").toUpperCase() === "COMPLETED").length;
    const podCompliant = filtered.filter((r) => r.POD && String(r.POD).trim() !== "").length;
    const deliveryPct = total ? ((completed / total) * 100).toFixed(1) : "0";
    const podPct = total ? ((podCompliant / total) * 100).toFixed(1) : "0";

    doc.setFontSize(20);
    doc.text(title, 14, 22);

    doc.setFontSize(11);
    doc.text(`Generated: ${dateStr}`, 14, 30);
    doc.text(`Delivery Complete: ${deliveryPct}% (${completed}/${total})`, 14, 36);
    doc.text(`POD Compliance: ${podPct}% (${podCompliant}/${total})`, 14, 42);

    const tableData = filtered.map((r, i) => [
      r["Invoice Date"] ?? "—",
      r["Delivery Date"] ?? "—",
      r["Invoice No"] ?? `row-${i}`,
      r["Custommer Name"] ?? "—",
      r.Route ?? "—",
      r["No. of Boxes Invoiced"] ?? "—",
      r.Status ?? "—",
      r.POD ? "Yes" : "No"
    ]);

    autoTable(doc, {
      startY: 50,
      head: [["Inv Date", "Del Date", "Inv No", "Customer", "Route", "Boxes", "Status", "POD"]],
      body: tableData,
    });

    doc.save(`DDR_Report_${dateStr.replace(/\//g, "-")}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoice or customer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" className="gap-2" onClick={exportPDF}>
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
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
                const inv = String(r["Invoice No"] ?? `row-${i}`);
                const isCompleted = String(r.Status ?? "").toUpperCase() === "COMPLETED";
                return (
                  <TableRow key={inv} className="hover:bg-muted/30 transition-colors">
                    <TableCell className="whitespace-nowrap">{r["Invoice Date"] ?? "—"}</TableCell>
                    <TableCell 
                      className="font-medium text-primary cursor-pointer hover:underline"
                      onClick={() => setSelectedRecord(r)}
                    >
                      {inv}
                    </TableCell>
                    <TableCell>{r["Custommer Name"] ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {r.Route ?? "—"}
                    </TableCell>
                    <TableCell><StatusBadge status={r.Status} /></TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedRecord(r)}
                          className="h-8 w-8 p-0"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
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
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Invoice Details: {selectedRecord ? selectedRecord["Invoice No"] : ""}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 py-4 max-h-[60vh] overflow-y-auto pr-4">
            {selectedRecord && Object.entries(selectedRecord)
              .filter(([key, val]) => key !== "row_number" && val !== undefined && val !== "")
              .map(([key, val]) => (
                <div key={key} className="grid grid-cols-[160px_1fr] items-start gap-4 p-2 rounded-md hover:bg-muted/50 transition-colors">
                  <span className="text-sm font-medium text-muted-foreground break-words">{key}</span>
                  <span className="text-sm font-semibold break-words">{String(val)}</span>
                </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
