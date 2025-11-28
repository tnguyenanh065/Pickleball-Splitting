import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { fetchDebts, fetchMembers } from "@/lib/api";
import { Link } from "wouter";

export function DebtBreakdown() {
  const { data: members } = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });

  const meId = members?.find(m => m.name === "You")?.id;

  const { data: debts, isLoading } = useQuery({
    queryKey: ["debts", meId],
    queryFn: () => fetchDebts(meId),
    enabled: !!meId,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  if (isLoading) {
    return (
      <Card className="h-full border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-display font-medium">Debt Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 bg-muted rounded w-24" />
                    <div className="h-3 bg-muted rounded w-32" />
                  </div>
                </div>
                <div className="h-4 bg-muted rounded w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeDebts = debts?.filter(d => d.status === "pending") || [];

  return (
    <Card className="h-full border-border/50 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-display font-medium">Debt Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activeDebts.map(debt => {
            const isOwedToMe = debt.toMemberId === meId;
            const otherUser = isOwedToMe ? debt.fromMember : debt.toMember;
            
            return (
              <Link key={debt.id} href={`/members/${otherUser.id}`}>
                <div className="flex items-center justify-between group cursor-pointer hover:bg-secondary/50 -mx-2 px-2 py-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-border bg-secondary">
                      <AvatarFallback className="text-xs font-medium text-muted-foreground">
                        {otherUser.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {otherUser.name}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className={cn(
                          "inline-block w-1.5 h-1.5 rounded-full",
                           isOwedToMe ? "bg-[hsl(var(--receiving))]" : "bg-[hsl(var(--paying))]"
                        )} />
                        {isOwedToMe ? "Owes you" : "You owe"}
                        <span className="text-muted-foreground/60 mx-1">•</span>
                        <span>{formatDistanceToNow(new Date(debt.createdAt))} ago</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="font-mono text-sm font-medium">
                      {formatCurrency(parseFloat(debt.amount))}
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </Link>
            );
          })}
          
          {activeDebts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              All settled up! No active debts.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
