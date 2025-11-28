import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { fetchDebts } from "@/lib/api";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowRight } from "lucide-react";

export default function ActivityPage() {
  const { data: debts, isLoading } = useQuery({
    queryKey: ["debts"],
    queryFn: () => fetchDebts(),
  });

  return (
    <Layout>
      <div className="flex flex-col space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight text-primary">Activity</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Transaction history.
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border/50 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-48" />
                  <div className="h-3 bg-muted rounded w-24" />
                </div>
                <div className="h-4 bg-muted rounded w-24" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {debts?.map((debt) => (
              <div key={debt.id} className="flex items-center gap-4 p-4 bg-card rounded-lg border border-border/50">
                <div className="flex -space-x-2">
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarFallback className="text-xs bg-secondary text-muted-foreground">
                      {debt.fromMember.initials}
                    </AvatarFallback>
                  </Avatar>
                  <Avatar className="h-8 w-8 border-2 border-background">
                    <AvatarFallback className="text-xs bg-secondary text-muted-foreground">
                      {debt.toMember.initials}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1">
                  <div className="text-sm flex items-center gap-2">
                    <span className="font-medium">{debt.fromMember.name}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{debt.toMember.name}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {format(new Date(debt.createdAt), "MMM dd, yyyy")}
                  </div>
                </div>
                <div className="font-mono text-sm font-medium">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(parseFloat(debt.amount))}
                </div>
              </div>
            ))}
            {debts?.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">
                No transactions yet.
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
