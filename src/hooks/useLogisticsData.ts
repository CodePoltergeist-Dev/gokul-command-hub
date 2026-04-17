import { useState, useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export interface LogisticsRecord {
  "Invoice Date"?: string;
  "Delivery Date"?: string;
  "Invoice No"?: string | number;
  "Custommer Name"?: string;
  Route?: string;
  "No. of Boxes Invoiced"?: number | string;
  Status?: string;
  "Return Status"?: string;
  "Returned Boxes"?: number | string;
  "Reason for Return"?: string;
  POD?: string;
  
  // PnL info
  "Total invoice"?: number | string;
  "Revenue from boxes (in Rs)"?: number | string;
  "Revenue from Bilty (in Rs)"?: number | string;
  "Vehicle type"?: string;
  "Vehicle number"?: string;
  "Vehicle cost"?: number | string;
  "Driver Cost"?: number | string;
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
      
      const parsedData = (Array.isArray(json) ? json : []).map((item) => ({
        ...item,
        "Invoice Date": item["Invoice date"] ?? item["Invoice Date"],
        "Delivery Date": item["Delivery date"] ?? item["Delivery Date"],
        "Invoice No": item["Invoice no"] ?? item["Invoice No"],
        "Custommer Name": item["Customer name"] ?? item["Custommer Name"],
        "Route": item["ROUTE"] ?? item.Route ?? item.route,
        "Status": item["Delivery Status\nCompleted/ Return/ Partial Return"] ?? item["Delivery Status"] ?? item.Status,
        "Vehicle number": item["Vehicle no"] ?? item["Vehicle number"],
        "Reason for Return": item["Reason for Return/ Partial Return"] ?? item["Reason for Return"],
        "Return Status": item["If Return/ Partial Return, No. of boxes"] ?? item["Return Status"],
      }));
      
      setData(parsedData);
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
