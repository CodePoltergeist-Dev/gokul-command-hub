import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export interface LogisticsRecord {
  "Invoice Date"?: string;
  "Invoice No"?: string | number;
  "Custommer Name"?: string;
  Route?: string;
  Status?: string;
  [key: string]: unknown;
}

const API_URL = "https://gokulsmenon.app.n8n.cloud/webhook/get-client-data";

export function useLogisticsData() {
  const [data, setData] = useState<LogisticsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(Array.isArray(json) ? json : []);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Failed to fetch data";
      setError(msg);
      toast({ title: "Error fetching data", description: msg, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markAsDelivered = async (invoiceNo: string) => {
    // Optimistically update the UI to show immediately without waiting or fetching all data again
    setData((prev) => 
      prev.map((item) =>
        String(item["Invoice No"]) === invoiceNo ? { ...item, Status: "Completed" } : item
      )
    );

    try {
      const res = await fetch("https://gokulsmenon.app.n8n.cloud/webhook/update-delivery-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoice_no: invoiceNo }),
      });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      toast({ title: "Updated", description: `Invoice ${invoiceNo} marked as Delivered.` });
    } catch (e: any) {
      console.error(e);
      // Revert if API fails
      toast({ title: "Update failed", description: `Could not mark as delivered: ${e.message}`, variant: "destructive" });
      await fetchData();
    }
  };

  return { data, loading, error, refetch: fetchData, markAsDelivered };
}
