import { Moon, Sun, RefreshCw, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { KPICards } from "@/components/KPICards";
import { TrackingTable } from "@/components/TrackingTable";
import { useLogisticsData } from "@/hooks/useLogisticsData";
import { useTheme } from "@/hooks/useTheme";
import { Skeleton } from "@/components/ui/skeleton";

export default function Index() {
  const { data, loading, error, refetch, markAsDelivered } = useLogisticsData();
  const { dark, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary text-primary-foreground">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Logistic Control Center</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={refetch} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggle}>
              {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container py-6 space-y-6">
        {error && !data.length ? (
          <div className="text-center py-20 text-destructive">
            <p className="text-lg font-medium">Failed to load data</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
            <Button className="mt-4" onClick={refetch}>Retry</Button>
          </div>
        ) : loading && !data.length ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))}
            </div>
            <Skeleton className="h-96 rounded-lg" />
          </div>
        ) : (
          <>
            <KPICards data={data} />
            <TrackingTable data={data} onMarkDelivered={markAsDelivered} />
          </>
        )}
      </main>
    </div>
  );
}
