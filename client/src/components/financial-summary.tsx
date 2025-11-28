import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { fetchMemberFinancialSummary, fetchMembers } from "@/lib/api";

export function FinancialSummary() {
  const { data: members } = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });

  const meId = members?.find(m => m.name === "You")?.id;

  const { data: summary } = useQuery({
    queryKey: ["financial-summary", meId],
    queryFn: () => fetchMemberFinancialSummary(meId!),
    enabled: !!meId,
  });

  if (!summary) {
    return <div className="grid gap-4 md:grid-cols-3">
      {[1, 2, 3].map(i => (
        <Card key={i} className="md:col-span-1 bg-card border-border/50 shadow-sm animate-pulse">
          <CardHeader className="pb-2">
            <div className="h-4 bg-muted rounded w-24" />
          </CardHeader>
          <CardContent>
            <div className="h-8 bg-muted rounded w-32 mb-2" />
            <div className="h-3 bg-muted rounded w-20" />
          </CardContent>
        </Card>
      ))}
    </div>;
  }

  const toReceive = parseFloat(summary.toReceive);
  const toPay = parseFloat(summary.toPay);
  const netPosition = parseFloat(summary.netPosition);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="md:col-span-1 bg-card border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Net Position
          </CardTitle>
          {netPosition > 0 ? (
            <TrendingUp className="h-4 w-4 text-[hsl(var(--receiving))]" />
          ) : netPosition < 0 ? (
            <TrendingDown className="h-4 w-4 text-[hsl(var(--paying))]" />
          ) : null}
        </CardHeader>
        <CardContent>
          <div className={cn(
            "text-2xl font-bold font-mono tracking-tight",
            netPosition > 0 ? "text-[hsl(var(--receiving))]" : netPosition < 0 ? "text-[hsl(var(--paying))]" : "text-foreground"
          )}>
            {netPosition > 0 ? "+" : ""}{formatCurrency(netPosition)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Across all active sessions
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-1 bg-card border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            To Receive
          </CardTitle>
          <div className="h-2 w-2 rounded-full bg-[hsl(var(--receiving))]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-foreground">
            {formatCurrency(toReceive)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            From other members
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-1 bg-card border-border/50 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            To Pay
          </CardTitle>
          <div className="h-2 w-2 rounded-full bg-[hsl(var(--paying))]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-mono text-foreground">
            {formatCurrency(toPay)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            To other members
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
