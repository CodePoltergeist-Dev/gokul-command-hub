import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export interface LogisticsRecord {
  Date?: string;
  "Invoice No"?: string;
  "Customer Name"?: string;
  From?: string;
  To?: string;
  Status?: string;
  POD?: string;
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
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ "Invoice No": invoiceNo, Status: "Completed" }),
      });
      toast({ title: "Updated", description: `Invoice ${invoiceNo} marked as Delivered.` });
      await fetchData();
    } catch {
      toast({ title: "Update failed", description: "Could not mark as delivered.", variant: "destructive" });
    }
  };

  return { data, loading, error, refetch: fetchData, markAsDelivered };
}
